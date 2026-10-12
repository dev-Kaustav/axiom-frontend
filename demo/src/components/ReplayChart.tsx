import { useState } from 'react';
import { contractView, type Position } from '../domain/engine';
import { candlesFor, sidePrice, type FeedState } from '../domain/liveFeed';
import { clockTime, quote } from './MarketPanels';

export function ReplayChart({ feed, contractId, side }: { feed: FeedState; contractId: string; side: Position['side'] }) {
  const candles = candlesFor(feed.samples[contractId] ?? [], side);
  const [hover, setHover] = useState<number | null>(null);
  const current = sidePrice(feed, contractId, side);
  if (!candles.length || current === null) return <p>No replay history.</p>;
  const read = candles[Math.min(hover ?? candles.length - 1, candles.length - 1)];
  const lo = Math.min(...candles.map(c => c.low));
  const hi = Math.max(...candles.map(c => c.high));
  const pad = Math.max(30, (hi - lo) * .12);
  const bottom = Math.max(0, lo - pad);
  const top = Math.min(10_000, hi + pad);
  const y = (v: number) => 18 + (top - v) / (top - bottom) * 226;
  const width = 620 / candles.length;
  const x = (i: number) => 12 + (i + .5) * width;
  const maxVolume = Math.max(...candles.map(c => c.volume), 1);
  const open = side === 'YES' ? feed.open[contractId] : 10_000 - feed.open[contractId];
  const change = current - open;
  return <div className="replay-chart" data-contract={contractId} data-side={side}>
    <div className="chart-contract"><span className="side-label">{side}</span><b>{contractView(contractId).displayName}</b><strong>{quote(current)}</strong><span className={change >= 0 ? 'positive' : 'negative'}>{change >= 0 ? '+' : '−'}{(Math.abs(change) / 100).toFixed(2)}¢</span></div>
    <div className="candle-readout"><span>{clockTime(read.at)} UTC</span><span>O {quote(read.open)}</span><span>H {quote(read.high)}</span><span>L {quote(read.low)}</span><span>C {quote(read.close)}</span><span>Vol {read.volume.toLocaleString('en-US')}</span></div>
    <svg viewBox="0 0 710 340" preserveAspectRatio="none" role="img" aria-label={`${side} ${contractView(contractId).displayName}, two-second candles and volume. Use left and right arrows to review candles.`} tabIndex={0}
      onPointerMove={e => { const rect = e.currentTarget.getBoundingClientRect(); setHover(Math.max(0, Math.min(candles.length - 1, Math.floor(((e.clientX - rect.left) / rect.width * 710 - 12) / width)))); }}
      onPointerLeave={() => setHover(null)} onBlur={() => setHover(null)}
      onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setHover(Math.max(0, Math.min(candles.length - 1, (hover ?? candles.length - 1) + (e.key === 'ArrowLeft' ? -1 : 1)))); } }}>
      {[0, 1, 2, 3, 4].map(i => { const price = top - i / 4 * (top - bottom); return <g key={i}><line x1="12" x2="632" y1={y(price)} y2={y(price)} stroke="var(--line)"/><text x="643" y={y(price) + 4}>{quote(price)}</text></g>; })}
      {candles.map((c, i) => { const color = c.close >= c.open ? 'var(--up-soft)' : 'var(--down-soft)'; return <g key={c.at}>
        <line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} stroke={color}/>
        <rect x={x(i) - width * .3} y={Math.min(y(c.open), y(c.close))} width={width * .6} height={Math.max(1, Math.abs(y(c.open) - y(c.close)))} fill={color}/>
        <rect x={x(i) - width * .3} y={304 - c.volume / maxVolume * 42} width={width * .6} height={Math.max(1, c.volume / maxVolume * 42)} fill={color} opacity=".45"/>
      </g>; })}
      <line x1="12" x2="632" y1={y(current)} y2={y(current)} stroke="var(--accent-soft)" strokeDasharray="4 4"/>
      <rect x="636" y={y(current) - 9} width="73" height="18" rx="3" fill="var(--bg-overlay)"/><text x="643" y={y(current) + 4} className="current-price">{quote(current)}</text>
      {hover !== null && <line x1={x(Math.min(hover, candles.length - 1))} x2={x(Math.min(hover, candles.length - 1))} y1="18" y2="306" stroke="var(--text-muted)" strokeDasharray="2 3"/>}
      {[0, .25, .5, .75, 1].map(f => { const i = Math.round(f * (candles.length - 1)); return <text key={f} x={x(i)} y="330" textAnchor={f === 0 ? 'start' : f === 1 ? 'end' : 'middle'}>{clockTime(candles[i].at)}</text>; })}
      <text x="643" y="285">Volume</text>
    </svg>
    <div className="chart-session"><span>2s candles · UTC</span><span>Session H {quote(side === 'YES' ? feed.high[contractId] : 10_000 - feed.low[contractId])} / L {quote(side === 'YES' ? feed.low[contractId] : 10_000 - feed.high[contractId])}</span><span>{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(feed.volume[contractId])} session volume</span></div>
  </div>;
}
