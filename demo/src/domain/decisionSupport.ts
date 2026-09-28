import {
  ALL_STATES, BASIS_SCENARIOS, CONTRACT_VIEWS, contractView, costCents,
  payoffOf, pnlVector, portfolioAt, scenarioRows,
  type Position, type Scenario, type WorldState,
} from './engine';

// A new holding can split book-specific rows. Use the universe-wide partition
// for every comparison, so a trade never changes the denominator.
export const COMPARISON_SCENARIOS = BASIS_SCENARIOS.map(scenario => ({
  scenario, index: ALL_STATES.indexOf(scenario.representative),
}));

export function scenarioTitle(state: WorldState): string {
  const decision = (bp: number) => bp === 0 ? 'holds' : `${bp < 0 ? 'cuts' : 'hikes'} ${Math.abs(bp)} bp`;
  return `October ${decision(state.october)} · December ${decision(state.december)}`;
}

export function pathDetail(state: WorldState): string {
  const windows = [[state.interSepOct, 'before October'], [state.interOctDec, 'between meetings'], [state.postDec, 'after December']] as const;
  const moves = windows.filter(([bp]) => bp !== 0).map(([bp, when]) => `${bp > 0 ? '+' : '−'}${Math.abs(bp)} bp ${when}`);
  return moves.length ? moves.join(' · ') : 'No inter-meeting moves';
}

export function vulnerabilities(positions: Position[]) {
  return scenarioRows(positions)
    .filter(row => row.pnlCents < 0)
    .sort((a, b) => a.pnlCents - b.pnlCents || a.scenario.complexity - b.scenario.complexity)
    .slice(0, 3)
    .map(row => {
      const index = ALL_STATES.indexOf(row.scenario.representative);
      const grouped = new Map<string, { contractId: string; name: string; pnlCents: number }>();
      for (const result of portfolioAt(positions, index).rows) {
        const p = result.position;
        const key = `${p.contract_id}:${p.side}`;
        const existing = grouped.get(key);
        if (existing) existing.pnlCents += result.pnlCents;
        else grouped.set(key, { contractId: p.contract_id, name: `${p.side} ${contractView(p.contract_id).authored.shortName}`, pnlCents: result.pnlCents });
      }
      const contributors = [...grouped.values()].filter(r => r.pnlCents < 0).sort((a, b) => a.pnlCents - b.pnlCents).slice(0, 2);
      return { ...row, index, contributors };
    });
}

export type OutcomeMetrics = { worstCents: number; bestCents: number; profitable: number; losing: number };

export function outcomeMetrics(pnls: readonly number[]): OutcomeMetrics {
  return {
    worstCents: Math.min(...pnls), bestCents: Math.max(...pnls),
    profitable: pnls.filter(p => p > 0).length, losing: pnls.filter(p => p < 0).length,
  };
}

export function comparisonPnls(positions: Position[]): number[] {
  const vector = pnlVector(positions, ALL_STATES.length);
  return COMPARISON_SCENARIOS.map(({ index }) => vector[index]);
}

export type ScenarioChange = { scenario: Scenario; index: number; before: number; after: number; delta: number };

export function compareTrade(positions: Position[], trade: Position | null) {
  const beforePnls = comparisonPnls(positions);
  const afterPnls = trade ? comparisonPnls([...positions, trade]) : beforePnls;
  const changes: ScenarioChange[] = COMPARISON_SCENARIOS.map(({ scenario, index }, i) => ({
    scenario, index, before: beforePnls[i], after: afterPnls[i], delta: afterPnls[i] - beforePnls[i],
  }));
  const simpleFirst = (a: ScenarioChange, b: ScenarioChange) => a.scenario.complexity - b.scenario.complexity;
  return {
    before: outcomeMetrics(beforePnls), after: outcomeMetrics(afterPnls),
    newlyProfitable: changes.filter(r => r.before <= 0 && r.after > 0).length,
    noLongerProfitable: changes.filter(r => r.before > 0 && r.after <= 0).length,
    improved: changes.filter(r => r.delta > 0).sort((a, b) => b.delta - a.delta || simpleFirst(a, b)),
    worsened: changes.filter(r => r.delta < 0).sort((a, b) => a.delta - b.delta || simpleFirst(a, b)),
    worst: [...changes].sort((a, b) => a.after - b.after || simpleFirst(a, b))[0],
  };
}

export type TradeObjective = 'downside' | 'coverage' | 'target';
export const MAX_SUGGESTED_QUANTITY = 250_000;
export const SIZE_FRACTIONS = [0.25, 0.5, 0.75, 1] as const;

export function parseTradeInputs(quantityText: string, priceText: string) {
  if (!/^\d+$/.test(quantityText) || !/^(?:0?\.\d{1,4})$/.test(priceText)) return null;
  const quantity = Number(quantityText);
  const priceX4 = Math.round(Number(priceText) * 10_000);
  if (!Number.isSafeInteger(quantity * 10_000) || quantity <= 0 || priceX4 <= 0 || priceX4 >= 10_000 || (quantity * priceX4) % 100 !== 0) return null;
  return { quantity, priceX4 };
}

// Indicative snapshot marks, not executable quotes. Match the outcome label
// rather than assuming array order or synthesizing the NO price.
export function snapshotPrice(contractId: string, side: Position['side']): number | null {
  const c = contractView(contractId).contract;
  const index = c.outcomes.findIndex(outcome => outcome.toUpperCase() === side);
  const raw = c.resolution.outcome_prices[index];
  if (raw === undefined || raw === null || raw === '') return null;
  const price = Number(raw);
  if (!Number.isFinite(price) || price <= 0 || price >= 1) return null;
  const x4 = Math.round(price * 10_000);
  return x4 > 0 && x4 < 10_000 ? x4 : null;
}

export type TradeSuggestion = {
  id: string; trade: Position; costCents: number; after: OutcomeMetrics;
  worstImprovement: number; coverageGain: number; targetImprovement: number;
};

export function suggestTrades(positions: Position[], budgetCents: number, objective: TradeObjective, targetIndex: number | null = null) {
  if (!Number.isSafeInteger(budgetCents) || budgetCents <= 0 || (objective === 'target' && targetIndex === null)) return [];
  const beforePnls = comparisonPnls(positions);
  const before = outcomeMetrics(beforePnls);
  const candidates: TradeSuggestion[] = [];
  const score = (c: TradeSuggestion) => objective === 'downside' ? c.worstImprovement : objective === 'coverage' ? c.coverageGain : c.targetImprovement;
  const rank = (a: TradeSuggestion, b: TradeSuggestion) => score(b) - score(a)
    || b.worstImprovement - a.worstImprovement || b.coverageGain - a.coverageGain
    || a.costCents - b.costCents || a.id.localeCompare(b.id);

  for (const view of CONTRACT_VIEWS) {
    if (!view.authored.claim || view.degenerate || view.contract.closed) continue;
    const column = payoffOf(view.contract.contract_id);
    for (const side of ['YES', 'NO'] as const) {
      const entryPrice = snapshotPrice(view.contract.contract_id, side);
      if (entryPrice === null) continue;
      const maxQuantity = Math.min(MAX_SUGGESTED_QUANTITY, Math.floor(budgetCents * 100 / entryPrice));
      // Lots of 100 keep every snapshot price exact in whole cents.
      const quantities = new Set(SIZE_FRACTIONS.map(f => Math.floor(maxQuantity * f / 100) * 100));
      const sizes: TradeSuggestion[] = [];
      for (const quantity of quantities) {
        if (quantity <= 0) continue;
        const trade: Position = { position_id: 'proposed', contract_id: view.contract.contract_id, side, quantity, entry_price_x4: entryPrice, entry_price_text: String(entryPrice / 10_000) };
        const cost = costCents(trade);
        if (cost > budgetCents) continue;
        const delta = (index: number) => quantity * (side === 'YES' ? column[index] : 1 - column[index]) * 100 - cost;
        const after = outcomeMetrics(COMPARISON_SCENARIOS.map(({ index }, i) => beforePnls[i] + delta(index)));
        const candidate = {
          id: `${trade.contract_id}:${side}:${quantity}`, trade, costCents: cost, after,
          worstImprovement: after.worstCents - before.worstCents,
          coverageGain: after.profitable - before.profitable,
          targetImprovement: targetIndex === null ? 0 : delta(targetIndex),
        };
        if (score(candidate) > 0) sizes.push(candidate);
      }
      // Show the best tested size per contract/side, not four variants of it.
      sizes.sort(rank);
      if (sizes[0]) candidates.push(sizes[0]);
    }
  }
  return candidates.sort(rank).slice(0, 3);
}
