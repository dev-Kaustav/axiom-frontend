import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, Maximize2, Minimize2, Search, RotateCcw, SlidersHorizontal, ChevronUp, ScanSearch, Eye } from 'lucide-react';
import { Badge, KeyValue, SourceLink, ResizeHandle, useColumnWidth } from './primitives';
import { ALL_STATES, BASIS_SUMMARY, CONTRACT_VIEWS, SCOPE_COUNTS, basketCoverage, contractView, exactGroupOffsets, exposureSummary, money, rankedOffsets, relationsAmong, scenarioRows, type OffsetAssessment, type Position, type Relation, type RelationKind } from '../domain/engine';
import { RelationshipGraph, type Moves } from './RelationshipGraph';
import { contractStatus, type ContractGrouping } from './portfolioModel';
const GROUPINGS: ContractGrouping[]=['Event','Payoff structure','Status','Venue'];
/** A contract takes part in relation inference only if it was interpreted and
 *  its payoff actually varies. Everything else is carried as an inert node. */
const relatable=(id:string)=>contractStatus(id).flag===null;
const KINDS: RelationKind[]=['IDENTITY','COMPLEMENT','IMPLICATION','EXCLUSIVITY','OVERLAP'];
const CLASS_COPY: Record<OffsetAssessment['klass'],string>={EXACT:'These positions hold a constant combined payout.',PARTIAL:'These positions reduce the payout swing, but leave residual exposure.',CONDITIONAL:'The combined payout is stable in a subset of outcomes. It changes elsewhere.',NONE:'These positions do not reduce the larger leg’s payout swing.'};
type Selection={kind:'none'}|{kind:'pair';index:number}|{kind:'contract';id:string}|{kind:'relation';relation:Relation}|{kind:'group';id:string}|{kind:'compare';ids:string[]};
export function RelationshipsView({positions,onContract,onScenario}: {positions:Position[];onContract:(id:string)=>void;onScenario:(key:string)=>void}) {
  const offsets=useMemo(()=>rankedOffsets(positions),[positions]);const groups=useMemo(()=>exactGroupOffsets(positions),[positions]);
  const [selection,setSelection]=useState<Selection>({kind:'none'});
  const [query,setQuery]=useState('');const [scope,setScope]=useState('held');const [kinds,setKinds]=useState<Set<RelationKind>>(new Set(KINDS.filter(k=>k!=='OVERLAP')));
  const [grouping,setGrouping]=useState<ContractGrouping>('Payoff structure');
  const [maximized,setMaximized]=useState(false);const evidence=useColumnWidth(520);const inspector=useColumnWidth(450);
  const [moves,setMoves]=useState<Moves>({});
  const heldIds=useMemo(()=>new Set(positions.map(p=>p.contract_id)),[positions]);
  // Every contract in scope goes on the canvas, including the ones no relation
  // can be computed about. They are labelled with the reason rather than
  // dropped: an absent node reads as "no relationship", which is a different
  // claim from "this model never interpreted it".
  const ids=useMemo(()=>CONTRACT_VIEWS.filter(v=>(scope==='all'||heldIds.has(v.contract.contract_id))&&v.displayName.toLowerCase().includes(query.toLowerCase())).map(v=>v.contract.contract_id),[scope,heldIds,query]);
  const relatableIds=useMemo(()=>ids.filter(relatable),[ids]);
  const allRelations=useMemo(()=>relationsAmong(relatableIds),[relatableIds]);
  const shownRelations=allRelations.filter(r=>kinds.has(r.kind));
  const offset=selection.kind==='pair'?offsets[selection.index]:null;
  const group=selection.kind==='group'?groups.find(g=>g.eventId===selection.id):null;
  const compared=selection.kind==='compare'?selection.ids:null;
  const basket=useMemo(()=>compared?basketCoverage(compared,positions):null,[compared,positions]);
  const focusIds=offset?[offset.a.contract_id,offset.b.contract_id]:compared?compared:selection.kind==='contract'?[selection.id]:selection.kind==='relation'?[selection.relation.a,selection.relation.b]:group?group.positions.map(p=>p.contract_id):[];
  const relation=selection.kind==='relation'?selection.relation:(offset||compared)?relationsAmong([...new Set(focusIds)])[0]??null:null;
  /** Selected contracts this model cannot derive anything about. Multi-select
   *  reaches them at full scope, and the answer there is a stated reason. */
  const uncomputable=[...new Set(focusIds)].filter(id=>!relatable(id));
  /** Plain click selects one contract; shift or cmd adds a second to compare. */
  const selectContract=(id:string,additive:boolean)=>{
    if(!additive){setSelection({kind:'contract',id});return;}
    const current=selection.kind==='compare'?selection.ids:selection.kind==='contract'?[selection.id]:[];
    const next=current.includes(id)?current.filter(x=>x!==id):[...current,id];
    setSelection(next.length>1?{kind:'compare',ids:next}:next.length===1?{kind:'contract',id:next[0]}:{kind:'none'});
  };
  const bookScenarios=useMemo(()=>scenarioRows(positions),[positions]);
  const failureScenario=(index:number)=>{const row=bookScenarios.find(r=>r.scenario.memberIndices.includes(index));if(row)onScenario(row.scenario.key);};
  const scopeIds=selection.kind==='pair'?[]:focusIds;
  const visibleOffsetRows=offsets.map((o,index)=>({o,index})).filter(({o})=>ids.includes(o.a.contract_id)&&ids.includes(o.b.contract_id)&&(scopeIds.length===0||scopeIds.includes(o.a.contract_id)||scopeIds.includes(o.b.contract_id)));
  const reset=()=>{setQuery('');setScope('held');setGrouping('Payoff structure');setKinds(new Set(KINDS.filter(k=>k!=='OVERLAP')));setSelection({kind:'none'});setMoves({});evidence.reset();inspector.reset();setUniverseOpen(false);setMaximized(false);};
  const [universeOpen,setUniverseOpen]=useState(false);const universeRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(!universeOpen)return;
    const close=(e:PointerEvent)=>{if(!universeRef.current?.contains(e.target as Node))setUniverseOpen(false);};
    const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setUniverseOpen(false);};
    document.addEventListener('pointerdown',close);document.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',esc);};},[universeOpen]);
  const toggleKind=(k:RelationKind)=>{const next=new Set(kinds);if(next.has(k))next.delete(k);else next.add(k);setKinds(next);};
  /** The legend and the universe controls live in the map's own bottom bar: the chips are the
   *  filter and the key at once, and the popover holds what is only needed now and then. */
  const footer=<div className="graph-legend">
    <div className="relation-chips" role="group" aria-label="Relation types">{KINDS.map(k=><button key={k} className="relation-chip" aria-pressed={kinds.has(k)} onClick={()=>toggleKind(k)}><i className={`edge-key ${k.toLowerCase()}`}/>{k.toLowerCase()}<small>{allRelations.filter(r=>r.kind===k).length}</small></button>)}</div>
    <div className="universe-menu" ref={universeRef}>
      <button className="universe-button" aria-label="Universe" title="Universe: search, scope, grouping" aria-expanded={universeOpen} aria-haspopup="dialog" onClick={()=>setUniverseOpen(!universeOpen)}><SlidersHorizontal size={13}/><ChevronUp size={12}/></button>
      {universeOpen&&<div className="universe-popover" role="dialog" aria-label="Universe navigator"><div className="rail-controls"><label className="search-box"><Search size={14}/><input aria-label="Search graph contracts" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a contract…"/></label><div className="segmented"><button aria-pressed={scope==='held'} onClick={()=>setScope('held')}>Portfolio</button><button aria-pressed={scope==='all'} onClick={()=>setScope('all')}>All contracts</button></div><p className="rail-hint">{scope==='held'?`${ids.length} held contracts`:`All ${ids.length} contracts in the universe. ${relatableIds.length} carry a payoff vector and can relate; the other ${ids.length-relatableIds.length} are carried with the reason they cannot.`}</p><label className="rail-field">Group by <select aria-label="Group contracts by" value={grouping} onChange={e=>setGrouping(e.target.value as ContractGrouping)}>{GROUPINGS.map(g=><option key={g}>{g}</option>)}</select></label></div></div>}
    </div>
  </div>;
  return <div className={`relationship-workspace ${maximized?'maximized':''}`} style={{'--evidence-width':`${evidence.width}px`,'--inspector-height':`${inspector.width}px`} as CSSProperties}>
    <section className="panel graph-panel"><div className="graph-tools"><button className="icon-button" aria-label="Reset relationship layout" onClick={reset}><RotateCcw size={13}/></button><button className="icon-button" aria-label={maximized?'Restore workspace':'Maximize graph'} onClick={()=>setMaximized(!maximized)}>{maximized?<Minimize2 size={14}/>:<Maximize2 size={14}/>}</button></div>
            <RelationshipGraph ids={ids} positions={positions} relations={shownRelations} focusIds={focusIds} selectedRelation={relation} grouping={grouping} moves={moves} onMove={(name,move)=>setMoves(m=>({...m,[name]:move}))} onMoves={setMoves} onBackground={()=>setSelection({kind:'none'})} onSelect={selectContract} onRelation={r=>setSelection({kind:'relation',relation:r})} footer={footer}/>
    </section>
    <ResizeHandle value={evidence.width} min={340} max={720} invert onChange={evidence.setWidth} label="Evidence inspector width" />
    <div className="relationship-side">
    <aside className="evidence-panel"><div className="evidence-heading"><span className="pane-title"><ScanSearch size={14}/>Inspect</span></div><div className="evidence-scroll" tabIndex={0} role="region" aria-label="Evidence inspector">
      {offset && <><div className="inspector-section"><Badge tone={offset.klass==='EXACT'?'teal':'amber'}>{offset.klass} OFFSET</Badge><h3>{CLASS_COPY[offset.klass]}</h3><p className="quiet-copy">{offset.a.side} · {contractView(offset.a.contract_id).displayName}<br/>+ {offset.b.side} · {contractView(offset.b.contract_id).displayName}</p><div className="residual-readout"><span>RESIDUAL PAYOUT RANGE</span><strong>{money(offset.residualRangeCents)}</strong></div><KeyValue label="Stable payout count">{offset.coveredScenarios} / {offset.totalScenarios}</KeyValue><div className="coverage-meter"><i style={{width:`${offset.coverageFraction*100}%`}}/></div><p className="quiet-copy">Outcomes with a stable combined payout.</p></div>
        {offset.failures.length>0&&<div className="inspector-section"><h4>Where it fails</h4><p className="quiet-copy">Largest deviations from the modal combined payout. Positive values mean more payout.</p>{offset.failures.slice(0,4).map(f=><button className="counterexample" key={f.scenario.key} onClick={()=>failureScenario(f.scenario.memberIndices[0])}><span>{f.scenario.label}</span><b className={f.shortfallCents<0?'negative':'positive'}>{money(f.shortfallCents,true)} <ArrowUpRight size={12}/></b></button>)}</div>}</>}
      {group&&<div className="inspector-section"><Badge tone="teal">EXACT MULTI-LEG OFFSET</Badge><h3>{group.positions.length} legs. One constant payout.</h3><div className="residual-readout"><span>EVERY MODELLED WORLD</span><strong className="positive">{money(group.constantPayoutCents)}</strong></div><p className="quiet-copy">{group.proof}</p><div className="group-equation">{group.positions.map((p,i)=><FragmentLeg key={p.position_id} id={p.contract_id} side={p.side} quantity={p.quantity} plus={i>0} onContract={onContract}/>)}<div className="equation-total">= {money(group.constantPayoutCents)} payout</div></div></div>}
      {relation&&!compared&&<div className="inspector-section"><h4>Contract relation <Badge>{relation.kind}</Badge></h4><div className="relation-expression"><span>{contractView(relation.a).authored.shortName}</span><ArrowRight size={15}/><span>{contractView(relation.b).authored.shortName}</span></div><p>{relation.proof}</p><p className="quiet-copy">Verified across {ALL_STATES.length.toLocaleString()} modelled worlds. This describes YES settlement payoffs; held quantities and sides determine the offset.</p></div>}
      {selection.kind==='none'&&<UniverseOverview positions={positions} ids={ids} relatableIds={relatableIds} relations={allRelations} offsets={offsets} groups={groups}/>}
      {basket&&<BasketPanel basket={basket}/>}
      {compared&&compared.length===2&&<div className="inspector-section"><Badge tone={uncomputable.length?'':relation?'teal':'amber'}>{uncomputable.length?'NOT COMPUTABLE':relation?`${relation.kind} RELATION`:'NO COMPUTED RELATION'}</Badge><h3>{uncomputable.length?`${uncomputable.length===2?'Neither of these contracts has':'One of these contracts has no'} a payoff this model can compare, so no relation between them is derivable.`:relation?relation.proof:'Neither contract\u2019s payoff constrains the other.'}</h3><div className="relation-expression"><span>{contractView(compared[0]).authored.shortName}</span><ArrowRight size={15}/><span>{contractView(compared[1]).authored.shortName}</span></div>{uncomputable.length>0
        ? uncomputable.map(id=><p className="quiet-copy" key={id}><b>{contractView(id).authored.shortName}</b> \u2014 {contractStatus(id).reason}</p>)
        : <p className="quiet-copy">{relation?`Verified across ${ALL_STATES.length.toLocaleString()} modelled worlds.`:`Checked across ${ALL_STATES.length.toLocaleString()} modelled worlds: there is at least one world where each settles without the other. Holding both is two exposures, not one.`}</p>}</div>}
      {selection.kind==='contract'&&(()=>{const status=contractStatus(selection.id);const neighbors=shownRelations.filter(r=>r.a===selection.id||r.b===selection.id);
        return <div className="inspector-section">{status.flag&&<Badge tone="amber">{status.flag}</Badge>}<h3>{contractView(selection.id).contract.question}</h3>
          <p className="quiet-copy">{status.flag?status.reason:neighbors.length?null:'No relation of the enabled types connects this contract to another on the canvas.'}</p>
          {status.flag&&<p className="quiet-copy">It carries no edge for that reason alone. Shift-click a second contract to see what can and cannot be said about the two together.</p>}
          <div className="neighbor-list">{neighbors.map(r=>{const other=r.a===selection.id?r.b:r.a;return <button key={other} onClick={()=>setSelection({kind:'relation',relation:r})}><span>{contractView(other).authored.shortName}</span><Badge>{r.kind}</Badge></button>;})}</div></div>;
      })()}
      <div className="inspector-section"><h4>{focusIds.length>1?'Why the contracts differ':'Settlement evidence'}</h4>{[...new Set(focusIds)].map(id=>{const v=contractView(id);return <div className="clause-card" key={id}><button className="instrument-link" onClick={()=>onContract(id)}>{v.contract.question}<ArrowUpRight size={13}/></button>{v.expression&&<code className="expression">{v.expression}</code>}<p className="quiet-copy">{v.authored.rationale}</p><SourceLink url={v.contract.source_url}>Venue rule & identifiers</SourceLink></div>;})}</div>
    </div></aside>
    <ResizeHandle horizontal value={inspector.width} min={120} max={640} onChange={inspector.setWidth} label="Inspector height" />
      <section className="hedge-watch-panel" aria-label="Hedge failure watch">      <div className="rail-heading"><span className="pane-title"><Eye size={14}/>Watch</span><Badge tone="amber">{visibleOffsetRows.filter(({o})=>o.misleading).length}</Badge></div><div className="exact-group-strip" tabIndex={0} role="region" aria-label="Exact group offsets">{groups.map(g=><button key={g.eventId} className={selection.kind==='group'&&selection.id===g.eventId?'active':''} onClick={()=>setSelection({kind:'group',id:g.eventId})}><span className="exact-bracket">{g.positions.length} LEGS</span><span>{contractView(g.positions[0].contract_id).event.title}</span><b>{money(g.constantPayoutCents)} payout</b></button>)}{groups.length===0&&<p className="rail-note">No exact group offsets in this portfolio.</p>}</div><div className="hedge-watch" tabIndex={0} role="region" aria-label="Hedge failure pairs">{visibleOffsetRows.slice(0,30).map(({o,index})=><button className={selection.kind==='pair'&&selection.index===index?'active':''} key={`${o.a.position_id}:${o.b.position_id}`} onClick={()=>setSelection({kind:'pair',index})}><span className="watch-class"><Badge tone={o.klass==='EXACT'?'teal':o.misleading?'amber':''}>{o.klass}</Badge><span>{money(o.residualRangeCents)}</span></span><b>{o.a.side} {contractView(o.a.contract_id).authored.shortName}</b><span className="watch-join">+ {o.b.side} {contractView(o.b.contract_id).authored.shortName}</span><small>{o.a.position_id} / {o.b.position_id} · payout range</small></button>)}{visibleOffsetRows.length===0&&<p className="empty-state">No held pairs in this view.</p>}</div><div className="rail-note">{Math.min(30,visibleOffsetRows.length)} of {visibleOffsetRows.length} pairs · {scopeIds.length?`Pairs touching the ${scopeIds.length} contract${scopeIds.length===1?'':'s'} in focus.`:'Select a pair to trace its exposure.'}</div></section>
    </div>
  </div>;
}
function FragmentLeg({id,side,quantity,plus,onContract}:{id:string;side:string;quantity:number;plus:boolean;onContract:(id:string)=>void}) {return <div>{plus&&<span className="muted">+</span>}<button className="instrument-link" onClick={()=>onContract(id)}>{side} {contractView(id).authored.shortName}<small>{quantity.toLocaleString()} contracts</small></button></div>;}

const BASKET_TONE: Record<string,string> = {PARTITION:'teal',EXCLUSIVE:'amber',EXHAUSTIVE:'amber',OVERLAPPING:'',UNCOMPUTED:'amber'};

/**
 * What a selected set of contracts does to the outcome space.
 *
 * A pairwise relation cannot answer this. Whether a basket divides the outcomes
 * between them is what decides if holding all of it is a fixed payout or a
 * directional bet -- and if it is fixed, whether it was bought above or below
 * what it pays.
 */
function BasketPanel({basket}: {basket: ReturnType<typeof basketCoverage>}) {
  const {worldsPaying,worldCount,klass,headline,held,payout,excludedIds} = basket;
  const none=worldsPaying[0], one=worldsPaying[1]??0, many=worldsPaying.slice(2).reduce((a,b)=>a+b,0);
  const bars=[['None',none],['Exactly one',one],['Two or more',many]] as const;
  const constant=payout&&payout.minCents===payout.maxCents;
  const excluded=excludedIds.length>0&&<><div className="subpanel-title"><span>NOT COUNTED</span><span>{excludedIds.length} CONTRACT{excludedIds.length===1?'':'S'}</span></div>
    {excludedIds.map(id=><p className="quiet-copy" key={id}><b>{contractView(id).authored.shortName}</b> — {contractStatus(id).reason}</p>)}</>;

  // Nothing in the selection carries a predicate, so there are no worlds to
  // count. Stating that is the answer; drawing empty bars would imply one.
  if (klass==='UNCOMPUTED') return <div className="inspector-section">
    <Badge tone={BASKET_TONE[klass]}>NOT COMPUTABLE · {excludedIds.length} CONTRACTS</Badge>
    <h3>{headline}</h3>
    {excluded}
  </div>;

  return <div className="inspector-section">
    <Badge tone={BASKET_TONE[klass]}>{klass} · {basket.ids.length} CONTRACTS</Badge>
    <h3>{headline}</h3>
    <div className="subpanel-title"><span>HOW MANY PAY AT ONCE</span><span>OF {worldCount.toLocaleString()} WORLDS</span></div>
    <ul className="coverage-bars">{bars.map(([label,n])=><li key={label}><span>{label}</span><span className="coverage-track"><i style={{width:`${(n/worldCount)*100}%`}}/></span><b className="mono">{n.toLocaleString()}</b></li>)}</ul>
    {payout&&<>
      <div className="subpanel-title"><span>HELD IN THIS BASKET</span><span>{held.length} POSITION{held.length===1?'':'S'}</span></div>
      <div className="outcome-facts">
        <KeyValue label="Combined payout">{constant?`${money(payout.minCents)} in every world`:`${money(payout.minCents)} – ${money(payout.maxCents)}`}</KeyValue>
        <KeyValue label="Capital deployed">{money(payout.costCents)}</KeyValue>
        <KeyValue label={constant?'Certain result':'Worst case'}>
          <span className={payout.minCents-payout.costCents<0?'negative':'positive'}>{money(payout.minCents-payout.costCents,true)}</span>
        </KeyValue>
      </div>
      {constant&&<p className="quiet-copy">Constant terminal payout across every rate path.</p>}
    </>}
    {!payout&&<p className="quiet-copy">None of these contracts is held, so this describes the contracts themselves rather than an exposure.</p>}
    {excluded}
  </div>;
}

/** Nothing selected: what the whole book and the whole model look like. */
function UniverseOverview({positions,ids,relatableIds,relations,offsets,groups}: {
  positions: Position[]; ids: string[]; relatableIds: string[]; relations: Relation[];
  offsets: OffsetAssessment[]; groups: ReturnType<typeof exactGroupOffsets>;
}) {
  const summary=exposureSummary(positions);
  const misleading=offsets.filter(o=>o.misleading).length;
  return <>
    <div className="inspector-section">
      <div className="outcome-facts">
        <KeyValue label="Worst outcome"><span className="negative">{money(summary.worst.pnlCents,true)}</span></KeyValue>
        <KeyValue label="Best outcome"><span className="positive">{money(summary.best.pnlCents,true)}</span></KeyValue>
        <KeyValue label="Capital deployed">{money(summary.costCents)}</KeyValue>
        <KeyValue label="Distinct outcomes">{summary.scenarioCount.toLocaleString()}</KeyValue>
      </div>
      <p className="quiet-copy">{relatableIds.length} comparable / {ids.length} contracts · {relations.length.toLocaleString()} payoff relationships</p>
    </div>
    <div className="inspector-section">
      <h4>Hedges to look at</h4>
      <KeyValue label="Ranked pairs">{offsets.length}</KeyValue>
      <KeyValue label="Read as a hedge but are not"><span className={misleading?'negative':'positive'}>{misleading}</span></KeyValue>
      <KeyValue label="Exact multi-leg offsets">{groups.length}</KeyValue>
      
    </div>
    <div className="inspector-section">
      <h4>Model scope</h4>
      <KeyValue label="Contracts interpreted">{BASIS_SUMMARY.supportedContracts} / {SCOPE_COUNTS.total_contracts}</KeyValue>
      <KeyValue label="Worlds enumerated">{ALL_STATES.length.toLocaleString()}</KeyValue>
    </div>
  </>;
}
