import { useMemo } from 'react';
import { money, type Position } from '../domain/engine';
import { valuePortfolio } from '../domain/liveFeed';
import { useLiveFeed } from './useLiveFeed';
import { ReplayControls } from './ReplayControls';
import { clockTime } from './MarketPanels';

/** Only this hero subscribes to ticks; settlement analysis remains independent. */
export function LivePortfolio({ positions }: { positions: Position[] }) {
  const { feed, paused } = useLiveFeed();
  const held = useMemo(() => new Set(positions.map(p => p.contract_id)), [positions]);
  const value = valuePortfolio(positions, feed.mids);
  const start = valuePortfolio(positions, feed.open);
  const ids = feed.ids.filter(id => held.has(id));
  const samples = ids.length ? feed.samples[ids[0]].map((sample, i) => ({ at: sample.at,
    value: valuePortfolio(positions, Object.fromEntries(ids.map(id => [id, feed.samples[id][i].priceX4]))).valueX4 / 100,
  })) : [];
  const low = Math.min(...samples.map(s => s.value));
  const high = Math.max(...samples.map(s => s.value));
  const span = Math.max(high - low, 100);
  const y = (v: number) => 88 - (v - low) / span * 68;
  const points = samples.map((s, i) => `${i / Math.max(samples.length - 1, 1) * 560},${y(s.value)}`).join(' ');
  const catalyst = feed.news.find(n => n.contracts.some(c => held.has(c.id)));
  return <div className="live-portfolio">
    <div className="market-metrics">
      <div><span>{value.quoted === value.total ? 'Market value' : 'Quoted holdings value'}</span><strong data-testid="market-value">{value.quoted ? money(value.valueX4 / 100) : '—'}</strong></div>
      <div><span>Unrealized P&amp;L</span><strong data-testid="market-pnl" className={value.pnlX4 >= 0 ? 'positive' : 'negative'}>{value.quoted ? money(value.pnlX4 / 100, true) : '—'}</strong></div>
    </div>
    {value.quoted !== value.total && <small className="quote-coverage">{value.quoted} / {value.total} holdings quoted · P&amp;L on quoted holdings only</small>}
    <svg className="portfolio-value-chart" viewBox="0 0 560 110" preserveAspectRatio="none" role="img" aria-label="Live portfolio market value over the last three replay minutes">
      {[20, 54, 88].map(y => <line key={y} x1="0" x2="560" y1={y} y2={y} stroke="var(--line)"/>)}
      {!!samples.length && <><polygon points={`0,96 ${points} 560,96`} fill="var(--accent-fill)"/><polyline points={points} fill="none" stroke="var(--accent-soft)" strokeWidth="2" vectorEffect="non-scaling-stroke"/><circle cx="560" cy={y(samples[samples.length - 1].value)} r="3" fill="var(--accent-soft)"/></>}
    </svg>
    <div className="portfolio-playback"><div className="portfolio-change"><span className={value.valueX4 >= start.valueX4 ? 'positive' : 'negative'}>{value.quoted ? money((value.valueX4 - start.valueX4) / 100, true) : '—'}</span> since session start</div><ReplayControls paused={paused}/></div>
    <div className="portfolio-catalyst"><span>{catalyst ? `${clockTime(catalyst.at)} · ${catalyst.tag}` : 'Market update'}</span><b title={catalyst?.text}>{catalyst?.text ?? 'Awaiting market update'}</b></div>
  </div>;
}
