import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, SlidersHorizontal } from 'lucide-react';
import { Panel, Badge } from './primitives';
import { ContributionTable } from './ScenarioExplorer';
import {
  ALL_STATES, CONTRACT_VIEWS, PROPOSED_TRADE, SNAPSHOT, contractView, costCents,
  money, portfolioAt, rankedOffsets, type Position,
} from '../domain/engine';
import {
  COMPARISON_SCENARIOS, compareTrade, pathDetail, scenarioTitle, suggestTrades,
  parseTradeInputs, type ScenarioChange, type TradeObjective,
} from '../domain/decisionSupport';

const tradePrice = (x4: number) => `${(x4 / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}¢`;
const signedCount = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}`;
const tone = (n: number) => n > 0 ? 'positive' : n < 0 ? 'negative' : 'muted';
const OBJECTIVES = [
  ['downside', 'Reduce worst-case loss'], ['coverage', 'More profitable scenarios'],
] as const;

export function TradeSimulator({ positions, onContract, targetIndex, onClearTarget }: {
  positions: Position[]; onContract: (id: string) => void;
  targetIndex: number | null; onClearTarget: () => void;
}) {
  const [objective, setObjective] = useState<TradeObjective>(targetIndex === null ? 'downside' : 'target');
  const [budget, setBudget] = useState(25000);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [custom, setCustom] = useState<Position | null>(null);
  const suggestions = useMemo(() => suggestTrades(positions, budget * 100, objective, targetIndex), [positions, budget, objective, targetIndex]);
  const selected = selectedId === 'baseline' ? undefined : suggestions.find(s => s.id === selectedId) ?? suggestions[0];
  const trade = custom ?? selected?.trade ?? null;
  const comparison = useMemo(() => compareTrade(positions, trade), [positions, trade]);
  const touched = useMemo(() => trade ? rankedOffsets([...positions, trade]).filter(o => o.a.position_id === 'proposed' || o.b.position_id === 'proposed') : [], [positions, trade]);
  const resetSelection = () => { setSelectedId(null); setCustom(null); };
  const view = trade ? contractView(trade.contract_id) : null;
  const extraCost = trade ? costCents(trade) : 0;
  const seed = trade ?? { ...PROPOSED_TRADE, position_id: 'proposed' };
  const targetBefore = targetIndex === null ? null : portfolioAt(positions, targetIndex).pnlCents;
  const targetAfter = targetIndex === null ? null : portfolioAt(trade ? [...positions, trade] : positions, targetIndex).pnlCents;

  return <div className="trade-ideas">
    <div className="ideas-intro"><div><span className="section-label">A better position starts with a clear objective</span><h2>Find the trade that changes your exposure.</h2><p>Compare portfolio-aware ideas, see the trade-offs, then fine-tune the size.</p></div><Badge>Hypothetical · no execution</Badge></div>
    {targetIndex !== null && <div className="target-banner"><div><span className="section-label">Outcome selected from Exposure</span><b>{scenarioTitle(ALL_STATES[targetIndex])}</b><small>{pathDetail(ALL_STATES[targetIndex])}</small></div><span>Current P&amp;L <strong className={tone(targetBefore!)}>{money(targetBefore!, true)}</strong></span><button className="text-button" onClick={onClearTarget}>Clear scenario</button></div>}
    <div className="ideas-controls"><div className="objective-switch" role="group" aria-label="Trade objective">
      {targetIndex !== null && <button aria-pressed={objective === 'target'} onClick={() => { setObjective('target'); resetSelection(); }}>Protect selected outcome</button>}
      {OBJECTIVES.map(([id, label]) => <button key={id} aria-pressed={objective === id} onClick={() => { setObjective(id); resetSelection(); }}>{label}</button>)}
    </div><label className="budget-field">Additional capital <select aria-label="Additional capital budget" value={budget} onChange={e => { setBudget(Number(e.target.value)); resetSelection(); }}>{[5000, 25000, 50000, 100000].map(n => <option key={n} value={n}>Up to {money(n * 100)}</option>)}</select></label></div>
    <section className="suggestions-section" aria-label="Suggested trades">
      <div className="section-intro"><h2>Suggested trades</h2><span>Ranked for your objective · all changes include trade cost</span></div>
      <div className="suggestion-list">{suggestions.map((suggestion, i) => {
        const active = !custom && selected?.id === suggestion.id;
        const v = contractView(suggestion.trade.contract_id);
        const headline = objective === 'coverage' ? `${signedCount(suggestion.coverageGain)} profitable scenarios` : `${money(objective === 'target' ? suggestion.targetImprovement : suggestion.worstImprovement, true)} ${objective === 'target' ? 'in selected outcome' : 'worst-case improvement'}`;
        return <button key={suggestion.id} className={`suggestion ${active ? 'active' : ''}`} aria-pressed={active} aria-label={`Preview suggestion ${i + 1}: ${suggestion.trade.side} ${v.displayName}`} onClick={() => { setSelectedId(suggestion.id); setCustom(null); }}>
          <span className="suggestion-rank">{i === 0 ? 'Top candidate' : `Alternative ${i}`}<span>{active ? <><Check size={13}/> Previewing</> : <ArrowUpRight size={15}/>}</span></span>
          <b className="suggestion-name"><span className="side-label">{suggestion.trade.side}</span>{v.displayName}</b>
          <span className="suggestion-size">{suggestion.trade.quantity.toLocaleString()} contracts at {tradePrice(suggestion.trade.entry_price_x4)} · {money(suggestion.costCents)} cost</span>
          <strong className="suggestion-benefit positive">{headline}</strong>
          <span className="suggestion-tradeoff">{objective === 'coverage' ? <>Worst-case change <b className={tone(suggestion.worstImprovement)}>{money(suggestion.worstImprovement, true)}</b></> : <>Profitable scenario change <b className={tone(suggestion.coverageGain)}>{signedCount(suggestion.coverageGain)}</b></>}</span>
          {objective === 'target' && <span className="suggestion-tradeoff">Whole-book worst-case change <b className={tone(suggestion.worstImprovement)}>{money(suggestion.worstImprovement, true)}</b></span>}
        </button>;
      })}</div>
      {suggestions.length === 0 && <p className="no-suggestions">No tested single trade improves this objective within the budget. Keep the current portfolio, adjust the budget, or try a custom trade.</p>}
      <div className="suggestion-foot"><button className={`baseline-button ${!trade ? 'active' : ''}`} aria-pressed={!trade} onClick={() => { setSelectedId('baseline'); setCustom(null); }}>{!trade && <Check size={13}/>}Keep current portfolio <span>No additional cost</span></button><details className="search-method"><summary>How these ideas are ranked</summary><p>Screen open, interpreted contracts on both sides at the {SNAPSHOT.retrieved_at.slice(0, 10)} snapshot outcome marks. Test 25%, 50%, 75% and 100% of the budget-limited size, capped at 250,000 contracts and rounded down to lots of 100. Show the best tested size per contract and side. Ties favour worst-case protection, then profitable scenario count, then lower cost. These are indicative prices; depth, fees, financing and slippage are not modelled. This is a bounded single-trade search, not a globally optimal portfolio.</p></details></div>
    </section>
    <section className="trade-preview" aria-labelledby="preview-heading" aria-live="polite">
      <div className="preview-heading"><div><span className="section-label">{custom ? 'Custom simulation' : trade ? 'Selected idea' : 'Baseline'}</span><h2 id="preview-heading">{trade && view ? `${trade.side} ${view.displayName}` : 'Keep the current portfolio'}</h2><p>{trade ? `${trade.quantity.toLocaleString()} contracts · ${tradePrice(trade.entry_price_x4)} per contract · ${money(extraCost)} additional capital` : 'The current book, with no additional cost or change in exposure.'}</p></div>{trade && <button className="text-button" onClick={() => onContract(trade.contract_id)}>Inspect contract <ArrowUpRight size={14}/></button>}</div>
      <div className="preview-metrics"><div><span>Worst-case P&amp;L</span><strong className={tone(comparison.after.worstCents)}>{money(comparison.after.worstCents, true)}</strong><small>From {money(comparison.before.worstCents, true)} <b className={tone(comparison.after.worstCents - comparison.before.worstCents)}>{money(comparison.after.worstCents - comparison.before.worstCents, true)} change</b></small></div><div><span>Profitable scenarios</span><strong>{comparison.after.profitable}<em> / {COMPARISON_SCENARIOS.length.toLocaleString()}</em></strong><small><b className="positive">{comparison.newlyProfitable} newly profitable</b> · <b className={comparison.noLongerProfitable ? 'negative' : 'muted'}>{comparison.noLongerProfitable} no longer profitable</b></small></div><div><span>Additional capital</span><strong>{money(extraCost)}</strong><small>{trade ? 'Maximum loss on this added position' : 'Current portfolio baseline'}</small></div></div>
      {targetBefore !== null && targetAfter !== null && <div className="target-comparison"><span>Selected outcome P&amp;L</span><b>{money(targetBefore, true)}</b><ArrowRight size={15}/><b className={tone(targetAfter)}>{money(targetAfter, true)}</b><span className={tone(targetAfter - targetBefore)}>{money(targetAfter - targetBefore, true)} change</span></div>}
      <p className="comparison-note">The same {COMPARISON_SCENARIOS.length.toLocaleString()} economically distinct scenarios before and after. Counts describe model coverage, not the probability of making money.</p>
      {trade && <div className="scenario-impact"><ImpactList title="Where this trade helps" changes={comparison.improved}/><ImpactList title="What you give up" changes={comparison.worsened}/></div>}
    </section>
    <div className="trade-detail-grid"><div>
      <details className="analysis-disclosure"><summary>Full before and after comparison</summary><table className="compare-table"><thead><tr><th scope="col">Measure</th><th scope="col" className="numeric">Before</th><th scope="col" className="numeric">After</th><th scope="col" className="numeric">Change</th></tr></thead><tbody>{[
        { label: 'Worst outcome', before: comparison.before.worstCents, after: comparison.after.worstCents },
        { label: 'Best outcome', before: comparison.before.bestCents, after: comparison.after.bestCents },
        { label: 'Profitable scenarios', before: comparison.before.profitable, after: comparison.after.profitable, count: true },
        { label: 'Loss-making scenarios', before: comparison.before.losing, after: comparison.after.losing, count: true },
      ].map(m => <tr key={m.label}><th scope="row">{m.label}</th><td className="numeric">{m.count ? m.before : money(m.before, true)}</td><td className="numeric">{m.count ? m.after : money(m.after, true)}</td><td className="numeric">{m.count ? signedCount(m.after - m.before) : money(m.after - m.before, true)}</td></tr>)}</tbody></table></details>
      <details className="analysis-disclosure"><summary>Positions behind the {trade ? 'new ' : ''}worst outcome</summary><p className="quiet-copy">{scenarioTitle(comparison.worst.scenario.representative)}. {pathDetail(comparison.worst.scenario.representative)}.</p><ContributionTable positions={trade ? [...positions, trade] : positions} stateIndex={comparison.worst.index} onContract={onContract} highlightId={trade ? 'proposed' : undefined}/></details>
      {trade && <details className="analysis-disclosure"><summary>How this trade relates to held positions</summary>{touched.length === 0 ? <p className="quiet-copy">No offset relation with an existing position in this model.</p> : <ul className="offset-list">{touched.slice(0, 6).map(o => { const other = o.a.position_id === 'proposed' ? o.b : o.a; return <li className="offset-row" key={other.position_id}><div className="offset-summary static"><button className="instrument-link" onClick={() => onContract(other.contract_id)}>{other.side} {contractView(other.contract_id).displayName}</button><Badge>{o.klass}</Badge></div></li>; })}</ul>}</details>}
    </div><Panel title="Fine-tune or try your own" actions={<SlidersHorizontal size={15}/>} className="custom-trade-panel"><CustomTrade key={`${seed.contract_id}:${seed.side}:${seed.quantity}:${seed.entry_price_x4}`} seed={seed} onSimulate={setCustom}/></Panel></div>
  </div>;
}

function ImpactList({ title, changes }: { title: string; changes: ScenarioChange[] }) {
  return <div className="impact-list"><div className="section-intro"><h3>{title}</h3><span>{changes.length} scenarios</span></div>{changes.length === 0 ? <p className="quiet-copy">No scenarios in this category.</p> : <ul>{changes.slice(0, 3).map(change => <li key={change.scenario.key}><div><b>{scenarioTitle(change.scenario.representative)}</b><small>{pathDetail(change.scenario.representative)}</small><span>{money(change.before, true)} <ArrowRight size={12}/> {money(change.after, true)}</span></div><strong className={tone(change.delta)}>{money(change.delta, true)}</strong></li>)}</ul>}</div>;
}

function CustomTrade({ seed, onSimulate }: { seed: Position; onSimulate: (trade: Position) => void }) {
  const tradeable = CONTRACT_VIEWS.filter(v => v.authored.claim && !v.degenerate && !v.contract.closed);
  const [contractId, setContractId] = useState(seed.contract_id);
  const [side, setSide] = useState<Position['side']>(seed.side);
  const [quantity, setQuantity] = useState(String(seed.quantity));
  const [priceText, setPriceText] = useState(seed.entry_price_text);
  const parsed = parseTradeInputs(quantity, priceText);
  return <form className="trade-form" onSubmit={e => { e.preventDefault(); if (parsed) onSimulate({ position_id: 'proposed', contract_id: contractId, side, quantity: parsed.quantity, entry_price_x4: parsed.priceX4, entry_price_text: priceText }); }}>
    <label className="field-label" htmlFor="trade-contract">Contract</label><select id="trade-contract" value={contractId} onChange={e => setContractId(e.target.value)}>{tradeable.map(v => <option key={v.contract.contract_id} value={v.contract.contract_id}>{v.displayName}</option>)}</select>
    <div className="ticket-grid"><div><label className="field-label" htmlFor="trade-side">Side</label><select id="trade-side" value={side} onChange={e => setSide(e.target.value as Position['side'])}><option>YES</option><option>NO</option></select></div><div><label className="field-label" htmlFor="trade-quantity">Quantity</label><input id="trade-quantity" inputMode="numeric" value={quantity} onChange={e => setQuantity(e.target.value)}/></div><div><label className="field-label" htmlFor="trade-price">Price ($)</label><input id="trade-price" inputMode="decimal" value={priceText} onChange={e => setPriceText(e.target.value)}/></div></div>
    <dl className="ticket-readout"><div><dt>Trade cost</dt><dd>{parsed ? money(parsed.quantity * parsed.priceX4 / 100) : '—'}</dd></div><div><dt>Maximum payout</dt><dd>{parsed ? money(parsed.quantity * 100) : '—'}</dd></div></dl>
    <button type="submit" className="primary-button" disabled={!parsed}>Simulate trade <ArrowRight size={14}/></button>
    <p className="form-hint">{parsed ? 'Edits apply when you simulate. Custom trades use your entered price and size, independent of the suggestion budget.' : 'Use a positive whole quantity and a price between $0 and $1, up to four decimal places. Total cost must be whole cents.'}</p>
  </form>;
}
