import { useRef, useState, type CSSProperties } from 'react';
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
      <thead><tr><th scope="col">Contract · YES</th><th scope="col" className="numeric">Mid / Δ</th><th scope="col" className="numeric" title="Session volume">Volume</th></tr></thead>
      <tbody>{feed.ids.map(id => {
        const book = bookFor(feed, id, 'YES', 1)!;
        const change = feed.mids[id] - feed.open[id];
        return <tr key={id} className={id === active ? 'selected-row' : ''}>
          <th scope="row"><button className="quote-name" aria-pressed={id === active} onClick={() => onPick(id)}>{held.has(id) && <i className="held-dot" title="Held" aria-label="Held" />}{contractView(id).displayName}</button></th>
          <td className="numeric"><span key={feed.step} className={moveClass(feed.moves[id])}>{quote(book.mid)}</span><small className={change > 0 ? 'positive' : change < 0 ? 'negative' : 'muted'}>{change >= 0 ? '+' : '−'}{(Math.abs(change) / 100).toFixed(2)}¢</small></td>
          <td className="numeric">{new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(feed.volume[id])}<small className="quote-spread">{book.bids[0] ? quote(book.bids[0].priceX4) : '—'} / {book.asks[0] ? quote(book.asks[0].priceX4) : '—'}</small></td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

/** Depth ladder for the ticket's contract and side, asks above bids. */
export function OrderBook({ feed, contractId, side }: { feed: FeedState; contractId: string; side: Position['side'] }) {
  const book = bookFor(feed, contractId, side);
  if (!book) return <div className="term-body"><p className="quiet-copy term-empty">No replay quote for this contract.</p></div>;
  const cumulative = (levels: typeof book.bids) => { let total = 0; return levels.map(l => ({ ...l, total: total += l.size })); };
  const bids = cumulative(book.bids);
  const asks = cumulative(book.asks);
  const deepest = Math.max(bids[bids.length - 1]?.total ?? 1, asks[asks.length - 1]?.total ?? 1);
  const renderLevel = (level: typeof bids[number], ask: boolean) => <tr key={`${ask ? 'ask' : 'bid'}-${level.priceX4}`}>
    <td className={`numeric ${ask ? 'ask-price' : 'bid-price'}`}>{quote(level.priceX4)}</td><td className="numeric">{size(level.size)}</td>
    <td className={`numeric depth-cell ${ask ? 'ask-depth' : 'bid-depth'}`} style={{ '--depth': `${level.total / deepest * 100}%` } as CSSProperties}>{size(level.total)}</td>
  </tr>;
  const open = side === 'YES' ? feed.open[contractId] : 10_000 - feed.open[contractId];
  const change = book.mid - open;
  return <div className="term-body" tabIndex={0} role="region" aria-label="Order book">
    <div className="book-summary">
      <div className="book-name"><span><span className="side-label">{side}</span><b>{contractView(contractId).displayName}</b></span><small className="muted">Spread {quote(book.spread)}</small></div>
      <div className="book-last"><strong key={feed.step} className={moveClass(feed.moves[contractId] * (side === 'YES' ? 1 : -1))}>{quote(book.mid)}</strong><span className={change > 0 ? 'positive' : change < 0 ? 'negative' : 'muted'}>{change >= 0 ? '+' : '−'}{(Math.abs(change) / 100).toFixed(2)}¢</span></div>
    </div>
    <table className="term-table book-table">
      <thead><tr><th scope="col" className="numeric">Price</th><th scope="col" className="numeric">Size</th><th scope="col" className="numeric">Total depth</th></tr></thead>
      <tbody>{[...asks].reverse().map(level => renderLevel(level, true))}
        <tr className="book-divider"><td colSpan={3}><strong>{quote(book.mid)}</strong><span>Spread {quote(book.spread)}</span></td></tr>
        {bids.map(level => renderLevel(level, false))}
      </tbody>
    </table>
  </div>;
}

/** Keep a stable review snapshot while scrolled back, including when buffers roll over. */
function useReview<T>(entries: T[]) {
  const [review, setReview] = useState<T[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const onScroll = () => { if ((ref.current?.scrollTop ?? 0) > 16) setReview(old => old ?? entries); else setReview(null); };
  const latest = () => { if (ref.current) ref.current.scrollTop = 0; setReview(null); };
  return { entries: review ?? entries, ref, onScroll, reviewing: review !== null, latest };
}

export function TapePanel({ feed }: { feed: FeedState }) {
  const review = useReview(feed.tape);
  return <section className="panel term-panel tape-panel" aria-labelledby="tape-heading">
    <header className="panel-header"><div className="panel-title"><h2 id="tape-heading">Tape</h2><span className="panel-count">Time &amp; sales · UTC</span></div>{review.reviewing && <button className="text-button" onClick={review.latest}>Return to latest</button>}</header>
    <div className="term-body" ref={review.ref} onScroll={review.onScroll} tabIndex={0} role="region" aria-label="Time and sales">
      <table className="term-table tape-table">
        <thead><tr><th scope="col">Time</th><th scope="col">Contract · YES</th><th scope="col">Side</th><th scope="col" className="numeric">Price</th><th scope="col" className="numeric">Size</th></tr></thead>
        <tbody>{review.entries.map(p => <tr key={p.id} className={!review.reviewing && feed.at - p.at < 1000 ? 'fresh' : ''}>
          <td className="muted">{clockTime(p.at)}</td><td className="tape-name">{contractView(p.contractId).displayName}</td>
          <td className={p.aggressor === 'BUY' ? 'positive' : 'negative'}>{p.aggressor}</td>
          <td className="numeric">{quote(p.priceX4)}</td><td className="numeric">{size(p.size)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}

export function NewsPanel({ feed, onPick }: { feed: FeedState; onPick: (id: string) => void }) {
  const review = useReview(feed.news);
  return <section className="panel term-panel news-panel" aria-labelledby="wire-heading">
    <header className="panel-header"><div className="panel-title"><h2 id="wire-heading">News wire</h2><span className="panel-count">Market updates</span></div>{review.reviewing && <button className="text-button" onClick={review.latest}>Return to latest</button>}</header>
    <div className="term-body" ref={review.ref} onScroll={review.onScroll} tabIndex={0} role="region" aria-label="News wire">
      <ul className="wire-list">{review.entries.map(n => <li key={n.id} className={!review.reviewing && feed.at - n.at < 1500 ? 'fresh' : ''}>
        <span className="muted">{clockTime(n.at)}</span><span className="wire-tag">{n.tag}</span><span className="wire-copy">{n.text}<span className="wire-contracts">{n.contracts.map(c => <button key={c.id} onClick={() => onPick(c.id)}>{contractView(c.id).authored.shortName} <span className={c.direction > 0 ? 'positive' : 'negative'}>{c.direction > 0 ? '↑' : '↓'}</span></button>)}</span></span>
      </li>)}</ul>
    </div>
  </section>;
}
