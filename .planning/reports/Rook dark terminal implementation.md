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
