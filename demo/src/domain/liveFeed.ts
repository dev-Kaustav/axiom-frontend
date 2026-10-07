import type { Position } from './exposure';
import { HEADLINES } from '../data/feed-script';

/**
 * A replayed market feed for the Trade terminal. Mids random-walk from the
 * snapshot marks in 0.1¢ ticks and drift back towards them, so a long demo
 * never wanders off. Seeded and pure: the same seed and step count always
 * produce the same prices. Prices are ten-thousandths of a dollar, YES-side;
 * the NO price is its complement.
 */
export const TICK_X4 = 10;
export const HISTORY = 60;
export const TAPE = 80;
export const NEWS = 30;
const MIN_X4 = 5;
const MAX_X4 = 9_995;

export type Move = -1 | 0 | 1;
export type Print = { id: number; at: number; contractId: string; aggressor: 'BUY' | 'SELL'; priceX4: number; size: number };
export type NewsItem = { id: number; at: number; tag: string; text: string };
export type BookLevel = { priceX4: number; size: number };
export type FeedState = {
  seed: number; step: number; ids: string[];
  open: Record<string, number>; mids: Record<string, number>; moves: Record<string, Move>;
  history: Record<string, number[]>; tape: Print[]; news: NewsItem[];
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
export function createFeed(marks: readonly (readonly [string, number])[], seed = 7): FeedState {
  const open: Record<string, number> = {};
  for (const [id, x4] of marks) open[id] = clampX4(x4);
  return {
    seed, step: 0, ids: marks.map(([id]) => id),
    open, mids: { ...open },
    moves: Object.fromEntries(marks.map(([id]) => [id, 0 as Move])),
    history: Object.fromEntries(marks.map(([id]) => [id, [open[id]]])),
    tape: [], news: [], nextId: 1, headline: 0,
  };
}

export function stepFeed(state: FeedState, at: number): FeedState {
  const step = state.step + 1;
  const r = rng(hash(state.seed, step));
  const mids = { ...state.mids };
  const moves: Record<string, Move> = {};
  const history: Record<string, number[]> = {};
  for (const id of state.ids) {
    const mid = mids[id];
    let move: Move = 0;
    if (r() < 0.28) {
      // Lean back towards the open: the further away, the stronger the pull.
      const pull = Math.max(-0.25, Math.min(0.25, (mid - state.open[id]) / Math.max(state.open[id], 200)));
      const up = r() < 0.5 - pull;
      const ticks = r() < 0.8 ? 1 : 2;
      const next = clampX4(mid + (up ? 1 : -1) * ticks * TICK_X4);
      move = next > mid ? 1 : next < mid ? -1 : 0;
      mids[id] = next;
    }
    moves[id] = move;
    history[id] = [...state.history[id], mids[id]].slice(-HISTORY);
  }

  let nextId = state.nextId;
  const prints: Print[] = [];
  const count = Math.floor(r() * 4);
  for (let i = 0; i < count && state.ids.length; i++) {
    const contractId = state.ids[Math.floor(r() * state.ids.length)];
    const mid = mids[contractId];
    const half = spreadOf(mid) / 2;
    const aggressor = r() < 0.5 ? 'BUY' : 'SELL';
    prints.push({
      id: nextId++, at, contractId, aggressor,
      priceX4: clampX4(Math.round(aggressor === 'BUY' ? mid + half : mid - half)),
      size: (1 + Math.floor(r() * r() * 250)) * 100,
    });
  }

  let headline = state.headline;
  let news = state.news;
  if (step % 5 === 1) {
    const item = HEADLINES[headline % HEADLINES.length];
    news = [{ id: nextId++, at, ...item }, ...news].slice(0, NEWS);
    headline += 1;
  }

  return {
    ...state, step, mids, moves, history, news, nextId, headline,
    tape: [...prints.reverse(), ...state.tape].slice(0, TAPE),
  };
}

/** Run `steps` ticks ending at `now`, so the terminal opens with history already on screen. */
export function warmFeed(state: FeedState, steps: number, now: number, intervalMs: number): FeedState {
  let s = state;
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
    return (1 + Math.floor(r() * r() * 400)) * 100;
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
