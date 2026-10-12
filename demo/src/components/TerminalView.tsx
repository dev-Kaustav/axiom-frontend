import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Panel } from './primitives';
import { NewsPanel, OrderBook, QuotesBoard, TapePanel } from './MarketPanels';
import { useLiveFeed } from './useLiveFeed';
import type { TicketSeed } from './NewTradeDialog';
import { initialContract, sidePrice } from '../domain/liveFeed';
import { ReplayChart } from './ReplayChart';
import { ReplayControls } from './ReplayControls';
import type { Position } from '../domain/engine';

/** The live market screen: quotes, a focused contract's book, tape and wire. Nothing here simulates. */
export function TerminalView({ positions, onSimulate }: { positions: Position[]; onSimulate: (seed: TicketSeed) => void }) {
  const { feed, paused } = useLiveFeed();
  const held = useMemo(() => new Set(positions.map(p => p.contract_id)), [positions]);
  const [focus, setFocus] = useState(() => initialContract(feed, held));
  const [side, setSide] = useState<Position['side']>('YES');
  const handOff = (s: Position['side']) => {
    const priceX4 = sidePrice(feed, focus, s);
    if (priceX4 !== null) onSimulate({ contractId: focus, side: s, priceX4, at: Date.now() });
  };

  return <div className="terminal-workspace">
    <div className="trade-controls">
      <ReplayControls paused={paused} />
    </div>
    <div className="terminal-grid">
      <Panel title="Quotes" eyebrow={`${feed.ids.length} contracts`} className="term-panel quotes-panel">
        <QuotesBoard feed={feed} held={held} active={focus} onPick={setFocus} />
      </Panel>
      <Panel title="Chart" eyebrow="2s · candles + volume" className="term-panel chart-panel"><ReplayChart feed={feed} contractId={focus} side={side}/></Panel>
      <Panel title="Order book" className="term-panel book-panel"
        actions={<div className="segmented book-side" role="group" aria-label="Book side">{(['YES', 'NO'] as const).map(s =>
          <button key={s} aria-pressed={side === s} onClick={() => setSide(s)}>{s}</button>)}</div>}>
        <OrderBook feed={feed} contractId={focus} side={side} />
        <div className="handoff-actions">
          {(['YES', 'NO'] as const).map(s => <button key={s} className="panel-action" aria-label={`Simulate ${s} in Trade`} onClick={() => handOff(s)}>Simulate {s} <ArrowRight size={14} /></button>)}
        </div>
      </Panel>
      <TapePanel feed={feed} />
      <NewsPanel feed={feed} onPick={setFocus} />
    </div>
  </div>;
}
