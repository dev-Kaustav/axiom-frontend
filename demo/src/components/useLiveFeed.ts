import { useSyncExternalStore } from 'react';
import { CONTRACT_VIEWS, POSITIONS } from '../domain/engine';
import { snapshotPrice } from '../domain/decisionSupport';
import { createFeed, stepFeed, warmFeed, type FeedState } from '../domain/liveFeed';

/**
 * One replay feed for the page, held outside React so only the Trade terminal
 * re-renders on a tick. It runs while something is subscribed, skips ticks in
 * a hidden tab, and starts paused with `?feed=paused` for stable captures.
 */
const INTERVAL_MS = 1500;
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
    snapshot = { feed: warmFeed(createFeed(marks()), 40, Date.now(), INTERVAL_MS), paused };
  }
  return snapshot;
}

const emit = () => listeners.forEach(listener => listener());

function tick() {
  const s = current();
  if (s.paused || document.hidden) return;
  snapshot = { ...s, feed: stepFeed(s.feed, Date.now()) };
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

export const useLiveFeed = () => useSyncExternalStore(subscribe, current);
