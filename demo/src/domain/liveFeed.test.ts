import { describe, expect, it } from 'vitest';
import { HISTORY, NEWS, TAPE, bookFor, createFeed, feedPrices, sidePrice, warmFeed } from './liveFeed';
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
    const feed = warmFeed(createFeed(MARKS), 500, 0, 1);
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
