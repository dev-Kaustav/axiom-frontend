import { describe, expect, it } from 'vitest';
import { ALL_STATES, POSITIONS, PROPOSED_TRADE, contractView, costCents, pnlVector, portfolioAt, scenarioRows, tradeAsPosition } from './engine';
import { COMPARISON_SCENARIOS, MAX_SUGGESTED_QUANTITY, compareTrade, comparisonPnls, parseTradeInputs, snapshotPrice, suggestTrades, vulnerabilities } from './decisionSupport';

const proposed = tradeAsPosition(PROPOSED_TRADE);

describe('comparable scenarios', () => {
  it('keeps a fixed denominator when an added contract splits book outcomes', () => {
    expect(scenarioRows([...POSITIONS, proposed]).length).toBeGreaterThan(scenarioRows(POSITIONS).length);
    expect(comparisonPnls(POSITIONS)).toHaveLength(COMPARISON_SCENARIOS.length);
    expect(comparisonPnls([...POSITIONS, proposed])).toHaveLength(COMPARISON_SCENARIOS.length);
  });

  it('keeps every raw world and reproduces whole-world extrema', () => {
    const indices = COMPARISON_SCENARIOS.flatMap(row => row.scenario.memberIndices);
    expect(new Set(indices).size).toBe(ALL_STATES.length);
    expect(indices).toHaveLength(ALL_STATES.length);
    const raw = pnlVector([...POSITIONS, proposed], ALL_STATES.length);
    const comparison = compareTrade(POSITIONS, proposed);
    expect(comparison.after.worstCents).toBe(Math.min(...raw));
    expect(comparison.after.bestCents).toBe(Math.max(...raw));
  });

  it('matches states by identity and includes premium in every delta', () => {
    const comparison = compareTrade(POSITIONS, proposed);
    expect(comparison.improved.length).toBeGreaterThan(0);
    expect(comparison.worsened.length).toBeGreaterThan(0);
    for (const change of [...comparison.improved, ...comparison.worsened]) {
      expect(change.before).toBe(portfolioAt(POSITIONS, change.index).pnlCents);
      expect(change.after).toBe(portfolioAt([...POSITIONS, proposed], change.index).pnlCents);
      expect(change.delta).toBe(portfolioAt([proposed], change.index).pnlCents);
    }
    expect(comparison.newlyProfitable - comparison.noLongerProfitable).toBe(comparison.after.profitable - comparison.before.profitable);
  });

  it('keeps the no-trade baseline unchanged', () => {
    const comparison = compareTrade(POSITIONS, null);
    expect(comparison.before).toEqual(comparison.after);
    expect(comparison.improved).toEqual([]);
    expect(comparison.worsened).toEqual([]);
    expect(comparison.newlyProfitable).toBe(0);
    expect(comparison.noLongerProfitable).toBe(0);
  });
});

describe('portfolio-aware suggestions', () => {
  it.each(['downside', 'coverage', 'target'] as const)('ranks %s candidates that improve their objective', objective => {
    const target = vulnerabilities(POSITIONS)[0].index;
    const suggestions = suggestTrades(POSITIONS, 2_500_000, objective, target);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(3);
    expect(new Set(suggestions.map(s => `${s.trade.contract_id}:${s.trade.side}`)).size).toBe(suggestions.length);
    let previousScore = Infinity;
    for (const s of suggestions) {
      const v = contractView(s.trade.contract_id);
      expect(v.contract.closed).toBe(false);
      expect(v.authored.claim).not.toBeNull();
      expect(v.degenerate).toBeUndefined();
      expect(s.trade.quantity).toBeLessThanOrEqual(MAX_SUGGESTED_QUANTITY);
      expect(s.trade.quantity % 100).toBe(0);
      expect(s.costCents).toBe(costCents(s.trade));
      expect(s.costCents).toBeLessThanOrEqual(2_500_000);
      const comparison = compareTrade(POSITIONS, s.trade);
      expect(s.after).toEqual(comparison.after);
      expect(s.worstImprovement).toBe(comparison.after.worstCents - comparison.before.worstCents);
      expect(s.coverageGain).toBe(comparison.newlyProfitable - comparison.noLongerProfitable);
      expect(s.targetImprovement).toBe(portfolioAt([s.trade], target).pnlCents);
      const score = objective === 'downside' ? s.worstImprovement : objective === 'coverage' ? s.coverageGain : s.targetImprovement;
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(previousScore);
      previousScore = score;
    }
  });

  it('handles zero budget and missing target without inventing a candidate', () => {
    expect(suggestTrades(POSITIONS, 0, 'downside')).toEqual([]);
    expect(suggestTrades(POSITIONS, 1000, 'target')).toEqual([]);
    expect(suggestTrades(POSITIONS, NaN, 'coverage')).toEqual([]);
  });

  it('uses the captured YES and NO outcome marks', () => {
    expect(snapshotPrice('3215006', 'YES')).toBe(175);
    expect(snapshotPrice('3215006', 'NO')).toBe(9825);
  });

  it('recomputes the shortlist when capital changes', () => {
    const small = suggestTrades(POSITIONS, 500_000, 'coverage');
    const large = suggestTrades(POSITIONS, 10_000_000, 'coverage');
    expect(small.every(s => s.costCents <= 500_000)).toBe(true);
    expect(large[0].coverageGain).toBeGreaterThanOrEqual(small[0].coverageGain);
    expect(large.map(s => s.id)).not.toEqual(small.map(s => s.id));
  });
});

describe('exposure diagnosis', () => {
  it('ranks actual losses and aggregates repeated lots before attributing them', () => {
    const risks = vulnerabilities(POSITIONS);
    expect(risks).toHaveLength(3);
    expect(risks[0].pnlCents).toBe(Math.min(...pnlVector(POSITIONS, ALL_STATES.length)));
    expect(risks.map(r => r.pnlCents)).toEqual(risks.map(r => r.pnlCents).sort((a, b) => a - b));
    for (const risk of risks) {
      expect(ALL_STATES[risk.index]).toBe(risk.scenario.representative);
      expect(portfolioAt(POSITIONS, risk.index).pnlCents).toBe(risk.pnlCents);
    }
    const december = risks[0].contributors.find(c => c.contractId === '3215008');
    expect(december?.pnlCents).toBe(-23_500_000);
  });
});

describe('custom trade precision', () => {
  it.each(['0.02', '0.005', '.0175'])('accepts exact price %s', price => {
    expect(parseTradeInputs('200000', price)).not.toBeNull();
  });
  it.each(['0', '1', '-.1', '0.00001', 'NaN', 'Infinity', '1e-2'])('rejects unsupported price %s', price => {
    expect(parseTradeInputs('200000', price)).toBeNull();
  });
  it.each(['0', '-1', '1.2', '1e5', '9007199254740992'])('rejects unsupported quantity %s', quantity => {
    expect(parseTradeInputs(quantity, '0.02')).toBeNull();
  });
  it('rejects fractional-cent costs', () => {
    expect(parseTradeInputs('1', '0.005')).toBeNull();
    expect(parseTradeInputs('2', '0.005')).toEqual({ quantity: 2, priceX4: 50 });
  });
});
