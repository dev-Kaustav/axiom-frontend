import type { CSSProperties } from 'react';
import { contractView, type Position } from '../domain/engine';
import { bookFor, type FeedState } from '../domain/liveFeed';

export const quote = (x4: number) => `${(x4 / 100).toFixed(2)}¢`;
export const clockTime = (at: number) => new Date(at).toISOString().slice(11, 19);
const size = (n: number) => n.toLocaleString('en-US');
const moveClass = (m: number) => (m > 0 ? 'tick-up' : m < 0 ? 'tick-down' : '');

/** Watchlist of every tradeable contract, held first. A row loads the ticket. */
export function QuotesBoard({ feed, held, active, onPick }: {
  feed: FeedState; held: Set<string>; active: string; onPick: (contractId: string) => void;
}) {
  return <div className="term-body" tabIndex={0} role="region" aria-label="Quotes board">
    <table className="term-table quotes-table">
      <thead><tr><th scope="col">Contract · YES</th><th scope="col" className="numeric">Bid</th><th scope="col" className="numeric">Ask</th><th scope="col" className="numeric">Chg ¢</th></tr></thead>
      <tbody>{feed.ids.map(id => {
        const book = bookFor(feed, id, 'YES', 1)!;
        const change = feed.mids[id] - feed.open[id];
        return <tr key={id} className={id === active ? 'selected-row' : ''}>
          <th scope="row"><button className="quote-name" onClick={() => onPick(id)}>{held.has(id) && <i className="held-dot" title="Held" aria-label="Held" />}{contractView(id).displayName}</button></th>
          <td className="numeric"><span key={feed.step} className={moveClass(feed.moves[id])}>{book.bids[0] ? quote(book.bids[0].priceX4) : '—'}</span></td>
          <td className="numeric"><span key={feed.step} className={moveClass(feed.moves[id])}>{book.asks[0] ? quote(book.asks[0].priceX4) : '—'}</span></td>
          <td className={`numeric ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'muted'}`}>{change > 0 ? '+' : change < 0 ? '−' : ''}{(Math.abs(change) / 100).toFixed(2)}</td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = Math.max(hi - lo, 1);
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 200},${38 - ((v - lo) / span) * 34}`).join(' ');
  const up = values[values.length - 1] >= values[0];
  return <svg className="sparkline" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
    <polyline points={points} fill="none" stroke={up ? 'var(--up)' : 'var(--down)'} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
  </svg>;
}

/** Depth ladder for the ticket's contract and side, asks above bids. */
export function OrderBook({ feed, contractId, side }: { feed: FeedState; contractId: string; side: Position['side'] }) {
  const book = bookFor(feed, contractId, side);
  const history = (feed.history[contractId] ?? []).map(v => (side === 'YES' ? v : 10_000 - v));
  if (!book) return <div className="term-body"><p className="quiet-copy term-empty">No replay quote for this contract.</p></div>;
  const deepest = Math.max(...book.bids.map(l => l.size), ...book.asks.map(l => l.size));
  const open = side === 'YES' ? feed.open[contractId] : 10_000 - feed.open[contractId];
  const change = book.mid - open;
  return <div className="term-body" tabIndex={0} role="region" aria-label="Order book">
    <div className="book-summary">
      <div className="book-name"><span><span className="side-label">{side}</span><b>{contractView(contractId).displayName}</b></span><small className="muted">Spread {quote(book.spread)}</small></div>
      <div className="book-last"><strong key={feed.step} className={moveClass(feed.moves[contractId] * (side === 'YES' ? 1 : -1))}>{quote(book.mid)}</strong><span className={change > 0 ? 'positive' : change < 0 ? 'negative' : 'muted'}>{change >= 0 ? '+' : '−'}{(Math.abs(change) / 100).toFixed(2)}¢</span><Sparkline values={history} /></div>
    </div>
    <table className="term-table book-table">
      <thead><tr><th scope="col" className="numeric">Size</th><th scope="col" className="numeric">Bid</th><th scope="col" className="numeric">Ask</th><th scope="col" className="numeric">Size</th></tr></thead>
      <tbody>{Array.from({ length: Math.max(book.bids.length, book.asks.length) }, (_, i) => {
        const bid = book.bids[i];
        const ask = book.asks[i];
        return <tr key={i}>
          <td className="numeric depth-cell bid-depth" style={{ '--depth': `${((bid?.size ?? 0) / deepest) * 100}%` } as CSSProperties}>{bid ? size(bid.size) : ''}</td>
          <td className="numeric bid-price">{bid ? quote(bid.priceX4) : ''}</td>
          <td className="numeric ask-price">{ask ? quote(ask.priceX4) : ''}</td>
          <td className="numeric depth-cell ask-depth" style={{ '--depth': `${((ask?.size ?? 0) / deepest) * 100}%` } as CSSProperties}>{ask ? size(ask.size) : ''}</td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

export function TapePanel({ feed }: { feed: FeedState }) {
  const latest = feed.tape[0]?.id;
  return <section className="panel term-panel tape-panel" aria-labelledby="tape-heading">
    <header className="panel-header"><div className="panel-title"><h2 id="tape-heading">Tape</h2><span className="panel-count">Time &amp; sales</span></div></header>
    <div className="term-body" tabIndex={0} role="region" aria-label="Time and sales">
      <table className="term-table tape-table">
        <thead><tr><th scope="col">Time</th><th scope="col">Contract · YES</th><th scope="col">Side</th><th scope="col" className="numeric">Price</th><th scope="col" className="numeric">Size</th></tr></thead>
        <tbody>{feed.tape.map(p => <tr key={p.id} className={p.id === latest ? 'fresh' : ''}>
          <td className="muted">{clockTime(p.at)}</td><td className="tape-name">{contractView(p.contractId).displayName}</td>
          <td className={p.aggressor === 'BUY' ? 'positive' : 'negative'}>{p.aggressor}</td>
          <td className="numeric">{quote(p.priceX4)}</td><td className="numeric">{size(p.size)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}

export function NewsPanel({ feed }: { feed: FeedState }) {
  return <section className="panel term-panel news-panel" aria-labelledby="wire-heading">
    <header className="panel-header"><div className="panel-title"><h2 id="wire-heading">News wire</h2><span className="panel-count">Scripted replay</span></div></header>
    <div className="term-body" tabIndex={0} role="region" aria-label="News wire">
      <ul className="wire-list">{feed.news.map((n, i) => <li key={n.id} className={i === 0 ? 'fresh' : ''}>
        <span className="muted">{clockTime(n.at)}</span><span className="wire-tag">{n.tag}</span><span>{n.text}</span>
      </li>)}</ul>
    </div>
  </section>;
}
