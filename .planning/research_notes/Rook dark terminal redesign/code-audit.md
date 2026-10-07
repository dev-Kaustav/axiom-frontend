# Rook demo dark terminal code audit and redesign plan

## What in the current implementation prevents a polished dark product?

### Takeaway
The problem is separation and information hierarchy, not simply low luminance. The user explicitly supersedes all old tokens and design restrictions; the proposal below is a fresh visual system, not a token-preservation exercise. Keep the page near black; give foreground analytical surfaces a deliberate tonal edge, a directional highlight, and selective violet depth. Consolidate repeated readings and labels so the visual emphasis belongs to the payoff landscape, selected outcome, relationships, and before/after decision.

### Cited Findings

All source links below are repository-relative to `axiom-frontend/`. This is a source audit, not a browser verification. No application code was changed.

| File / component | Confirmed responsibility and relevant limitation |
|---|---|
| [demo/src/App.tsx](../../../demo/src/App.tsx) | Seven hash routes; brand, 68px top bar, workspace title, book metadata, footer, shared inspector. Ticker is already absent. Exposure → scenario and exposure → targeted trade flows live here. |
| [demo/src/tokens.css](../../../demo/src/tokens.css) | Five near-achromatic surfaces (#0c0c0f app, #101013 chrome, #141418 panel, #1c1c22 raised, #27272c overlay). Header comment explicitly forbids violet surfaces/borders. That restriction conflicts with the newly requested direction. Manrope is the sole font. |
| [demo/src/styles.css](../../../demo/src/styles.css) | App min-width 1200px; 28px workspace margins; panel headers transparent; many nested separators and all-purpose flat panel faces. Later overrides re-declare trade-preview, preview-metrics, primary-button and exposure styles, making a token-only edit insufficient. |
| [demo/src/components/primitives.tsx](../../../demo/src/components/primitives.tsx) | Panel / Badge / KeyValue / Modal; accessible resizable rails; native dialog focus return. Panel has no appearance variant. The grip is already hidden via CSS. |
| [demo/src/components/ExposureView.tsx](../../../demo/src/components/ExposureView.tsx) | Hero diagnosis, five-metric strip, actual 9×9 selected slice heatmap, outcome rail, downside list, economic drivers, stress monitor. Worst case repeats in hero, metric strip, downside ranking and stress monitor. |
| [demo/src/components/PortfolioView.tsx](../../../demo/src/components/PortfolioView.tsx) | Five metrics plus navigator title plus grouping breadcrumb; grouped positions/lots and linked group inspector. Current grouping appears in metrics, toolbar, breadcrumb and inspector. Numeric table cells overridden down to 12px. |
| [demo/src/components/ScenarioExplorer.tsx](../../../demo/src/components/ScenarioExplorer.tsx) | Five metrics; two-level table headings; ten columns including a P&L bar; linked outcome rail; scope disclosure. Selected P&L appears in summary, table and rail. 29px rows and 12px headings create density even though main table body is 14px. |
| [demo/src/components/RelationshipsView.tsx](../../../demo/src/components/RelationshipsView.tsx) | Navigator 252px + evidence 360px + two 7px dividers by default. At 1440, 56px workspace padding leaves roughly 758px central graph before borders. Many evidence explanations are always visible. Exact/partial/conditional distinctions and uncomputable reasons are material semantics. |
| [demo/src/components/RelationshipGraph.tsx](../../../demo/src/components/RelationshipGraph.tsx) | 220px wide nodes, 70px layout pitch, 60px CSS node height; shelf packing, auto-frame, pan/zoom, cluster dragging, filters. Initial small casts use at least .85 zoom; explicit Fit can go to .3. All-universe rendering carries 122 nodes and can exceed 1000 edges. |
| [demo/src/components/TradeSimulator.tsx](../../../demo/src/components/TradeSimulator.tsx) | Optimizer intro, objective/budget controls, three suggestions, selected preview, impact lists, disclosures and custom ticket. Workspace “Trade ideas” + “Portfolio optimizer” + “Strengthen your downside” + “Suggested trades” + selected preview create stacked headings. Selected contract/cost are repeated between candidate and preview. |
| [demo/src/components/ContractsView.tsx](../../../demo/src/components/ContractsView.tsx) | Both ContractsView and DataView. Contracts repeats grouping in toolbar, breadcrumb, table first-column label and group rows; Event values repeat the event group when grouped by Event. Default groups are folded. Data is currently a two-column collection of explanatory lists. |
| [demo/src/components/ContractInspector.tsx](../../../demo/src/components/ContractInspector.tsx) | Drawer includes summary facts, predicate, rationale, interpretation process, reachable-world count, settlement rule, long IDs/hash/tokens, and developer explanation of identifier representation. Many details can move behind existing-pattern disclosures. |
| [demo/src/components/OutcomeChart.tsx](../../../demo/src/components/OutcomeChart.tsx) | Real sorted scenario P&L samples: 64 evenly sampled bars over ranked outcomes, not probability frequencies and not historical prices. Before/after sorts each series independently: compare ranked outcome envelopes, not one-to-one scenario transitions. SVG viewBox is 512×140 but CSS renders 70px high. |
| [demo/package.json](../../../demo/package.json) | React 19, plain CSS, Lucide, fontsource Manrope. Existing Vite/TypeScript build, Vitest, Playwright and Axe tooling; no chart library needed. |
| [.planning/UI-SPEC.md](../../UI-SPEC.md), [.planning/PROJECT.md](../../PROJECT.md), [AXF-01 UI-SPEC](../../phases/AXF-01-production-shell/01-UI-SPEC.md) | Production is root src/ and independent of demo. Older preserve-demo / mono / no redesign statements describe previous production scope; current explicit request authorizes this demo redesign. Do not silently apply the redesign to production. |

### Inferences

- Uniform brightening destroys the contrast relationship. The useful foreground contrast comes from preserving a dark canvas while assigning brighter edges, directional light and elevated faces to selected objects.
- The existing brighter secondary text is useful for reading but reduces differentiation when every label and sentence is equally prominent. Hierarchy should come primarily from grouping, spacing, weight and content reduction; do not make small text unreadably faint again.
- The 68px top bar + 84px workspace/title area + diagnosis + metrics make the heatmap compete for first-screen space. Improving individual cards without reducing this stack will still make the launch footage text-heavy.
- CSS font size is not graph font size on screen. 16px titles at .85 are 13.6px; 12px metadata becomes 10.2px. At Fit .3, even a larger font cannot be readable. Layout, scale and readable selected evidence must be treated together.
- Source-backed scope statuses, indicative simulation status and settlement evidence are product information, not disposable disclaimers. Remove implementation commentary and repetitive instruction copy; collapse technical rationale while preserving truthful meaning.

### Gaps

- No rendered screenshots or browser measurements were performed by this audit. Parent visual research supplies reference analysis; implementation must visually verify the actual first fold.
- Search CLI required by ui-ux-pro-max was run: `python3 /Users/kaustav/.agents/skills/ui-ux-pro-max/scripts/search.py 'dark financial trading analytics terminal selective violet gradients clean hierarchy high contrast' --design-system -p 'Rook Dark Terminal' -f markdown`. Its generated result mixed horizontal landing-page advice, a light navy palette and Fira Code. Those conflict with this task and are rejected. Only dark hierarchy, contrast and visible focus guidance is retained. [Skill source](/Users/kaustav/.agents/skills/ui-ux-pro-max/SKILL.md); [frontend-design source](/Users/kaustav/.codex/skills/frontend-design/SKILL.md).

## What exact visual architecture and screen changes should be implemented?

### Takeaway
Use a fresh “black canvas, lit instruments” direction; old token values, near-achromatic rules and accent restrictions are expressly superseded. One prominent gradient surface per decision screen, neutral data surfaces underneath, and a small violet selection treatment across navigation and selected objects. Preserve the existing product and all calculations.

### Cited Findings

The proposed work targets the existing screens and interaction contracts in [App.tsx](../../../demo/src/App.tsx), [primitives.tsx](../../../demo/src/components/primitives.tsx) and [demo.spec.ts](../../../demo/tests/demo.spec.ts). The existing styles already implement semantic positive/negative values, selection, reduced motion and keyboard focus; preserve those behaviors. [Styles](../../../demo/src/styles.css)

### Inferences

#### Minimal token and gradient contract

Candidate values are implementation starting points, not pre-verified contrast results:

| Role | Proposed contract |
|---|---|
| Canvas / chrome | Keep near black: #09090d page; #101014 chrome. No full-page purple wash. |
| Neutral panel | #141419 base; panel edge #303039 with subtle top inset highlight. Main neutral panel can use `linear-gradient(180deg, #19191f 0%, #141419 100%)` so its light is directional, not uniformly brighter. |
| Recessed data | #0e0e13 for chart plot, input wells, expanded lot rows. Raised control #24242d. |
| Hero depth | `radial-gradient(ellipse at 86% 0%, rgba(124,92,245,.22) 0%, rgba(124,92,245,0) 62%), linear-gradient(130deg, #1b1729 0%, #15151c 48%, #111116 100%)`. Keep a dark opaque base and test labels over brightest composite. |
| Selected card / node | `linear-gradient(125deg, rgba(124,92,245,.18), rgba(124,92,245,.04) 65%), #1b1a24`; selected border rgba(151,125,247,.65), one subtle inset top light. No neon halo around every item. |
| Primary action | Dark violet gradient, e.g. #7052ef → #6044d8, with white text. Hover increases highlight, not size. Verify the brightest stop carries 4.5:1 text. |
| Text | Retain near-white #f4f4f6 for key numbers/names; secondary #d2d2dd; muted #aeb0bf. Fine-print target >=4.5:1 on its actual composite background. |
| Signal | Existing red/green for signed P&L and heatmap. Violet denotes selected/brand analytical focus; never replace gain/loss with decorative violet. |
| Geometry | Propose 10px panel radius; controls 6px; badge 4px. 16/20px card spacing and 12/16px inner gaps. Use whitespace instead of another frame inside every frame. |
| Type | Manrope everywhere including code/IDs. Body/table values 14px minimum, supporting labels 13px, table/graph utility labels 12px only when truly secondary, screen title 26px, lead value 32–36px, subhead 16–18px. Tabular numerals remain. No mono imports. |

Add only about four named visual tokens (`--surface-panel`, `--surface-feature`, `--surface-selected`, `--surface-action`) alongside existing semantic colors. Define opaque base colors for actual data wells and SVG calculations; existing `--bg-*` names may remain for low-risk wiring, but their old values carry no authority. Allow Panel an optional `tone="feature"` only if multiple panels need it; otherwise explicit existing feature classes are simpler. Replace the old accent prohibition comment with “violet surface depth marks decision emphasis/selection; neutral surfaces carry bulk data.” Do not add a theme engine, theming dependency, chart library or variant framework.

Use gradients in static CSS or SVG definitions; no background blur filters, animated gradients, noise overlays or mouse-tracking spotlights. The graph needs bounded rendering cost more than atmospheric effects. Edit existing CSS blocks and remove only directly superseded duplicate declarations; do not append another override layer.

#### Shared shell

Keep navigation and all seven routes. Tighten workspace header to roughly 64px, keep one clear page title and the portfolio/as-of context. Put faint directional light on the top bar and active tab. Keep snapshot date readable and truthful, and keep the removed contract-price ribbon removed. Do not add a fake live indicator, wallet action, order-book panel or execution button. Retain Rook branding.

#### Exposure — launch lead screen

- Combine diagnosis and compact overview into one feature surface: vulnerability path at left, real ordered P&L chart in the middle, worst P&L + hedge action at right. Keep the worst-case quick-select interaction in a concise action near its value.
- Reduce following overview to the nonduplicated capital, best outcome and scenario breadth. Combine profitable/loss-making counts into one labeled breakdown while retaining both counts and the scenario denominator. Do not show worst P&L a second time as a large metric.
- Make heatmap the dominant lower visual (roughly 70% / 30% split, minimum outcome rail 320–350px). Keep 81 slice cells, controls and true P&L mapping. Consolidate three instruction lines into one compact unit/legend row. Do not remove slice controls or distort heatmap colors with a violet wash.
- Selected outcome gets a raised/selected header with clear P&L. Facts below remain neutral; contributions use real relative bars and full accessible names.
- Keep ranked downside scenarios and economic drivers below; replace redundant standalone stress monitor with a compact best/worst shortcut block in the relevant main panel or existing downside header. Retain best/worst selection handlers and coverage counts without four copies of the same figure.

#### Portfolio

- Summary: deployed capital, holdings/contracts count, selected-world P&L; move current group count into toolbar. Keep aggregate and filtered values correctly labeled.
- One toolbar owns search, grouping and expand/collapse. Replace the static repeated breadcrumb with a compact grouping label in the header; preserve hierarchy through indentation, chevrons and row background differences.
- Table body and financial values >=14px; groups slightly raised, holdings neutral, lots recessed. Keep side, quantity, entry, cost, payout and scenario P&L; do not silently delete financial columns for appearance.
- Linked inspector: scenario selector at top, focused group identity + selected P&L as the primary readout, then compact cost/payout and risk range. Collapse only repeated explanatory prose. Existing scenario semantics and group/lots behavior remain.

#### Scenarios

- Summary carries distinct outcomes, loss-making count, worst/best range; selected outcome belongs in the rail rather than repeated as a fifth large summary value.
- Keep the grouped scheduled/inter-meeting/rate/result headers because they explain five state dimensions; shorten repeated “Profit and loss” to “P&L” and “Terminal payout” to “Payout” where sufficient. Units appear once in the header.
- Use 36–40px row height, 14px values and a clear selected-row edge + tint, with P&L numeric and bar beside it. Avoid an opaque gradient spanning colored result cells.
- Outcome rail headline is selected path and P&L, followed by payout/cost and contributions. Secondary path facts may be collapsed under “Rate path details.” Keep scope disclosure accessible, collapsed by default as now.

#### Relationships

- Graph canvas stays darkest, cluster faces slightly lifted, neutral nodes visibly above cluster faces. Selected nodes use violet depth; relation types retain their current meaning/line conventions. Nonfocused nodes should remain legible rather than blanket opacity fading small text.
- At 1440, reduce default rail to ~220px and evidence to ~320px, granting ~830px canvas. At 1920 use ~240px / ~350px, granting ~1260px canvas. Retain both ResizeHandles and current bounds. Do not force 122 readable nodes into one overview.
- Default held view should start around 100% with a useful subset centered when full packing cannot fit at readable size. Keep visible scope count, group names and existing Fit/zoom/maximize controls for navigation context. Fit remains an overview action; evidence inspector supplies full selected name, price/holdings, relation and rule evidence at untransformed body size. Existing maximized view is the detail escape hatch. This is camera/layout refinement, not a new graph-navigation system.
- Prefer a compact cluster arrangement and minimum ~14px rendered held-node titles / ~12px secondary content at the normal initial state. If measured fit scale misses that, show fewer groups in the viewport and allow existing pan rather than shrinking. Autozoom floor alone is insufficient: verify pan reachability and context.
- Left rail: compact search/scope/grouping + relation filters, then ranked pair list; remove repeated instructional paragraphs. Right rail: selected verdict, actual residual range/coverage, failures, then expandable settlement evidence/rationale. Retain exclusions and exact/partial/conditional/uncomputable distinctions.
- Geometry dependency: node widths/heights appear both in TS constants and CSS; any node sizing change requires synchronized pitch, edge connection coordinates and cluster heights. Keep drag simplification and dense-edge hit-area rules intact.

#### Trade

- Remove repeated optimizer marketing intro; integrate objective and budget controls under the workspace title. Keep the concise Simulation label because this action does not execute trades.
- Three suggestions remain. Selected candidate receives the strongest violet gradient and clear border. Main readable elements are contract/side, capital and the actual improvement; secondary sizing/price remain available.
- Make selected before/after preview the main second surface, with a larger real ordered scenario P&L chart (~140–180px visual height) beside three metrics. Label it “Ranked scenario P&L”; preserve worst/best ends and zero baseline. Before line stays neutral and after bars keep green/red.
- Preview heading should not repeat full cost/quantity already visible in the selected card; show a compact “Previewing [contract]” with inspect action, retaining custom/baseline identity. Keep targeted outcome comparison when entered from Exposure.
- Keep impact lists and the custom form; show at most the existing top three changes per side. Collapse detailed ranking methodology and position math as already supported. Remove the valid-input tutorial hint; retain clear invalid-input requirements, disabled submit and integer-cent validation. No “Buy” wording.

#### Contracts

- One integrated toolbar/header for count, search, scope and grouping. Keep folded groups as default.
- Event-grouped table should not repeat the same event label on every contract row; conditionally omit the Event column only for Event grouping, retaining it for other groupings. Predicate/status/source remain available and long expressions wrap in the inspector rather than dominating each row.
- Replace long repeated “every contract interpreted” phrases with compact interpreted/withheld counts on group rows. Keep explicit withheld status and group coverage; status cannot become “no relation.”

#### Data & sources and shared inspector

- Data gets a compact provenance summary: snapshot date/source and real events/contracts/state counts. Use neutral grouped fact cards below, with fact statement/value first; source links and derivation remain clear.
- Turn long assumption, excluded-event and unreachable-contract lists into expandable sections. Keep already-settled and outside-alphabet causes distinct; do not convert these into a fake compliance banner or hide a truth-changing limitation.
- Drawer begins with contract identity, venue/status, selected predicate and published rule. Move long IDs/hash/tokens to collapsed Provenance. Remove implementation copy about decimal strings, template arithmetic and hash internals from the default product view. Keep raw identifiers/rules and genuine unsupported reason available; shortening explanation does not mean fabricating interpretation.

### Gaps

- Exact card widths and first-fold height must be adjusted against actual rendered font metrics; values above are targets, not assertions of measured layout.
- If removing duplicates changes E2E selectors/text assertions, update only affected expectations to target behavior and preserved semantics. Do not retain redundant content solely for brittle selectors.

## How should implementation be staged and verified?

### Takeaway
Do one representative screen first, then reuse its visual grammar across all seven screens. Acceptance must include real desktop captures and interactions, because a build cannot validate foreground/background separation or readable graph text.

### Cited Findings

Existing verification scripts are `npm run build`, `npm test`, and `npm run test:e2e` in [demo/package.json](../../../demo/package.json). [Existing browser tests](../../../demo/tests/demo.spec.ts) cover route navigation, data semantics, filters, graph pan/drag/zoom, multi-selection, pane resizing, accessibility, dialog focus, targeted trade flows and integer-cent validation. This audit did not run them.

### Inferences

1. **Foundation and Exposure proof:** change only demo tokens, shared styles/primitives and Exposure hierarchy. Verify at 1440×900 and 1920×1080 before propagating. The first frame should show clear page purpose, meaningful headline, primary P&L and the principal heatmap; no solid-grey page wash. Preserve full viewport usability even if secondary analytics scroll below.
2. **Analytical screens:** apply tables/rails to Portfolio, Scenarios and Contracts, and graph camera/geometry only where required. Verify selected outcome linkage, every financial column, keyboard divider movement, full-name inspector access and graph controls.
3. **Decision/evidence screens:** apply Trade comparison and Data/inspector progressive disclosure. Verify objective/budget/suggestion/custom/baseline transitions, targeted outcome, invalid inputs, source links and unsupported statuses.
4. **Finishing pass:** normalize only touched CSS duplication, check the shell/footer, compare the seven screen captures side by side, run build + domain tests + relevant browser suites once changes settle. Avoid unrelated domain or production edits.

Acceptance checks:

- At both 1440×900 and 1920×1080, neutral page ground stays near-black and neutral panels, raised controls and selected/feature surfaces are visually distinct. Violet depth is selective, never a uniform wash or substitute for profit/loss signal.
- Text contrast >=4.5:1 for normal text on actual composite gradient locations; >=3:1 for large text and necessary control boundaries. Audit text at both gradient extremes, selected/hover/disabled states, heatmap cells and graph selections. An automated flat-color check alone is insufficient for gradients.
- No global mono font; Manrope and tabular numerals survive every screen, code field and dialog. Data values >=14px where displayed outside zoomed overview; normal graph selection has readable full evidence at 14px and useful visible nodes without tiny-type overfitting.
- No page-level horizontal overflow at supported widths. Tables may scroll deliberately inside their panels. Long contract names wrap or remain available via inspector; resizing must not break the main grid.
- No duplicated dominant worst-case/selected figures or unnecessary stacked screen headings. No contract-price ribbon. No demo/developer disclaimer blocks in main product flows; meaningful simulation, snapshot, coverage and exclusion labels remain truthful.
- All seven hash routes and Exposure → Scenario / Exposure → Trade flows preserve selection. All displayed metrics, heatmap values, chart samples and relation counts come from existing domain data; no fake history, live prices, probabilities or order-book content.
- Chart captions explicitly say ranked/ordered scenario P&L; sorted before/after curves are not represented as a probability or chronological path. Selected-outcome before/after remains the source for same-scenario comparisons.
- Graph pan, zoom, Fit, maximize/restore, cluster drag/fold, snap, auto-arrange, relation toggle, multi-select and both width controls work at both resolutions. Dense 122-node view remains an overview with recoverable details; styling must not add expensive filters to each node/edge.
- Keyboard focus and dialog Escape/focus return remain intact. Important status is not conveyed by color alone. Reduced-motion behavior remains; use static gradients and restrained existing transitions.
- Capture each of seven screens plus an inspector at each viewport, then inspect the Exposure → targeted Trade sequence in full screen and at 50% preview size to approximate video viewing. This is a presentation legibility check, not a new screenshot-baseline infrastructure project.
- Production root `src/`, backend, data fixtures and domain semantics remain untouched. Existing production UI specifications are older reference documents; update their relationship to the newly approved demo only if separately in scope, never silently apply the theme there.

### Gaps

No acceptance result is claimed yet. The assignment is plan only, and no browser/runtime verification or source edits were performed.
