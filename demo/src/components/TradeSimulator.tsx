import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Info, Plus, RotateCcw } from 'lucide-react';
import { OutcomeChart } from './OutcomeChart';
import { Panel, Badge } from './primitives';
import { ContributionTable } from './ScenarioExplorer';
import { clockTime } from './MarketPanels';
import { NewTradeDialog, type TradeDraft, type TicketSeed } from './NewTradeDialog';
import {
  ALL_STATES, PROPOSED_TRADE, SNAPSHOT, contractView, costCents,
  money, portfolioAt, rankedOffsets, type Position,
} from '../domain/engine';
import {
  COMPARISON_SCENARIOS, comparisonPnls, compareTrade, pathDetail, scenarioTitle, suggestTrades,
  snapshotPrice, type ScenarioChange, type TradeObjective, type TradeSuggestion,
} from '../domain/decisionSupport';

const tradePrice = (x4: number) => `${(x4 / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}¢`;
const signedCount = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}`;
const tone = (n: number) => n > 0 ? 'positive' : n < 0 ? 'negative' : 'muted';
const OBJECTIVES = [
  ['downside', 'Reduce worst-case loss'], ['coverage', 'More profitable scenarios'],
] as const;
const BUDGETS = [5_000, 25_000, 50_000, 100_000];
const IDEA_LIMIT = 6;
const ideaKey = (s: TradeSuggestion) => `${s.trade.contract_id}:${s.trade.side}`;
const shortMoney = (dollars: number) => `$${dollars >= 1000 ? `${dollars / 1000}k` : dollars}`;
const draftFrom = (t: Pick<Position, 'contract_id' | 'side' | 'quantity' | 'entry_price_x4'>): TradeDraft =>
  ({ contractId: t.contract_id, side: t.side, quantity: String(t.quantity), priceText: String(t.entry_price_x4 / 10_000), source: null });

type AnalysisTab = 'impact' | 'full' | 'worst' | 'relations';
type SimKind = 'Idea' | 'Trade' | 'Baseline';
type SimEntry = { id: number; at: number; kind: SimKind; label: string; detail: string; worstDelta: number; trade: Position | null };

export function TradeSimulator({ positions, onContract, targetIndex, onClearTarget, seed }: {
  positions: Position[]; onContract: (id: string) => void;
  targetIndex: number | null; onClearTarget: () => void; seed: TicketSeed | null;
}) {
  const [objective, setObjective] = useState<TradeObjective>(targetIndex === null ? 'downside' : 'target');
  const [budget, setBudget] = useState(25000);
  const [customBudget, setCustomBudget] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // A trade from the new-trade ticket or the simulation log, overriding the ideas.
  const [custom, setCustom] = useState<{ trade: Position; label: string } | null>(null);
  const [tab, setTab] = useState<AnalysisTab>('impact');
  const [showMethod, setShowMethod] = useState(false);
  const [log, setLog] = useState<SimEntry[]>([]);
  // A Terminal hand-off opens the new-trade ticket straight away, priced at the live mid.
  const [draft, setDraft] = useState<TradeDraft | null>(() => seed && {
    contractId: seed.contractId, side: seed.side, quantity: '10000', priceText: String(seed.priceX4 / 10_000), source: seed,
  });
  const suggestions = useMemo(() => suggestTrades(positions, budget * 100, objective, targetIndex, snapshotPrice, IDEA_LIMIT), [positions, budget, objective, targetIndex]);

  const selected = selectedKey === 'baseline' ? undefined : suggestions.find(s => ideaKey(s) === selectedKey) ?? suggestions[0];
  const trade = custom?.trade ?? selected?.trade ?? null;
  const comparison = useMemo(() => compareTrade(positions, trade), [positions, trade]);
  const chartBefore = useMemo(() => comparisonPnls(positions), [positions]);
  const chartAfter = useMemo(() => comparisonPnls(trade ? [...positions, trade] : positions), [positions, trade]);
  const touched = useMemo(() => trade ? rankedOffsets([...positions, trade]).filter(o => o.a.position_id === 'proposed' || o.b.position_id === 'proposed') : [], [positions, trade]);
  const view = trade ? contractView(trade.contract_id) : null;
  const extraCost = trade ? costCents(trade) : 0;
  const targetBefore = targetIndex === null ? null : portfolioAt(positions, targetIndex).pnlCents;
  const targetAfter = targetIndex === null ? null : portfolioAt(trade ? [...positions, trade] : positions, targetIndex).pnlCents;
  const activeTab = tab === 'relations' && !trade ? 'impact' : tab;
  const worstDelta = comparison.after.worstCents - comparison.before.worstCents;
  const bestDelta = comparison.after.bestCents - comparison.before.bestCents;

  const record = (entry: Omit<SimEntry, 'id' | 'at'>) => setLog(l => [{ ...entry, id: (l[0]?.id ?? 0) + 1, at: Date.now() }, ...l].slice(0, 50));
  const describe = (t: Position) => `${t.quantity.toLocaleString()} @ ${tradePrice(t.entry_price_x4)} · ${money(costCents(t))}`;
  const nameOf = (t: Position) => `${t.side} ${contractView(t.contract_id).displayName}`;
  const worstOf = (t: Position) => { const c = compareTrade(positions, t); return c.after.worstCents - c.before.worstCents; };
  const resetSelection = () => { setSelectedKey(null); setCustom(null); };
  const pickIdea = (s: TradeSuggestion) => {
    setSelectedKey(ideaKey(s)); setCustom(null);
    record({ kind: 'Idea', label: nameOf(s.trade), detail: describe(s.trade), worstDelta: s.worstImprovement, trade: s.trade });
  };
  const keepBook = () => { setSelectedKey('baseline'); setCustom(null); record({ kind: 'Baseline', label: 'Keep current portfolio', detail: 'No additional cost', worstDelta: 0, trade: null }); };
  const simulateTrade = (t: Position) => {
    setDraft(null); setCustom({ trade: t, label: 'Custom simulation' });
    record({ kind: 'Trade', label: nameOf(t), detail: describe(t), worstDelta: worstOf(t), trade: t });
  };
  const restore = (e: SimEntry) => {
    if (e.trade) setCustom({ trade: e.trade, label: `Restored · ${e.kind} at ${clockTime(e.at)}` });
    else { setSelectedKey('baseline'); setCustom(null); }
  };
  const applyBudget = (dollars: number) => { setBudget(dollars); resetSelection(); };
  const customDollars = /^\d{1,7}$/.test(customBudget.replace(/[,$\s]/g, '')) ? Number(customBudget.replace(/[,$\s]/g, '')) : null;
  const customValid = customDollars !== null && customDollars >= 100 && customDollars <= 1_000_000;

  return <div className="trade-terminal">
    <div className="trade-controls">
      {targetIndex !== null && <div className="target-banner" title={pathDetail(ALL_STATES[targetIndex])}>
        <span className="section-label">Outcome selected from Exposure</span><b>{scenarioTitle(ALL_STATES[targetIndex])}</b>
        <span className="sr-only">{pathDetail(ALL_STATES[targetIndex])}.</span>
        <span>Current P&amp;L <strong className={tone(targetBefore!)}>{money(targetBefore!, true)}</strong></span>
        <button className="text-button" onClick={onClearTarget}>Clear scenario</button>
      </div>}
      <div className="objective-switch" role="group" aria-label="Trade objective">
        {targetIndex !== null && <button aria-pressed={objective === 'target'} onClick={() => { setObjective('target'); resetSelection(); }}>Protect selected outcome</button>}
        {OBJECTIVES.map(([id, label]) => <button key={id} aria-pressed={objective === id} onClick={() => { setObjective(id); resetSelection(); }}>{label}</button>)}
      </div>
      <div className="budget-field" role="group" aria-label="Additional capital budget">
        <span aria-hidden="true">Capital</span>
        {BUDGETS.map(n => <button key={n} aria-pressed={budget === n} onClick={() => { applyBudget(n); setCustomBudget(''); }} aria-label={`Up to ${money(n * 100)}`}>{shortMoney(n)}</button>)}
        <form onSubmit={e => { e.preventDefault(); if (customValid) applyBudget(customDollars!); }}>
          <input aria-label="Custom capital in dollars" placeholder="Custom $" inputMode="numeric" value={customBudget}
            className={!BUDGETS.includes(budget) ? 'active' : ''} aria-invalid={customBudget !== '' && !customValid}
            onChange={e => setCustomBudget(e.target.value)} onBlur={() => { if (customValid && customDollars !== budget) applyBudget(customDollars!); }} />
        </form>
      </div>
      <div className="trade-controls-end">
        <Badge>Simulation</Badge>
        <button className="primary-button new-trade" onClick={() => setDraft(draftFrom(trade ?? PROPOSED_TRADE))}><Plus size={14} /> New trade</button>
      </div>
    </div>

    <div className="trade-grid">
      <Panel title="Ideas" eyebrow={`${suggestions.length} ranked`} className="term-panel ideas-panel"
        actions={<button className="icon-button" aria-expanded={showMethod} aria-label="How these ideas are ranked" onClick={() => setShowMethod(v => !v)}><Info size={14} /></button>}>
        <div className="term-body" tabIndex={0} role="region" aria-label="Suggested trades">
          {showMethod && <p className="search-method">Screen open, interpreted contracts on both sides at the {SNAPSHOT.retrieved_at.slice(0, 10)} snapshot outcome marks. Test 25%, 50%, 75% and 100% of the budget-limited size, capped at 250,000 contracts and rounded down to lots of 100. Show the best tested size per contract and side. Ties favour worst-case protection, then profitable scenario count, then lower cost. These are indicative prices; depth, fees, financing and slippage are not modelled. This is a bounded single-trade search, not a globally optimal portfolio.</p>}
          <div className="suggestion-list">{suggestions.map((suggestion, i) => {
            const active = !custom && selected && ideaKey(selected) === ideaKey(suggestion);
            const v = contractView(suggestion.trade.contract_id);
            const headline = objective === 'coverage' ? `${signedCount(suggestion.coverageGain)} profitable scenarios` : `${money(objective === 'target' ? suggestion.targetImprovement : suggestion.worstImprovement, true)} ${objective === 'target' ? 'in selected outcome' : 'worst case'}`;
            return <button key={ideaKey(suggestion)} className={`suggestion ${active ? 'active' : ''}`} aria-pressed={!!active} aria-label={`Preview suggestion ${i + 1}: ${suggestion.trade.side} ${v.displayName}`} onClick={() => pickIdea(suggestion)}>
              <span className="suggestion-rank">{i === 0 ? 'Top' : `Alt ${i}`}<span>{active ? <><Check size={12} /> Previewing</> : null}</span></span>
              <b className="suggestion-name"><span className="side-label">{suggestion.trade.side}</span>{v.displayName}</b>
              <span className="suggestion-size">{suggestion.trade.quantity.toLocaleString()} at {tradePrice(suggestion.trade.entry_price_x4)} · {money(suggestion.costCents)} cost</span>
              <strong className="suggestion-benefit positive">{headline}</strong>
              <span className="suggestion-tradeoff">{objective === 'coverage' ? <>Worst-case change <b className={tone(suggestion.worstImprovement)}>{money(suggestion.worstImprovement, true)}</b></> : <>Profitable scenario change <b className={tone(suggestion.coverageGain)}>{signedCount(suggestion.coverageGain)}</b></>}</span>
              {objective === 'target' && <span className="suggestion-tradeoff">Whole-book worst-case change <b className={tone(suggestion.worstImprovement)}>{money(suggestion.worstImprovement, true)}</b></span>}
            </button>;
          })}</div>
          {suggestions.length === 0 && <p className="no-suggestions">No tested single trade improves this objective within the budget. Keep the current portfolio, adjust the budget, or request quotes for your own trade.</p>}
          <button className={`baseline-button ${!trade ? 'active' : ''}`} aria-pressed={!trade} onClick={keepBook}>{!trade && <Check size={13} />}Keep current portfolio <span>No additional cost</span></button>
        </div>
      </Panel>

      <section className="panel term-panel trade-preview" aria-labelledby="preview-heading">
        <div className="term-body" tabIndex={0} role="region" aria-label="Selected idea">
          <div className="preview-heading">
            <div><span className="section-label">{custom ? custom.label : trade ? 'Selected idea' : 'Baseline'}</span><h2 id="preview-heading" aria-live="polite">{trade && view ? `${trade.side} ${view.displayName}` : 'Keep the current portfolio'}</h2><p>{trade ? `${trade.quantity.toLocaleString()} contracts · ${tradePrice(trade.entry_price_x4)} per contract · ${money(extraCost)} additional capital` : 'The current book, with no additional cost or change in exposure.'}</p></div>
            {trade && <div className="preview-actions">
              <button className="text-button" onClick={() => onContract(trade.contract_id)}>Inspect contract <ArrowUpRight size={14} /></button>
              <button className="secondary-button" onClick={() => setDraft(draftFrom(trade))}>Edit as new trade <ArrowRight size={14} /></button>
            </div>}
          </div>
          <div className="preview-metrics kpi-strip">
            <div><span>Worst-case P&amp;L</span><strong className={tone(comparison.after.worstCents)}>{money(comparison.after.worstCents, true)}</strong><small>From {money(comparison.before.worstCents, true)} <b className={tone(worstDelta)}>{money(worstDelta, true)} change</b></small></div>
            <div><span>Best-case P&amp;L</span><strong className={tone(comparison.after.bestCents)}>{money(comparison.after.bestCents, true)}</strong><small>From {money(comparison.before.bestCents, true)} <b className={tone(bestDelta)}>{money(bestDelta, true)} change</b></small></div>
            <div><span>Profitable scenarios</span><strong>{comparison.after.profitable}<em> / {COMPARISON_SCENARIOS.length.toLocaleString()}</em></strong><small><b className="positive">{comparison.newlyProfitable} newly profitable</b> · <b className={comparison.noLongerProfitable ? 'negative' : 'muted'}>{comparison.noLongerProfitable} no longer profitable</b></small></div>
            <div><span>Additional capital</span><strong>{money(extraCost)}</strong><small>{trade ? 'Maximum loss on this added position' : 'Current portfolio baseline'}</small></div>
          </div>
          {targetBefore !== null && targetAfter !== null && <div className="target-comparison"><span>Selected outcome P&amp;L</span><b>{money(targetBefore, true)}</b><ArrowRight size={15} /><b className={tone(targetAfter)}>{money(targetAfter, true)}</b><span className={tone(targetAfter - targetBefore)}>{money(targetAfter - targetBefore, true)} change</span></div>}
          <OutcomeChart values={chartAfter} before={trade ? chartBefore : undefined} />
        </div>
      </section>

      <section className="panel term-panel analysis-panel" aria-label="Trade analysis">
        <header className="panel-header term-tabs"><div role="tablist" aria-label="Analysis views">
          {([['impact', 'Impact'], ['full', 'Full comparison'], ['worst', 'Worst outcome'], ...(trade ? [['relations', 'Relations']] : [])] as [AnalysisTab, string][]).map(([id, label]) =>
            <button key={id} role="tab" id={`analysis-tab-${id}`} aria-controls={`analysis-panel-${id}`} aria-selected={activeTab === id} tabIndex={activeTab === id ? 0 : -1} onClick={() => setTab(id)}>{label}</button>)}
        </div></header>
        <div className="term-body analysis-body" role="tabpanel" id={`analysis-panel-${activeTab}`} aria-labelledby={`analysis-tab-${activeTab}`} tabIndex={0}>
          {activeTab === 'impact' && (trade
            ? <div className="scenario-impact"><ImpactList title="Where this trade helps" changes={comparison.improved} /><ImpactList title="What you give up" changes={comparison.worsened} /></div>
            : <p className="quiet-copy">No trade selected. The current book is unchanged in every scenario.</p>)}
          {activeTab === 'full' && <table className="compare-table"><thead><tr><th scope="col">Measure</th><th scope="col" className="numeric">Before</th><th scope="col" className="numeric">After</th><th scope="col" className="numeric">Change</th></tr></thead><tbody>{[
            { label: 'Worst outcome', before: comparison.before.worstCents, after: comparison.after.worstCents },
            { label: 'Best outcome', before: comparison.before.bestCents, after: comparison.after.bestCents },
            { label: 'Profitable scenarios', before: comparison.before.profitable, after: comparison.after.profitable, count: true },
            { label: 'Loss-making scenarios', before: comparison.before.losing, after: comparison.after.losing, count: true },
          ].map(m => <tr key={m.label}><th scope="row">{m.label}</th><td className="numeric">{m.count ? m.before : money(m.before, true)}</td><td className="numeric">{m.count ? m.after : money(m.after, true)}</td><td className="numeric">{m.count ? signedCount(m.after - m.before) : money(m.after - m.before, true)}</td></tr>)}</tbody></table>}
          {activeTab === 'worst' && <><p className="quiet-copy">Positions behind the {trade ? 'new ' : ''}worst outcome: {scenarioTitle(comparison.worst.scenario.representative)}. {pathDetail(comparison.worst.scenario.representative)}.</p><ContributionTable positions={trade ? [...positions, trade] : positions} stateIndex={comparison.worst.index} onContract={onContract} highlightId={trade ? 'proposed' : undefined} /></>}
          {activeTab === 'relations' && (touched.length === 0 ? <p className="quiet-copy">No offset relation with an existing position in this model.</p> : <ul className="offset-list">{touched.slice(0, 6).map(o => { const other = o.a.position_id === 'proposed' ? o.b : o.a; return <li className="offset-row" key={other.position_id}><div className="offset-summary static"><button className="instrument-link" onClick={() => onContract(other.contract_id)}>{other.side} {contractView(other.contract_id).displayName}</button><Badge>{o.klass}</Badge></div></li>; })}</ul>)}
        </div>
      </section>

      <section className="panel term-panel sims-panel" aria-labelledby="sims-heading">
        <header className="panel-header"><div className="panel-title"><h2 id="sims-heading">Simulations</h2><span className="panel-count">{log.length} this session</span></div></header>
        <div className="term-body" tabIndex={0} role="region" aria-label="Simulation log">
          {log.length === 0
            ? <p className="quiet-copy term-empty">Preview an idea or simulate a new trade; each run is logged here. Select a run to bring it back.</p>
            : <ul className="sim-list">{log.map((e, i) => <li key={e.id} className={i === 0 ? 'fresh' : ''}>
              <button className="sim-entry" onClick={() => restore(e)} aria-label={`Restore ${e.kind.toLowerCase()} run: ${e.label}`}>
                <span className="sim-meta"><span className="muted">{clockTime(e.at)}</span><span className="sim-kind">{e.kind}</span><RotateCcw size={11} aria-hidden="true" /></span>
                <b>{e.label}</b><small>{e.detail}</small>
                <span className={`sim-delta ${tone(e.worstDelta)}`}>{money(e.worstDelta, true)} worst case</span>
              </button>
            </li>)}</ul>}
        </div>
      </section>
    </div>

    {draft && <NewTradeDialog draft={draft} positions={positions} onClose={() => setDraft(null)} onSimulate={simulateTrade} />}
  </div>;
}

function ImpactList({ title, changes }: { title: string; changes: ScenarioChange[] }) {
  return <div className="impact-list"><div className="section-intro"><h3>{title}</h3><span>{changes.length} scenarios</span></div>{changes.length === 0 ? <p className="quiet-copy">No scenarios in this category.</p> : <ul>{changes.slice(0, 3).map(change => <li key={change.scenario.key}><div><b>{scenarioTitle(change.scenario.representative)}</b><small>{pathDetail(change.scenario.representative)}</small><span>{money(change.before, true)} <ArrowRight size={12} /> {money(change.after, true)}</span></div><strong className={tone(change.delta)}>{money(change.delta, true)}</strong></li>)}</ul>}</div>;
}
