# Trade / Terminal split: plan (demo only)

Status: approved and executed 2026-10-07 (see the receipt in `Rook dark terminal implementation.md`). Scope: `axiom-frontend/demo` only.

## Why
The Trade screen mixed two jobs. One is a calm simulation and P&L workflow, which needs numbers that hold still. The other is a live market screen, which needs numbers that move. With both on one screen, the simulation is hard to follow. They become two screens. Both remain bounded workstation screens with no page scroll; any panel that needs more room scrolls inside itself.

Decisions (user, 2026-10-07):
- Trade uses fixed snapshot prices, not the feed.
- The space freed on Trade becomes a Positions & P&L book.
- Terminal hands a contract to Trade with "Simulate in Trade".
- Nothing is removed in this step; panels are relocated.
- The purple styling is left alone for now.
- The Terminal design will be revisited after the split.

## Navigation
Exposure · Portfolio · Scenarios · Relationships · **Trade** · **Terminal** (new, `#/terminal`) · Contracts · Data

## Trade = simulation + positions & P&L (static)
```
[target chip] [objective] [capital $5k $25k $50k $100k custom]                        [Simulation]
┌ IDEAS (ranked rows) ┬ SELECTED IDEA: header · KPIs · before/after chart ┬ TICKET           ┐
│                     ├ [Impact][Full comparison][Worst outcome][Relations]│ (YES|NO, qty, px, │
│                     │                                                   │  Use snapshot mark)│
├─────────────────────┴───────────────────────────────────────────────────┼ SIMULATIONS log  ┤
│ POSITIONS & P&L: every held position + the proposed trade (highlighted)  │                   │
│ contract · side · qty · entry · cost · payout · P&L at [Worst|Target|Best|Hold]             │
│ footer: book total before → after → change                                │                   │
└───────────────────────────────────────────────────────────────────────────┴───────────────────┘
```
- Ideas and results use the snapshot marks again (`suggestTrades` default price source), so numbers don't move unless you change something.
- The ticket still follows the selected idea until you edit it. "Use mid" becomes "Use snapshot mark".
- A hand-off from Terminal pre-fills the ticket and shows its source, for example "From Terminal · 2.70¢ at 13:47:39".
- The Positions & P&L book is new. It reuses `portfolioAt` and `costCents`. The scenario switch is Worst (after trade), Target (when arriving from Exposure), Best and Hold. The proposed trade row is highlighted, and contract names open the inspector.
- Kept as is: ideas, selected idea, analysis tabs, ticket and simulations log.
- Removed from Trade: quotes, order book, tape, news and the live indicator. All of them move to Terminal.

## Terminal = live market screen (uses the replay feed)
First cut reuses the existing panels; the design gets refined later.
```
[● Live · Replay · indicative] [Pause]                                     
┌ QUOTES BOARD (all 65, held first) ┬ FOCUSED CONTRACT: price · change · sparkline ┬ NEWS WIRE ┐
│ click row → focus                 │ order book ladder                           │           │
│                                   │ [Simulate YES in Trade] [Simulate NO in Trade]│           │
│                                   ├ TAPE (time & sales)                          │           │
└───────────────────────────────────┴──────────────────────────────────────────────┴───────────┘
```
- The `QuotesBoard`, `OrderBook`, `Sparkline`, tape and wire components move from `MarketPanels.tsx`, unchanged.
- The feed (`useLiveFeed`) is subscribed only here. It pauses when you leave Terminal and resumes where it stopped.
- "Simulate in Trade" passes `{contractId, side, priceX4, at}` up through `App` and navigates to Trade with the ticket pre-filled. The ticket is not auto-simulated; you press Simulate.

## Files
- `src/App.tsx`: add the Terminal page and icon, and hold the hand-off state, using the same pattern as `hedgeTarget`.
- New `src/components/TerminalView.tsx`, which lays out the existing market panels.
- `src/components/MarketPanels.tsx`: split `FeedPanels` into `TapePanel` and `NewsPanel`; the simulation log moves into Trade.
- `src/components/TradeSimulator.tsx`:
  - drop the feed;
  - add the positions book and the hand-off seed;
  - restore the snapshot wording in "How these ideas are ranked".
- `src/styles.css`:
  - new Trade grid: a positions book row plus a right column with the ticket over the log;
  - a `.terminal-workspace` grid;
  - no colour changes.
- `tests/demo.spec.ts`:
  - add Terminal to the page list, so the overflow and axe checks cover it;
  - move the streaming/pause test to Terminal;
  - assert that Trade numbers hold still over several seconds;
  - check the Trade and Terminal bounded layouts at 1440×900 and 1920×1080;
  - test the hand-off (Terminal → Trade ticket pre-filled → Simulate);
  - test the positions book: totals reconcile with the worst-case KPI, and the proposed row appears.

## Verification
- `npm test`: unit tests; no domain changes expected beyond the existing feed tests.
- `npm run build`.
- `npx playwright test`: full suite.
- Screenshots of Trade and Terminal at 1440 and 1920 in `rook-dark-terminal/`.
- A short receipt appended to `Rook dark terminal implementation.md`.
