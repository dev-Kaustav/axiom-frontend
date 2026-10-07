# Rook dark terminal implementation — 2026-10-07

Demo execution receipt, not production phase completion or user visual approval. The user authorized the redesign, required independent selected-outcome scrolling/no outer-page scrollbar, and rejected both bevelled header gradients and the subsequent single-corner glow. The current correction uses several light pools, diagonal silver reflections and smoked glass. Angled linear reflections are explicitly requested; vertical bevel strips remain rejected.

## Implemented visual grammar

The shell owns a clipped 1000px light field behind the workspace. It stays anchored to the viewport while panels scroll and moves at most 10px horizontally / 6px vertically with a fine mouse pointer, using one transform with a 300ms settling transition. Pointer exit resets it; reduced motion or a coarse pointer disables movement. Tab hover and keyboard focus reveal a local violet glow. Three violet ellipses illuminate separate instruments: 310×230px at 73% / 112px (`#9564fa61`), 280×260px at 91% / 470px (`#9565ee66`), and 280×190px at 12% / 345px (`#8d60dc38`), fading to transparent at 76–78%. Neutral ellipses at 27% / 160px and 52% / 520px soften two 122-degree silver light shafts. Dark intervals separate the sources. Trade moves the first two lights down to 330px and 620px to illuminate its instruments rather than empty introductory space.

Glass panels, summaries and suggestion cards use a translucent `#1010149e` base with a restrained 128-degree reflection; the feature instrument uses `#10101470` and a 118-degree reflection. These large surfaces have one 12px backdrop blur, a fine `#ffffff24` outer edge and restrained shadow. Headers remain transparent. Near-black ground is `#060608`; opaque `#0b0b0f` heatmap/chart wells protect financial data contrast. Selected controls and primary actions retain their violet emphasis. Manrope, tabular numerals, existing text tiers and semantic green/red remain. No dependency or financial calculation change was needed. The user subsequently requested the restrained interaction-driven light movement above.

### Multiple-light correction verification

- Demo TypeScript/Vite build passes; existing >500kB bundle advisory remains.
- Focused browser checks pass: desktop horizontal overflow, all-route/modal axe accessibility, and bounded Exposure panels with independent keyboard scrolling and linked actions.
- All seven routes and inspector recaptured at 1440×900 and 1920×1080. Outer document dimensions equal the viewport on all routes. Exposure panel pairs remain 464px and 640px high, respectively.
- The 720×450 access-recovery check still reaches the hedge action and opens the selected simulation.
- These are implementation checks, not user visual approval. The broader behavioral verification below records the prior redesign; that lighting pass changed CSS only. The subsequent interaction/scrolling/layout correction also changes the demo shell, Exposure and Relationships components and their regression checks.

## Layout and information changes

- Exposure combines vulnerability, ranked scenario P&L, worst value/shortcut and hedge action. Four distinct summary metrics replace duplicated worst-case metrics. Stress-monitor duplication is removed; worst/best shortcuts and coverage remain.
- Heatmap and selected-outcome panels share a bounded grid row: 464px at 1440×900 and 640px at 1920×1080. The complete selected-outcome panel is a named, keyboard-focusable scroll region. Its title, readout and facts scroll away, allowing at least six contributions to fit at the smaller target size. The list has no nested scrolling; actions remain sticky at the bottom. Native scrolling remains available with scrollbar chrome hidden across the demo. No content-driven extension of the heatmap or blank area beneath it.
- The shell uses `100dvh` and a scrollable workspace. Its scrollbar is visually omitted for launch presentation; scrolling and keyboard access remain. The outer document has no overflow. Navigation resets workspace scroll.
- Portfolio has three summaries, readable financial cells and a separately scrolling group rail. Repeated grouping breadcrumbs are removed.
- Scenarios has 38px rows, readable financial data and bounded contributions. Relationships puts the map full height on the left (whole held canvas framed, 60% minimum) and a 520px right column with the inspector above Hedge failure watch; Exact group offsets are chips in the watch, and the navigator is a popover on the map's bottom bar next to the relation-type legend chips. Pair scope, group selection and evidence linkage are preserved.
- Simulation selection uses radial emphasis; ranked comparison chart is 160px high. Contracts omit repeated Event cells only when grouped by Event. Data evidence/assumptions/exclusions and inspector rationale/provenance use disclosures; published settlement rules, unsupported status and meaningful coverage remain available.
- At widths below 1100px Exposure stacks its panels and retains workspace scroll. This is access recovery, not a full mobile terminal redesign.

## Verification

- Demo TypeScript/Vite build and root landing/demo packaging pass. Existing >500kB chunk advisory remains.
- 66 domain/unit tests pass.
- Full browser suite: 15 tests pass. Includes portfolio/catalog grouping, scenario sorting, targeted/custom simulation, exact-cent validation, graph drag/pan/zoom/Fit/universe behavior, modal focus return and accessibility on all seven routes plus inspector.
- New regression checks both target viewports: equal heatmap/rail heights, full first-fold row within the workspace, no outer vertical overflow, keyboard scrolling to the final contribution, its inspector, and the visible hedge action. Target navigation resets workspace scroll.
- All seven routes captured at 1440×900 and 1920×1080; outer document dimensions match the viewport on every route. Inspector captured at both sizes.
- Smaller 720×450 CSS viewport: Exposure hedge action remains reachable and opens the target simulation. This checks reflow/access; actual browser 200% zoom and final Premiere export readability still need manual review.
- Axe reports no WCAG A/AA violations on every route and the modal. This does not replace manual review of every gradient composite, hover state or reduced video frame.

Screenshots are under [rook-dark-terminal](rook-dark-terminal/). Review [Exposure 1440](rook-dark-terminal/exposure-1440.png) and [Exposure 1920](rook-dark-terminal/exposure-1920.png) for the representative composition. All seven views and inspector are retained at both sizes. Screenshots are UI captures, not a product launch video approval.

## Production reuse

All six AXF UI phases already consume the shared UI contract and consolidated research. Reuse this correction and the bounded scrolling behavior through those documents; do not repeat broad reference research. Production independently implements its API-backed components, preserving honest states and exact values, without copying/importing demo source/styles/assets. No phase status or completion counters change as a consequence of this demo work.


## Interaction and panel correction — subsequent user request

- Complete selected-outcome panel now scrolls; its readout/facts leave the viewport, contributions use the available height, and actions stay pinned. Both target sizes expose at least six complete contribution rows after a normal wheel scroll without moving the heatmap/workspace. End reaches the last position; its inspector and hedge navigation work.
- Visible native scrollbar chrome is hidden across demo scroll surfaces. Native scrolling and keyboard focus remain available.
- The shared light field uses bounded pointer parallax (10px / 6px), resets on pointer exit, and is inert for reduced motion and coarse pointers. Navigation tabs respond to hover and keyboard focus with a local glow.
- Hedge failure watch and Exact group offsets swapped locations. The watch uses a wide, scrollable grid below the graph; exact groups occupy the left navigator. Focused-contract filtering, pair/group evidence and graph interactions remain intact.
- TypeScript/Vite build and whitespace checks pass. All 17 browser checks passed across the main run and focused rerun after restoring the selection-context label and correcting a drag-test coordinate for scaled headers. Includes all-route/modal axe, overflow, graph manipulation, outcome scrolling, panel placement and reduced motion. Existing >500kB bundle advisory remains.
- Recaptured all seven views plus inspector at both target sizes. Additional [scrolled outcome at 1440](rook-dark-terminal/outcome-scroll-1440.png) and [1920](rook-dark-terminal/outcome-scroll-1920.png) document the larger contribution reading area. Outer document remains bounded on every route; 720×450 hedge navigation still works.
- Relationships split: map left, inspector over hedge watch right; navigator folded into the map bottom bar. Screenshots: rook-dark-terminal/relationships-split-1440.png and -1920.png.

## Trade terminal — 2026-10-07 user request

- Trade is now a bounded workstation screen (references: Bloomberg, Kairos, SoftSolutions nexRates). Ideas and quotes are on the left, the selected idea and analysis tabs in the centre, the order book and ticket on the right, and tape, news wire and simulation log along the bottom. Every panel scrolls inside itself; the document and workspace never scroll at 1280×800, 1440×900 or 1920×1080. Drag-to-rearrange is deferred to production.
- Live feel comes from a seeded, looping replay feed (`demo/src/domain/liveFeed.ts`, wire copy in `demo/src/data/feed-script.ts`), labelled "Replay · indicative". Mids walk in 0.1¢ ticks from the snapshot marks and revert towards them. Per user decision, feed mids drive the suggestions and before/after results through `suggestTrades(..., priceOf)`; the snapshot remains the default source. The feed can be paused, skips ticks in hidden tabs, and starts paused with `?feed=paused` for stable captures and tests.
- The capital dropdown is replaced by $5k / $25k / $50k / $100k buttons plus a validated custom amount. Ideas are compact ranked rows marked for rank moves and survive re-pricing because they are keyed by contract and side. The ticket follows the previewed idea's live price until edited and has a YES/NO toggle and "Use mid".
- Feature parity: every previous Trade feature is retained. The four formerly collapsed sections are the Impact (helps and gives up, side by side), Full comparison, Worst outcome and Relations tabs.
- Checks: 71 unit tests (5 new feed/price-source tests) and 20 browser tests (3 new: bounded terminal at both target sizes, streaming/pause/selection survival, capital buttons and custom amount), including all-route axe. Build passes. Screenshots: rook-dark-terminal/trade-1440.png and trade-1920.png. With an Exposure target outcome, the control bar wraps to two rows at 1440 and the order book shrinks, but the screen stays bounded.

## Trade / Terminal split — 2026-10-07 user request

Supersedes the combined layout in the "Trade terminal" section above, following [the split plan](Trade%20and%20Terminal%20split%20plan.md). The user found simulation hard to follow alongside streaming data.
- **Trade** is simulation plus positions and P&L.
  - Ideas and before/after results use fixed snapshot marks again; no live feed runs here.
  - Layout: Ideas on the left; selected idea and analysis tabs in the centre; Ticket and Simulations log on the right; a new Positions & P&L book along the bottom.
  - The book shows every position plus the highlighted proposed trade, valued in Worst, Target, Best or All hold, with before/after totals. The Worst total reconciles with the worst-case readout.
  - The ticket's "Use mid" became "Use snapshot mark".
- **Terminal** is a new nav tab, `#/terminal`, for the live replay market.
  - Panels: quotes board, focused order book with a YES/NO view, tape and news wire.
  - The feed runs only while Terminal is open.
  - "Simulate YES/NO in Trade" opens Trade with the ticket pre-filled at the live mid and labelled "From Terminal · price at time". It does not auto-simulate.
- Nothing was removed; the panels were relocated. Colour and lighting are unchanged. Terminal design refinement is pending.
- Checks:
  - 71 unit tests and 23 browser tests pass. The overflow and axe sweeps now include Terminal.
  - New browser tests: both screens bounded at 1440×900 and 1920×1080; Trade numbers hold still; Terminal streams and pauses; hand-off; positions book reconciliation.
  - Build passes.
  - Screenshots: rook-dark-terminal/trade-1440/1920.png and terminal-1440/1920.png.

## Trade redesign with an RFQ ticket — 2026-10-07 user request

- The Positions & P&L widget is removed from Trade. The resident ticket is replaced by a floating **New trade · RFQ** dialog, modelled on a Bloomberg-style request-for-quote ticket. It takes no screen space until opened.
- The ticket sends a request (contract, buy YES/NO, quantity in lots of 100, optional limit) to four simulated providers: Venue book, Maker A, Maker B and Maker C.
  - Quotes arrive staggered. Each is live for 15 seconds with a countdown and shows offer, size (partial where a provider's limit is smaller), cost, difference from the mark, and the worst-case change if accepted.
  - The cheapest eligible quote is marked Best. Quotes above the limit or lapsed cannot be accepted.
  - A stage bar records Request, Quotes and Accept, with timestamps.
  - Accept simulates the quote. "Simulate at limit" keeps the old custom-price path. Amend and Refresh behave as on a dealer ticket.
  - The dialog states plainly that nothing is sent. Quotes come from `demo/src/domain/rfq.ts`: deterministic offsets from the snapshot mark, with unit tests.
- New layout:
  - Left: Ideas, full height.
  - Centre: the selected idea, with Inspect and **Request quotes** actions, a four-figure KPI strip (worst, best, profitable scenarios, capital) and a taller before/after chart, above the analysis tabs.
  - Right: Simulations log, full height. Selecting a run restores it.
- The Terminal hand-off now opens the RFQ ticket for that contract and side. It shows the live mid with "Use as limit" and never auto-simulates.
- Checks:
  - 75 unit tests (4 new RFQ) and 24 browser tests.
  - New browser coverage: the quote lifecycle with a mocked clock (arrival, limit, lapse, refresh, amend, accessibility scan of the open ticket), Terminal → RFQ → accept, and restoring a logged run.
  - Build passes.
  - Screenshots: rook-dark-terminal/trade-1440/1920.png and trade-rfq-1440/1920.png.
