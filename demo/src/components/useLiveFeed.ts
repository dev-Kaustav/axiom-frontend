import { useSyncExternalStore } from 'react';
import { CONTRACT_VIEWS, POSITIONS } from '../domain/engine';
import { snapshotPrice } from '../domain/decisionSupport';
import { createFeed, stepFeed, warmFeed, INTERVAL_MS, type FeedState } from '../domain/liveFeed';

/**
 * One replay feed for the page, held outside React so Exposure and Terminal
 * share one session. It runs while something is subscribed, skips ticks in
 * a hidden tab, and starts paused with `?feed=paused` for stable captures.
 */
const FIXED_AT = Date.UTC(2026, 9, 12, 14, 0, 0);
let replayStart: number;
type Snapshot = { feed: FeedState; paused: boolean };

let snapshot: Snapshot | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function marks(): [string, number][] {
  const held = new Set(POSITIONS.map(p => p.contract_id));
  const out: [string, number][] = [];
  for (const v of CONTRACT_VIEWS) {
    if (!v.authored.claim || v.degenerate || v.contract.closed) continue;
    const id = v.contract.contract_id;
    const no = snapshotPrice(id, 'NO');
    const yes = snapshotPrice(id, 'YES') ?? (no === null ? null : 10_000 - no);
    if (yes !== null) out.push([id, yes]);
  }
  return out.sort((a, b) => Number(held.has(b[0])) - Number(held.has(a[0])));
}

function current(): Snapshot {
  if (!snapshot) {
    const paused = new URLSearchParams(window.location.search).get('feed') === 'paused';
    replayStart = paused ? FIXED_AT : Date.now();
    snapshot = { feed: warmFeed(createFeed(marks()), 360, replayStart, INTERVAL_MS), paused };
  }
  return snapshot;
}

const emit = () => listeners.forEach(listener => listener());

function tick() {
  const s = current();
  if (s.paused || document.hidden) return;
  snapshot = { ...s, feed: stepFeed(s.feed, s.feed.at + INTERVAL_MS) };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(tick, INTERVAL_MS);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) { clearInterval(timer); timer = undefined; }
  };
}

export function setFeedPaused(paused: boolean) {
  snapshot = { ...current(), paused };
  emit();
}

export function restartFeed() {
  snapshot = { ...current(), feed: warmFeed(createFeed(marks()), 360, replayStart, INTERVAL_MS) };
  emit();
}

export const useLiveFeed = () => useSyncExternalStore(subscribe, current);
