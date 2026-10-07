import { useMemo, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Crosshair, RotateCcw } from 'lucide-react';
import { OutcomeChart } from './OutcomeChart';
import { Panel, KeyValue, Badge, ResizeHandle, useColumnWidth } from './primitives';
import {
  ALL_STATES, INTER_MOVES_BP, SCHEDULED_MOVES_BP,
  bpPercent, compact, contractView, drivers, exposureSummary, facts,
  money, pnlVector, portfolioAt, scenarioRows, type Position,
} from '../domain/engine';
import { COMPARISON_SCENARIOS, comparisonPnls, outcomeMetrics, pathDetail, scenarioTitle, vulnerabilities } from '../domain/decisionSupport';

const move = (bp: number) => bp === 0 ? 'Hold' : `${bp > 0 ? '+' : '−'}${Math.abs(bp)}`;
const WINDOWS = [ ['interSepOct', 'Before October'], ['interOctDec', 'Between meetings'], ['postDec', 'After December'] ] as const;

export function ExposureView({ positions, onScenario, onContract, onHedge }: {
  positions: Position[]; onScenario: (key: string) => void; onContract: (id: string) => void; onHedge: (index: number) => void;
}) {
  const side = useColumnWidth(330);
  const risks = useMemo(() => vulnerabilities(positions), [positions]);
  const initial = risks[0]?.scenario.representative ?? ALL_STATES.find(s => Object.values(s).every(v => v === 0))!;
  const [windows, setWindows] = useState({ interSepOct: initial.interSepOct, interOctDec: initial.interOctDec, postDec: initial.postDec });
  const [selectedMoves, setSelectedMoves] = useState({ october: initial.october, december: initial.december });
  const summary = useMemo(() => exposureSummary(positions), [positions]);
  const comparisonValues = useMemo(() => comparisonPnls(positions), [positions]);
  const breadth = useMemo(() => outcomeMetrics(comparisonValues), [comparisonValues]);
  const rows = useMemo(() => scenarioRows(positions), [positions]);
  const vector = useMemo(() => pnlVector(positions, ALL_STATES.length), [positions]);
  const driving = useMemo(() => drivers(positions), [positions]);
  const slice = useMemo(() => ALL_STATES.flatMap((s, index) =>
    WINDOWS.every(([key]) => s[key] === windows[key]) ? [{ state: s, index, pnl: vector[index] }] : []), [windows, vector]);
  const selected = slice.find(r => r.state.october === selectedMoves.october && r.state.december === selectedMoves.december)!;
  const result = portfolioAt(positions, selected.index);
  const stateFacts = facts(selected.state);
  const contributions = [...result.rows].sort((a, b) => a.pnlCents - b.pnlCents);
  const maxAbs = Math.max(Math.abs(summary.worst.pnlCents), Math.abs(summary.best.pnlCents), 1);
  const selectedScenario = rows.find(r => r.scenario.memberIndices.includes(selected.index))!;
  const selectWorld = (index: number) => {
    const s = ALL_STATES[index];
    setWindows({ interSepOct: s.interSepOct, interOctDec: s.interOctDec, postDec: s.postDec });
    setSelectedMoves({ october: s.october, december: s.december });
  };
  const selectExtreme = (which: 'worst' | 'best') => selectWorld(ALL_STATES.indexOf(summary[which].scenario.representative));

  return <div className="exposure-layout">
    <section className="exposure-diagnosis" aria-label="Portfolio diagnosis">
      <div className="diagnosis-copy">
        <span className="section-label">Your largest vulnerability</span>
        <h2>{risks[0] ? scenarioTitle(risks[0].scenario.representative) : 'No loss-making scenario in this model'}</h2>
        {risks[0] && <p className="diagnosis-path">{pathDetail(risks[0].scenario.representative)}</p>}
      </div>
      <OutcomeChart values={comparisonValues} />
      <div className="diagnosis-action"><span>Worst portfolio P&amp;L</span><button className={`metric-button diagnosis-worst ${summary.worst.pnlCents < 0 ? 'negative' : 'positive'}`} onClick={() => selectExtreme('worst')}>{money(summary.worst.pnlCents, true)}<ArrowUpRight size={16}/></button>
        {risks[0] && <button className="primary-button" onClick={() => onHedge(risks[0].index)}>Protect this outcome <ArrowRight size={15}/></button>}
      </div>
    </section>
    <div className="summary-strip exposure-metrics">
      <KeyValue label="Capital deployed">{money(summary.costCents)}<small>{summary.positionCount} positions · {summary.contractCount} contracts</small></KeyValue>

      <KeyValue label="Best outcome"><button className="metric-button positive" onClick={() => selectExtreme('best')}>{money(summary.best.pnlCents, true)}<ArrowUpRight size={16}/></button><small>Across all modelled worlds</small></KeyValue>
      <KeyValue label="Profitable scenarios">{breadth.profitable}<span className="metric-denominator"> / {COMPARISON_SCENARIOS.length.toLocaleString()}</span><small>Distinct rate scenarios</small></KeyValue>
      <KeyValue label="Loss-making scenarios">{breadth.losing}<span className="metric-denominator"> / {COMPARISON_SCENARIOS.length.toLocaleString()}</span><small>Current portfolio</small></KeyValue>
    </div>
    <div className="exposure-workspace" style={{ '--side-width': `${side.width}px` } as CSSProperties}>
      <Panel title="Payoff landscape" eyebrow="October × December" className="landscape-panel" actions={<Badge>USD P&amp;L</Badge>}>
        <div className="landscape-controls"><div><span className="section-label">INTER-MEETING MOVES</span><span className="quiet-copy">81 worlds in this slice</span></div>
          {WINDOWS.map(([key, label]) => <label key={key}>{label}<select aria-label={label} value={windows[key]} onChange={e => setWindows({...windows, [key]: Number(e.target.value)})}>{INTER_MOVES_BP.map(n => <option key={n} value={n}>{n === 0 ? 'No move' : `${move(n)} bp`}</option>)}</select></label>)}
          <button className="icon-button" aria-label="Reset landscape" onClick={() => {setWindows({interSepOct:0,interOctDec:0,postDec:0});setSelectedMoves({october:0,december:0});}}><RotateCcw size={14}/></button>
        </div>
        <div className="heatmap-wrap"><div className="axis-title">DECEMBER DECISION <span>→ basis points</span></div>
          <div className="heatmap-frame"><div className="vertical-axis">OCTOBER DECISION</div><table className="heatmap" aria-label="October and December portfolio profit and loss">
            <thead><tr><th scope="col"><span className="sr-only">October / December</span></th>{SCHEDULED_MOVES_BP.map(d => <th scope="col" key={d}>{move(d)}</th>)}</tr></thead>
            <tbody>{SCHEDULED_MOVES_BP.map(o => <tr key={o}><th scope="row">{move(o)}</th>{SCHEDULED_MOVES_BP.map(d => {
              const cell = slice.find(r => r.state.october === o && r.state.december === d)!;
              const active = selectedMoves.october === o && selectedMoves.december === d;
              return <td key={d}><button className={`heat-cell ${cell.pnl < 0 ? 'loss' : 'gain'} ${active ? 'selected' : ''}`} style={{backgroundColor: `color-mix(in srgb, var(${cell.pnl < 0 ? '--down' : '--up'}) ${8 + Math.abs(cell.pnl) / maxAbs * 35}%, var(--bg-app))`}} aria-label={`October ${o} bp, December ${d} bp, ${money(cell.pnl, true)} P&L`} aria-pressed={active} onClick={() => setSelectedMoves({october:o,december:d})}>{compact(cell.pnl)}{active && <Crosshair size={11} aria-hidden="true"/>}</button></td>;
            })}</tr>)}</tbody>
          </table></div>
          <div className="heatmap-legend"><span><i className="legend-loss"/>Loss</span><div className="heat-scale"/><span>Profit<i className="legend-gain"/></span><span className="legend-note">Select an outcome</span></div>
        </div>

      </Panel>
      <ResizeHandle value={side.width} min={260} max={680} invert onChange={side.setWidth} label="Selected outcome panel width" />
      <section className="panel outcome-panel" tabIndex={0} role="region" aria-label="Selected outcome">
        <header className="panel-header"><h2>Selected outcome</h2></header>
        <div className="outcome-readout"><div className="section-label">OCT {move(selected.state.october)} / DEC {move(selected.state.december)}</div><strong className={selected.pnl < 0 ? 'negative' : 'positive'}>{money(selected.pnl, true)}</strong><span>Portfolio P&amp;L at settlement</span></div>
        <div className="outcome-facts"><KeyValue label="Terminal payout">{money(result.payoutCents)}</KeyValue><KeyValue label="December upper bound">{bpPercent(stateFacts.terminalUpperBp)}</KeyValue><KeyValue label="2026 hike / cut units">{stateFacts.hikes2026} / {stateFacts.cuts2026}</KeyValue></div>
        <div className="subpanel-title"><span>POSITION CONTRIBUTIONS</span><span>P&amp;L</span></div>
        <div className="contribution-list">{contributions.map(r => {
          const v = contractView(r.position.contract_id);
          return <button key={r.position.position_id} onClick={() => onContract(r.position.contract_id)}><span className="contribution-name"><b>{v.authored.shortName}</b><small>{r.position.side}</small><i className={`contribution-bar ${r.pnlCents < 0 ? 'loss' : 'gain'}`} style={{width: `${Math.abs(r.pnlCents) / Math.max(...contributions.map(c => Math.abs(c.pnlCents)), 1) * 100}%`}} /></span><span className={`mono ${r.pnlCents < 0 ? 'negative' : 'positive'}`}>{compact(r.pnlCents)}</span></button>;
        })}</div>
        <div className="outcome-actions"><button className="panel-action" onClick={() => onScenario(selectedScenario.scenario.key)}>Explore scenario <ArrowUpRight size={14}/></button>
        <button className="panel-action" onClick={() => onHedge(selected.index)}>Find hedges <ArrowRight size={14}/></button></div>
      </section>
    </div>
    <section className="vulnerability-section" aria-labelledby="vulnerability-heading">
      <div className="section-intro"><h2 id="vulnerability-heading">Downside scenarios</h2><span>Ranked by portfolio loss</span></div>
      <div className="vulnerability-list">{risks.map((risk, i) => <div className={`vulnerability-row ${risk.index === selected.index ? 'active' : ''}`} key={risk.scenario.key}>
        <span className="risk-rank">0{i + 1}</span>
        <button className="risk-select" aria-pressed={risk.index === selected.index} onClick={() => selectWorld(risk.index)}><b>{scenarioTitle(risk.scenario.representative)}</b><small>{pathDetail(risk.scenario.representative)}</small></button>
        <div className="risk-cause"><span>Largest loss contributors</span><b>{risk.contributors.map(c => c.name).join(' · ')}</b></div>
        <strong className="negative">{money(risk.pnlCents, true)}</strong>
        <button className="text-button hedge-link" onClick={() => onHedge(risk.index)} aria-label={`Find hedges for vulnerability ${i + 1}`}>Find hedges <ArrowUpRight size={14}/></button>
      </div>)}</div>
    </section>
    <div className="exposure-bottom">
      <Panel title="Economic drivers" eyebrow="MAXIMUM P&L SWING">
        <ul className="driver-list">{driving.map(d => <li key={d.id}><span>{d.label}</span><span className="driver-bar"><i style={{width:`${d.swingCents / driving[0].swingCents * 100}%`}}/></span><span className="mono">{money(d.swingCents)}</span></li>)}</ul>
        <p className="panel-footnote">Sweep one variable while holding the others fixed. These swings are not additive.</p>
      </Panel>
      <div className="coverage-status"><Badge tone="teal">{summary.unsupportedHoldings.length === 0 ? 'HELD BOOK COVERED' : 'REVIEW COVERAGE'}</Badge><span>{summary.rawWorldCount.toLocaleString()} worlds → {summary.scenarioCount} book outcomes</span></div>
    </div>
  </div>;
}
