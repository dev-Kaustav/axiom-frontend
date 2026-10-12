import type { Position } from './exposure';
import { HEADLINES } from '../data/feed-script';

/**
 * A replayed market feed for Exposure and Terminal. Mids random-walk from the
 * snapshot marks in 0.1¢ ticks and drift back towards them, so a long demo
 * never wanders off. Seeded and pure: the same seed and step count always
 * produce the same prices. Prices are ten-thousandths of a dollar, YES-side;
 * the NO price is its complement.
 */
export const TICK_X4 = 10;
export const INTERVAL_MS = 500;
export const HISTORY = 361;
export const CATALYST_STEPS = 24;
export const BURST_STEPS = 8;
export const TAPE = 80;
export const NEWS = 30;
const MIN_X4 = 5;
const MAX_X4 = 9_995;

export type Move = -1 | 0 | 1;
export type Print = { id: number; at: number; contractId: string; aggressor: 'BUY' | 'SELL'; priceX4: number; size: number };
export type NewsItem = { id: number; at: number; tag: string; text: string; contracts: { id: string; direction: number }[] };
export type PriceSample = { at: number; priceX4: number; volume: number };
export type Candle = { at: number; open: number; high: number; low: number; close: number; volume: number };
export type BookLevel = { priceX4: number; size: number };
export type FeedState = {
  seed: number; step: number; ids: string[];
  open: Record<string, number>; mids: Record<string, number>; moves: Record<string, Move>;
  history: Record<string, number[]>; samples: Record<string, PriceSample[]>;
  volume: Record<string, number>; high: Record<string, number>; low: Record<string, number>;
  at: number; burst: Record<string, number>; burstUntil: number; tape: Print[]; news: NewsItem[];
  nextId: number; headline: number;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function hash(...parts: (string | number)[]) {
  let h = 2_166_136_261;
  for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16_777_619); }
  return h >>> 0;
}

const clampX4 = (x4: number) => Math.min(MAX_X4, Math.max(MIN_X4, x4));
const spreadOf = (mid: number) => (mid < 500 || mid > 9_500 ? TICK_X4 : 2 * TICK_X4);

/** `marks` are [contractId, YES price x4]; their order is the board order. */
export function createFeed(marks: readonly (readonly [string, number])[], seed = 7, at = 0): FeedState {
  const open: Record<string, number> = {};
  for (const [id, x4] of marks) open[id] = clampX4(x4);
  return {
    seed, step: 0, ids: marks.map(([id]) => id),
    open, mids: { ...open },
    moves: Object.fromEntries(marks.map(([id]) => [id, 0 as Move])),
    history: Object.fromEntries(marks.map(([id]) => [id, [open[id]]])),
    samples: Object.fromEntries(marks.map(([id]) => [id, [{ at, priceX4: open[id], volume: 0 }]])),
    volume: Object.fromEntries(marks.map(([id]) => [id, 0])), high: { ...open }, low: { ...open },
    at, burst: {}, burstUntil: 0, tape: [], news: [], nextId: 1, headline: 0,
  };
}

export function stepFeed(state: FeedState, at: number): FeedState {
  const step = state.step + 1;
  const r = rng(hash(state.seed, step));
  const mids = { ...state.mids };
  const moves: Record<string, Move> = {};
  const history: Record<string, number[]> = {};
  const samples: Record<string, PriceSample[]> = {};
  const volume = { ...state.volume };
  const high = { ...state.high };
  const low = { ...state.low };
  let nextId = state.nextId;
  let headline = state.headline;
  let news = state.news;
  let burst = state.burst;
  let burstUntil = state.burstUntil;
  if (step % CATALYST_STEPS === 1) {
    const item = HEADLINES[headline % HEADLINES.length];
    const contracts = item.contracts.filter(c => state.ids.includes(c.id));
    news = [{ id: nextId++, at, tag: item.tag, text: item.text, contracts }, ...news].slice(0, NEWS);
    burst = Object.fromEntries(contracts.map(c => [c.id, c.direction]));
    burstUntil = step + BURST_STEPS;
    headline += 1;
  }
  const active = step < burstUntil ? burst : {};
  for (const id of state.ids) {
    const mid = mids[id];
    // Active markets move more; tails retain small, two-way ticks.
    const activity = Math.max(0.12, Math.min(mid, 10_000 - mid) / 5_000);
    const pull = Math.max(-0.2, Math.min(0.2, (mid - state.open[id]) / 1800));
    const direction = active[id] || (r() < 0.5 - pull ? 1 : -1);
    const ticks = active[id] ? Math.max(1, Math.round(activity * (5 + r() * 5))) : Math.max(1, Math.round(activity * (1 + r() * 3)));
    const next = active[id] || r() < 0.65 ? clampX4(mid + direction * ticks * TICK_X4) : mid;
    mids[id] = next;
    moves[id] = next > mid ? 1 : next < mid ? -1 : 0;
    high[id] = Math.max(high[id], next);
    low[id] = Math.min(low[id], next);
    history[id] = [...state.history[id], next].slice(-HISTORY);
  }

  const prints: Print[] = [];
  const print = (contractId: string, direction?: number) => {
    const mid = mids[contractId];
    const aggressor = (direction ?? (r() < 0.5 ? 1 : -1)) > 0 ? 'BUY' : 'SELL';
    const size = (1 + Math.floor(r() * r() * (direction || r() < 0.08 ? 900 : 180))) * 100;
    prints.push({ id: nextId++, at, contractId, aggressor,
      priceX4: clampX4(Math.round(mid + (aggressor === 'BUY' ? 1 : -1) * spreadOf(mid) / 2)), size });
    volume[contractId] += size;
  };
  for (const id of Object.keys(active)) print(id, active[id]);
  const count = 2 + Math.floor(r() * 3);
  for (let i = 0; i < count && state.ids.length; i++) print(state.ids[Math.floor(r() * state.ids.length)]);
  for (const id of state.ids) samples[id] = [...state.samples[id], {
    at, priceX4: mids[id], volume: volume[id] - state.volume[id],
  }].slice(-HISTORY);
  return { ...state, step, at, mids, moves, history, samples, volume, high, low,
    burst, burstUntil, news, nextId, headline, tape: [...prints.reverse(), ...state.tape].slice(0, TAPE) };
}

/** Run `steps` ticks ending at `now`, so the terminal opens with history already on screen. */
export function warmFeed(state: FeedState, steps: number, now: number, intervalMs: number): FeedState {
  const start = now - steps * intervalMs;
  let s = { ...state, at: start, samples: Object.fromEntries(state.ids.map(id => [id, [{ at: start, priceX4: state.mids[id], volume: 0 }]])) };
  for (let i = steps - 1; i >= 0; i--) s = stepFeed(s, now - i * intervalMs);
  return s;
}

export function sidePrice(state: FeedState, contractId: string, side: Position['side']): number | null {
  const mid = state.mids[contractId];
  if (mid === undefined) return null;
  return side === 'YES' ? mid : 10_000 - mid;
}

/** A price source for suggestTrades: the live indicative mid. */
export const feedPrices = (state: FeedState) => (contractId: string, side: Position['side']) => sidePrice(state, contractId, side);

/** A synthetic depth ladder around the mid; sizes refresh every second step. */
export function bookFor(state: FeedState, contractId: string, side: Position['side'], levels = 5) {
  const mid = sidePrice(state, contractId, side);
  if (mid === null) return null;
  const half = spreadOf(mid) / 2;
  const bestBid = Math.round(mid - half);
  const bestAsk = Math.round(mid + half);
  const size = (tag: string, i: number) => {
    const r = rng(hash(state.seed, contractId, side, state.step >> 1, tag, i));
    const direction = (state.step < state.burstUntil ? state.burst[contractId] ?? 0 : 0) * (side === 'YES' ? 1 : -1);
    const pressure = direction === (tag === 'b' ? 1 : -1) ? 2 : 1;
    return (1 + Math.floor(r() * r() * 400 * pressure)) * 100;
  };
  const bids: BookLevel[] = [];
  const asks: BookLevel[] = [];
  for (let i = 0; i < levels; i++) {
    const b = bestBid - i * TICK_X4;
    const a = bestAsk + i * TICK_X4;
    if (b > 0) bids.push({ priceX4: b, size: size('b', i) });
    if (a < 10_000) asks.push({ priceX4: a, size: size('a', i) });
  }
  return { mid, bids, asks, spread: bestAsk - bestBid };
}

/** Two-second candles from mark samples, with the volume printed in each bucket. */
export function candlesFor(samples: PriceSample[], side: Position['side'] = 'YES'): Candle[] {
  const candles: Candle[] = [];
  for (const sample of samples) {
    const at = Math.floor(sample.at / 2000) * 2000;
    let candle = candles[candles.length - 1];
    if (!candle || candle.at !== at) {
      candle = { at, open: sample.priceX4, high: sample.priceX4, low: sample.priceX4, close: sample.priceX4, volume: 0 };
      candles.push(candle);
    }
    candle.high = Math.max(candle.high, sample.priceX4);
    candle.low = Math.min(candle.low, sample.priceX4);
    candle.close = sample.priceX4;
    candle.volume += sample.volume;
  }
  return side === 'YES' ? candles : candles.map(c => ({ ...c,
    open: 10_000 - c.open, high: 10_000 - c.low, low: 10_000 - c.high, close: 10_000 - c.close,
  }));
}

/** Value only quoted holdings, aggregating integer ten-thousandths before formatting. */
export function valuePortfolio(positions: readonly Position[], prices: Record<string, number>) {
  let valueX4 = 0;
  let costX4 = 0;
  let quoted = 0;
  for (const p of positions) {
    const mid = prices[p.contract_id];
    if (mid === undefined) continue;
    quoted++;
    valueX4 += p.quantity * (p.side === 'YES' ? mid : 10_000 - mid);
    costX4 += p.quantity * p.entry_price_x4;
  }
  return { valueX4, pnlX4: valueX4 - costX4, quoted, total: positions.length };
}

export function initialContract(feed: FeedState, held: Set<string>) {
  return feed.ids.filter(id => held.has(id) && feed.mids[id] >= 1000 && feed.mids[id] <= 9000)
    .sort((a, b) => feed.volume[b] - feed.volume[a])[0] ?? feed.ids[0];
}
