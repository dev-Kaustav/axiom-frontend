import { useMemo, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { Badge, Panel } from './primitives';
import { NewsPanel, OrderBook, QuotesBoard, TapePanel } from './MarketPanels';
import { setFeedPaused, useLiveFeed } from './useLiveFeed';
import type { TicketSeed } from './NewTradeDialog';
import { sidePrice } from '../domain/liveFeed';
import type { Position } from '../domain/engine';

/** The live market screen: quotes, a focused contract's book, tape and wire. Nothing here simulates. */
export function TerminalView({ positions, onSimulate }: { positions: Position[]; onSimulate: (seed: TicketSeed) => void }) {
  const { feed, paused } = useLiveFeed();
  const held = useMemo(() => new Set(positions.map(p => p.contract_id)), [positions]);
  const [focus, setFocus] = useState(() => feed.ids[0]);
  const [side, setSide] = useState<Position['side']>('YES');
  const handOff = (s: Position['side']) => {
    const priceX4 = sidePrice(feed, focus, s);
    if (priceX4 !== null) onSimulate({ contractId: focus, side: s, priceX4, at: Date.now() });
  };

  return <div className="terminal-workspace">
    <div className="trade-controls">
      <div className="feed-status">
        <span className={paused ? 'live-dot paused' : 'live-dot'} aria-hidden="true" />
        <span>{paused ? 'Paused' : 'Live'}</span><small>Replay · indicative</small>
        <button className="icon-button" onClick={() => setFeedPaused(!paused)} aria-label={paused ? 'Resume feed' : 'Pause feed'}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>
      </div>
      <Badge>Market view · no execution</Badge>
    </div>
    <div className="terminal-grid">
      <Panel title="Quotes" eyebrow={`${feed.ids.length} contracts`} className="term-panel quotes-panel">
        <QuotesBoard feed={feed} held={held} active={focus} onPick={setFocus} />
      </Panel>
      <Panel title="Order book" eyebrow="Replay" className="term-panel book-panel"
        actions={<div className="segmented book-side" role="group" aria-label="Book side">{(['YES', 'NO'] as const).map(s =>
          <button key={s} aria-pressed={side === s} onClick={() => setSide(s)}>{s}</button>)}</div>}>
        <OrderBook feed={feed} contractId={focus} side={side} />
        <div className="handoff-actions">
          {(['YES', 'NO'] as const).map(s => <button key={s} className="panel-action" onClick={() => handOff(s)}>Simulate {s} in Trade <ArrowRight size={14} /></button>)}
        </div>
      </Panel>
      <TapePanel feed={feed} />
      <NewsPanel feed={feed} />
    </div>
  </div>;
}
