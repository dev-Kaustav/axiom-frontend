import { Pause, Play, RotateCcw } from 'lucide-react';
import { restartFeed, setFeedPaused } from './useLiveFeed';

export function ReplayControls({ paused }: { paused: boolean }) {
  return <div className="feed-status">
    <span className={paused ? 'live-dot paused' : 'live-dot'} aria-hidden="true" />
    <span>{paused ? 'Paused' : 'Live'}</span>
    <button className="icon-button" onClick={() => setFeedPaused(!paused)} aria-label={paused ? 'Resume feed' : 'Pause feed'}>{paused ? <Play size={13} /> : <Pause size={13} />}</button>
    <button className="icon-button" onClick={restartFeed} aria-label="Restart session" title="Restart"><RotateCcw size={13} /></button>
  </div>;
}
