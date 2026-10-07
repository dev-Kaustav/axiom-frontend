# Rook frontend visual and interaction contract

Status: **revised direction; demo proof implemented, production adoption pending** (2026-10-07). Supersedes the 2026-09-30 visual values, demo-parity requirements and font restrictions. No new checker approval or implementation is claimed. API, identity, exact-value, honest-state and accessibility requirements remain active.

## Authority and reusable research

The user requests a finished dark product with stronger background/foreground contrast, tasteful selective gradients, Rook/violet identity, Manrope sans everywhere, readable text, no price ribbon and no unnecessary disclaimers. Uniform grey lightening and indiscriminate violet washes are rejected. Old design tokens and rules carry no authority.

Consume the existing [consolidated redesign report](reports/Rook%20dark%20terminal%20redesign.md), [code audit](research_notes/Rook%20dark%20terminal%20redesign/code-audit.md) and [Dribbble research](research_notes/Rook%20dark%20terminal%20redesign/dribbble.md) when planning/executing these phases. They include source limitations; do not treat inaccessible reference artwork as verified. Do not repeat broad visual research in every phase. Read actual production code and backend contracts to adapt the shared direction.

## Active design direction

- Near-black canvas; deliberate neutral foreground elevation, visible edges and directional highlights. Gradients add depth to a focal decision surface, primary action or selected item; dense tables and P&L fields remain calm and readable. Violet denotes brand/selection; green/red denote signed financial results and amber denotes attention.
- Manrope throughout including numbers, timestamps, IDs and code fields, self-hosted from the root package. No mono family, dependency or font import. Tabular numerals preserve numeric alignment without changing the font. Weights 400/500/600 may express hierarchy; no arbitrary rule limiting 600 to two selectors.
- Readable body/table values, distinct section/page headings and prominent lead readouts follow the candidate scale in the consolidated report. Verify actual rendered size, including graph transforms; no legacy 9–11px microfont parity.
- The consolidated report is the sole candidate recipe source for precise surface colors, gradient stops, typography, spacing and proportions; this contract does not define a competing numeric palette.
- The report records the original proposal; its linked implementation receipt records the executed demo proof, subsequent user lighting correction, exact selected recipes and verification limits. Production adoption and final visual review remain pending. Production consumes that result and verifies its own shell/states; it does not recreate the hardcoded family or a second Exposure fixture. No user approval/checker pass or mandatory extra permission checkpoint is implied.
- Keep the implementation small: CSS variables for opaque bases, semantic signals and a few named surface roles (neutral, feature, selected, action). No theme engine, new chart dependency, animated gradients, expensive blur/filter stack or speculative product feature.
- One dominant decision and visual per view. Consolidate duplicate headings, repeated aggregate readouts, redundant breadcrumbs and tutorial paragraphs. Preserve financial columns, data scope and working controls. Technical evidence belongs in accessible disclosures/inspectors. Keep snapshot, simulation, unsupported/partial coverage and consequential exclusions truthful and visible where needed.

## Phase integration — one research pass

| Phase | Visual ownership and acceptance |
|---|---|
| AXF-01 | Root tokens/styles, primitives, shell, readable honest loading/empty/error/stale states. Consume the demo Exposure visual proof and shared report; independently verify real production shell/states. Do not recreate the demo family or add a second Exposure fixture. Phase 1 views remain honest state panels until actual capabilities connect. |
| AXF-02 | Catalog toolbar/group hierarchy, conditional repeated event labels, readable statuses and contract inspector; concise identity/predicate/rule first, provenance IDs/rationale in disclosures. Backend contracts own interpretation and exclusions. |
| AXF-03 | Wallet/address onboarding, sync/workspace/private-session states within the shared shell. Show connected/viewed versus authenticated ownership honestly; compact feedback, real retry/status and clear labeled forms. No decorative live claims. |
| AXF-04 | Portfolio, Exposure and Scenarios: one decision summary, payoff landscape dominant, selected outcome rail, readable table values and nonduplicated metrics. Preserve all state/basis/currency distinctions and backend-provided analytics. |
| AXF-05 | Relationship graph with readable foreground nodes and selected evidence; adjust layout/camera rather than shrinking every label to fit the whole universe. Fit remains overview and pan/maximize/evidence preserve context. Simulation uses selective candidate emphasis and clear real before/after comparison; no fabricated history/probabilities. |
| AXF-06 | Verify all integrated views and key flow at 1440×900 and 1920×1080; contrast on actual gradient composites, legibility, graph interaction, keyboard/zoom, overflow and video-size preview. Delivery acceptance remains contingent on real backend integration. |

For detailed screen consolidations, graph geometry dependencies and staged rollout, use the code audit/report instead of rediscovering them. Extend the direction for production-only wallet states using the actual API, not the demo's hardcoded family.

## Preserved product and API requirements

Production lives in root `src/`, with independent root dependencies/tooling and `/app/` routes. Demo remains its independent `/demo/` package and is explicitly authorized for redesign. Production never imports, aliases or copies demo source/styles/config/assets; a shared visual contract does not create a shared-code dependency. Production can build without installing/building demo.

Wallet connection/address entry, synchronization, saved workspace, catalog/evidence, portfolio, exposure, scenarios, relationships and hypothetical trades use backend capabilities. Backend OpenAPI wins over examples. No browser-owned financial engine, silent demo fallback, fabricated prices/rows or unsupported capability implied by visuals. Decimal amounts, quantities and identifiers remain exact strings through request/response adapters; display formatting never feeds rounded calculations. Scope identity includes snapshot, basis/version and currency; incompatible bases remain separate.

No execution controls or spend approvals. The removed price ribbon stays omitted even if future snapshots exist; adding one requires a new product request. Snapshot timestamps, Simulation labels and unresolved holdings remain clear without persistent tutorial/disclaimer banners. No global disclaimer footer; compact footer may read `Rook Workstation` and `Polymarket` where truthful.

Loading reserves geometry. Empty means a successful complete zero-item response. First-load errors have retry; refresh errors retain data with an as-of warning. Unavailable values show an em dash with a reason, never zero. State/error mappings, retry/cancellation, version handling and request references remain specified by the Phase 1 UI/API contracts. Missing API configuration is a real actionable state, not a removable disclaimer.

## Verification contract

Normal text >=4.5:1 on the actual background, large text/necessary control boundaries >=3:1; verify brightest/darkest gradient areas and interaction states. Preserve visible keyboard focus, semantic headings/forms/status, dialog Escape/focus return, non-color status meaning, native browser zoom and reduced motion. Keep gradients static within a single transformable light layer. Pointer-driven light movement is capped at 10px horizontally / 6px vertically, settles in 300ms, and is disabled for reduced motion or coarse pointers. Tab hover and keyboard focus may reveal a restrained local glow; no autonomous ambient animation.

At 1440×900 and 1920×1080 verify seven integrated screens plus inspector, no page-level horizontal overflow, deliberate table scrolling, complete contract-name access and readable selected graph evidence. At narrower widths preserve reachable navigation, wrap headers and stack/fold secondary panels; do not restore the demo's minimum page width. View the Exposure → targeted simulation flow at full resolution and 50% preview for launch-video legibility. A sampled ordered P&L chart is not probability or price history; independently sorted before/after curves compare ranks, while a selected-state comparison compares the same scenario.

Run build/typecheck and meaningful existing money/identity/request-ordering/state tests, plus targeted browser checks for changed flows. Do not add brittle tests for exact token counts, exact CSS source values, font-weight selector counts or screenshot infrastructure merely to reproduce a prior implementation. Capture visual evidence; record limitations and actual results. No checker sign-off or phase completion is implied by this planning revision.


## Bounded workspace and inspector scrolling

Added by user request, 2026-10-07: at desktop target sizes the shell fits the viewport with no outer-document vertical or horizontal scrollbar. Longer screens scroll within the workspace; preserve keyboard/trackpad access and visible focus. Exposure's landscape and selected-outcome rail share a bounded analytical row. The whole selected-outcome panel scrolls independently of the heatmap and workspace: title, readout and facts scroll away so contributions can use the full panel height. Keep the two actions sticky at the bottom. The contribution list has no nested scroll. Hide visible scrollbar chrome throughout the demo while retaining native wheel, touch and keyboard scrolling, named scroll regions and visible focus. Content cannot stretch the heatmap or create a blank region below it. At narrow widths/zoom, stack content and permit workspace scrolling rather than clipping it. Verify the final position opens its inspector and the hedge action navigates to the correct outcome. Reuse the demo proof and receipt; production implements this independently.


## Active lighting direction after visual correction

The user rejected repeated vertical header gradients and the subsequent single-corner glow. Use several distinct, off-center violet light pools with dark intervals and long falloff across adjoining panels and gutters. Soft diagonal neutral-gray linear gradients supply angled sunlight/reflections; these are permitted and distinct from the rejected bevelled header strips. Smoked translucent glass surfaces, restrained 12px backdrop blur, fine neutral edges and transparent headers reveal the shared light field. Keep financial data wells opaque and text crisp. Position the lights around actual instruments rather than empty page space; use the small interaction-driven light shift specified above and avoid neon outlines, autonomous motion and a uniform purple wash. See [the implementation receipt](reports/Rook%20dark%20terminal%20implementation.md) for actual recipes, screenshots and checks. This correction is required input to all six UI phases.


## Relationship workspace allocation

The relationship map fills the left of the workspace, with contract families stacked down it. The right column splits into the evidence inspector above and Hedge failure watch below, each with its own scroll. Exact group offsets sit as chips at the top of the watch. The universe navigator (search, scope, group by) is a popover on the map's bottom bar, beside the relation-type chips that act as both legend and filter. Preserve pair filtering against focused contracts, pair/group selection and evidence linkage, graph resize/pan/zoom and keyboard access.
