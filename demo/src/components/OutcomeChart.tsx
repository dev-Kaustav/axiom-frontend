import { money } from '../domain/engine';

/** Ordered scenario P&L: bars sample evenly across the sorted scenario set. */
export function OutcomeChart({ values, before }: { values: number[]; before?: number[] }) {
  const sorted = [...values].sort((a, b) => a - b);
  const baseline = before ? [...before].sort((a, b) => a - b) : null;
  const extent = Math.max(...values.map(Math.abs), ...(before ?? []).map(Math.abs), 1);
  const y = (value: number) => 70 - value / extent * 60;
  const sample = (series: number[], index: number) => series[Math.round(index / 63 * (series.length - 1))];
  return <div className="outcome-chart">
    <div className="chart-heading"><span>Ranked scenario P&amp;L</span><span>{baseline ? 'Before / after' : `${values.length.toLocaleString()} scenarios`}</span></div>
    <svg viewBox="0 0 512 140" preserveAspectRatio="none" role="img" aria-label={`Ordered scenario profit and loss, from ${money(sorted[0], true)} to ${money(sorted[sorted.length - 1], true)}${baseline ? '. Grey line shows the portfolio before the trade.' : ''}`}>
      <line x1="0" x2="512" y1="70" y2="70" stroke="var(--line-strong)" strokeDasharray="3 4" />
      {Array.from({ length: 64 }, (_, i) => { const value = sample(sorted, i); return <rect key={i} x={i * 8 + 1} y={Math.min(y(value), 70)} width="5" height={Math.max(Math.abs(y(value) - 70), 1)} rx="1" fill={value < 0 ? 'var(--down)' : 'var(--up)'} opacity=".8" />; })}
      {baseline && <polyline points={Array.from({ length: 64 }, (_, i) => `${i * 8 + 3},${y(sample(baseline, i))}`).join(' ')} fill="none" stroke="var(--text-secondary)" strokeWidth="2" />}
    </svg>
    <div className="chart-axis"><span>Worst outcome</span><span>Best outcome</span></div>
  </div>;
}
