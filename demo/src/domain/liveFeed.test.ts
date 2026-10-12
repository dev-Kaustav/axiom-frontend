import { describe, expect, it } from 'vitest';
import { HISTORY, NEWS, TAPE, bookFor, candlesFor, createFeed, feedPrices, initialContract, sidePrice, stepFeed, valuePortfolio, warmFeed, INTERVAL_MS, BURST_STEPS } from './liveFeed';
import { POSITIONS } from './engine';
import { snapshotPrice, suggestTrades } from './decisionSupport';

const MARKS = [['a', 175], ['b', 5_400], ['c', 9_900], ['d', 3]] as const;

describe('replay feed', () => {
  it('is deterministic for a seed', () => {
    const one = warmFeed(createFeed(MARKS, 11), 120, 1_000_000, 1500);
    const two = warmFeed(createFeed(MARKS, 11), 120, 1_000_000, 1500);
    expect(one).toEqual(two);
    expect(warmFeed(createFeed(MARKS, 12), 120, 1_000_000, 1500).mids).not.toEqual(one.mids);
  });

  it('keeps every price strictly inside (0, 1) and YES + NO complementary', () => {
    const feed = warmFeed(createFeed(MARKS), 2_000, 0, 1);
    for (const id of feed.ids) {
      const yes = sidePrice(feed, id, 'YES')!;
      const no = sidePrice(feed, id, 'NO')!;
      expect(Number.isInteger(yes)).toBe(true);
      expect(yes).toBeGreaterThan(0);
      expect(yes).toBeLessThan(10_000);
      expect(yes + no).toBe(10_000);
    }
    for (const p of feed.tape) { expect(p.priceX4).toBeGreaterThan(0); expect(p.priceX4).toBeLessThan(10_000); expect(p.size % 100).toBe(0); }
  });

  it('bounds its buffers and keeps the loop of headlines going', () => {
    const feed = warmFeed(createFeed(MARKS), 1000, 0, 1);
    expect(feed.history.a.length).toBe(HISTORY);
    expect(feed.tape.length).toBeLessThanOrEqual(TAPE);
    expect(feed.news.length).toBe(NEWS);
    expect(feed.tape.every((p, i, all) => i === 0 || p.id < all[i - 1].id)).toBe(true);
  });

  it('builds an uncrossed ladder whose lots cost whole cents', () => {
    const feed = warmFeed(createFeed(MARKS), 50, 0, 1);
    for (const id of feed.ids) for (const side of ['YES', 'NO'] as const) {
      const book = bookFor(feed, id, side)!;
      expect(book.bids[0]?.priceX4 ?? 0).toBeLessThan(book.asks[0]?.priceX4 ?? 10_000);
      for (const level of [...book.bids, ...book.asks]) {
        expect(level.priceX4).toBeGreaterThan(0);
        expect(level.priceX4).toBeLessThan(10_000);
        expect((level.size * level.priceX4) % 100).toBe(0);
      }
    }
    expect(bookFor(feed, 'missing', 'YES')).toBeNull();
  });

  it('drives suggestions: the snapshot source is the default and a moved price re-ranks', () => {
    expect(suggestTrades(POSITIONS, 2_500_000, 'downside')).toEqual(suggestTrades(POSITIONS, 2_500_000, 'downside', null, snapshotPrice));
    const base = suggestTrades(POSITIONS, 2_500_000, 'downside', null, snapshotPrice, 6);
    expect(base.length).toBeGreaterThan(3);
    const top = base[0].trade;
    // Make the top idea expensive; it must lose its place or shrink.
    const moved = (id: string, side: 'YES' | 'NO') => id === top.contract_id && side === top.side ? 9_000 : snapshotPrice(id, side);
    const after = suggestTrades(POSITIONS, 2_500_000, 'downside', null, moved, 6);
    expect(after.map(s => s.id)).not.toEqual(base.map(s => s.id));
    const feed = createFeed([[top.contract_id, top.side === 'YES' ? top.entry_price_x4 : 10_000 - top.entry_price_x4]]);
    expect(feedPrices(feed)(top.contract_id, top.side)).toBe(top.entry_price_x4);
  });
});

describe('coordinated replay', () => {
  it('publishes a linked catalyst every twelve seconds and drives its burst, prints and depth', () => {
    let feed = createFeed([['2589813', 5400], ['2589812', 4500]]);
    const start = feed;
    for (let i = 1; i <= BURST_STEPS; i++) {
      const before = feed;
      feed = stepFeed(feed, i * INTERVAL_MS);
      expect(feed.mids['2589813']).toBeGreaterThan(before.mids['2589813']);
      expect(feed.mids['2589812']).toBeLessThan(before.mids['2589812']);
      expect(feed.tape.some(p => p.at === feed.at && p.contractId === '2589813' && p.aggressor === 'BUY')).toBe(true);
      expect(feed.volume['2589813']).toBeGreaterThan(before.volume['2589813']);
    }
    expect(feed.news[0].contracts).toEqual([{ id: '2589813', direction: 1 }, { id: '2589812', direction: -1 }]);
    const active = bookFor(feed, '2589813', 'YES')!;
    const quiet = bookFor({ ...feed, burst: {} }, '2589813', 'YES')!;
    expect(active.bids.reduce((n, l) => n + l.size, 0)).toBeGreaterThan(quiet.bids.reduce((n, l) => n + l.size, 0));
    expect(feed.open).toEqual(start.open);
    for (let i = BURST_STEPS + 1; i <= 25; i++) feed = stepFeed(feed, i * INTERVAL_MS);
    expect(feed.news[0].at - feed.news[1].at).toBe(12_000);
  });

  it('derives exact OHLC and volume and transforms NO extrema', () => {
    const samples = [
      { at: 0, priceX4: 5000, volume: 10 }, { at: 500, priceX4: 5200, volume: 20 },
      { at: 1000, priceX4: 4900, volume: 30 }, { at: 1500, priceX4: 5100, volume: 40 },
      { at: 2000, priceX4: 4800, volume: 50 },
    ];
    expect(candlesFor(samples)).toEqual([
      { at: 0, open: 5000, high: 5200, low: 4900, close: 5100, volume: 100 },
      { at: 2000, open: 4800, high: 4800, low: 4800, close: 4800, volume: 50 },
    ]);
    expect(candlesFor(samples, 'NO')[0]).toEqual({ at: 0, open: 5000, high: 5100, low: 4800, close: 4900, volume: 100 });
    expect(candlesFor([])).toEqual([]);
  });

  it('warm-starts three minutes of timestamped samples with consistent session volume and extrema', () => {
    const feed = warmFeed(createFeed(MARKS), 360, 180_000, INTERVAL_MS);
    expect(feed.samples.b[0].at).toBe(0);
    expect(feed.samples.b.at(-1)?.at).toBe(180_000);
    expect(feed.samples.b).toHaveLength(HISTORY);
    expect(candlesFor(feed.samples.b).reduce((n, c) => n + c.volume, 0)).toBe(feed.volume.b);
    expect(feed.high.b).toBe(Math.max(...feed.history.b));
    expect(feed.low.b).toBe(Math.min(...feed.history.b));
    const long = warmFeed(createFeed(MARKS), 1500, 750_000, INTERVAL_MS);
    expect(long.samples.b).toHaveLength(HISTORY);
    expect(long.news).toHaveLength(NEWS);
  });

  it('selects the highest-volume active held market, with a quoted fallback', () => {
    const feed = { ...createFeed(MARKS), volume: { a: 90000, b: 500, c: 80000, d: 0 } };
    expect(initialContract(feed, new Set(['a', 'b', 'c']))).toBe('b');
    expect(initialContract(feed, new Set())).toBe('a');
  });

  it('values duplicate YES and NO holdings in integer units and excludes missing quotes explicitly', () => {
    const position = (id: string, side: 'YES' | 'NO', quantity: number, entry: number) => ({
      position_id: id, contract_id: id, side, quantity, entry_price_x4: entry, entry_price_text: String(entry / 10000),
    });
    const positions = [position('a', 'YES', 3, 4000), position('a', 'YES', 2, 4500), position('b', 'NO', 4, 6000), position('missing', 'YES', 10, 100)];
    expect(valuePortfolio(positions, { a: 5001, b: 3000 })).toEqual({ valueX4: 53005, pnlX4: 8005, quoted: 3, total: 4 });
    expect(valuePortfolio(positions, {})).toEqual({ valueX4: 0, pnlX4: 0, quoted: 0, total: 4 });
  });
});
