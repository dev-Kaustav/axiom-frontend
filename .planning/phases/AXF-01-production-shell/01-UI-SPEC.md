---
phase: "01"
slug: "production-shell"
status: draft
revision_status: direction_confirmed_visual_proof_pending
previous_reviewed_at: "2026-09-30"
revised_at: "2026-10-07"
shadcn_initialized: false
preset: none
created: "2026-09-30"
---

# Phase 01 — UI Design Contract (AXF-01: Production shell and API boundary)

Revised 2026-10-07: visual direction supersedes the prior approved 2026-09-30 demo-parity specification. **Detailed visual values are proposed pending representative Exposure proof; no new checker has run.** Routing, data-state, request/error and accessibility contracts below remain active. The old checker receipt applies only to the historical revision.

## Design System

Read the active project [UI-SPEC](../../UI-SPEC.md) and [shared report](../../reports/Rook%20dark%20terminal%20redesign.md); reuse their research. React/TypeScript, plain CSS custom properties, Lucide and root-owned fontsource Manrope remain sufficient. No mono font package/import, new visual framework or chart dependency is required. Production implementation is independent of demo source and data; demo redesign is separately authorized.

## Design Tokens (`src/styles/tokens.css`)

Define a small role-based palette and surface recipes from the project UI-SPEC. Old 63-entry maps, exact demo values, forbidden-gradient rules and legacy aliases are superseded. Keep semantic gain/loss/attention, opaque data wells and focus treatment distinct from decorative feature/selection gradients. Candidate precise values are proposed in the consolidated report; consume the demo Exposure proof and its chosen recipes/contrast evidence, without recreating the family or a second fixture. Do not freeze the old CSS as an executable acceptance fixture.

## Spacing Scale

Use the candidate spacing/geometry roles in the consolidated report, refined through the demo Exposure proof. Exact values are not inherited parity exceptions; production verifies its own shell/states using the resulting contract.

## Typography

Manrope 400/500/600 everywhere, including numeric, timestamp, code and ID fields. Tabular numerals and right-aligned financial columns remain. Precise candidate type roles come from the consolidated report and demo Exposure proof. No 9–11px parity rules. Graph legibility is measured after transforms.

## Color

Near-black page, visibly separated neutral foreground objects, directional edge light and selective feature/selection gradients. Violet expresses Rook identity and selection; green/red retain financial meaning. No uniform page lightening or indiscriminate violet cards. Actual composite text contrast must be measured; this revision claims no measured ratios yet.

## Shell Layout Contract

Top to bottom: **App bar → Workspace (header + route outlet) → Footer.** The body is `margin: 0`, and `.app` is a flex column with `min-height: 100vh`. The workspace is `flex: 1`.

### App bar (`<header>`)
- Layout: compact readable chrome with a directional highlight and clear active navigation; exact height/spacing follows the project proof, not legacy parity.
- Brand (left): the text wordmark `rook` plus a period in `--accent-soft`. Then the small label `WORKSTATION`, separated by a 1px `--line-strong` left border. The brand small label is hidden at ≤1350px. The brand is plain text; no image asset or `.logo-mark` element.
- Nav (`<nav aria-label="Views">`): height 100%, with the seven tabs stretched. Each tab is a **TanStack Router `<Link>` (an anchor), not a `<button>`** as in the demo. Each tab has a lucide icon (14px, `aria-hidden`) and a label. The active tab has `aria-current="page"`. Hover background is `--wash-hover`.
- Clock (right): real UTC `HH:MM:SS`, refreshed every second, in Manrope with tabular numerals and readable utility text.
- **No ticker or tape row.** The removed price ribbon stays omitted.

### Routes (TanStack Router, `base: /app/`)

| Nav label | Icon (lucide) | Path | h1 title | h1 subtitle |
|-----------|---------------|------|----------|-------------|
| Exposure | `Activity` | `/app/exposure` | Exposure | What am I exposed to? |
| Portfolio | `Layers3` | `/app/portfolio` | Portfolio | What has been loaded |
| Scenarios | `FlaskConical` | `/app/scenarios` | Scenarios | What happens under this outcome? |
| Relationships | `GitBranch` | `/app/relationships` | Relationships | What offsets what, and where does the hedge fail? |
| Trade | `ArrowLeftRight` | `/app/trade` | Trade ideas | Which trades improve this portfolio? |
| Contracts | `BookOpen` | `/app/contracts` | Contracts | Every contract, and what Rook made of it |
| Data | `Database` | `/app/data` | Data & provenance | Where the numbers come from |

- The nav order is exactly the table order, as in the demo.
- `/app` and `/app/` redirect (replace) to `/app/exposure`, which is the demo's default view.
- An unknown `/app/*` path renders the Not-found view inside the shell with no active tab.
- On route change: `document.title = "{Nav label} · Rook Workstation"` and `window.scrollTo(0, 0)`. Focus stays on the activated link, as in the demo.
- Deep links such as `/app/contracts` load directly after a hard refresh. Assets resolve under `/app/`.
- Search params (portfolio, family, instrument, scenario) are validated by the router schema. Invalid values are dropped with a `replace` navigation, and the view renders its default. No error page is shown for them. Private credentials and wallet challenges never appear in URLs.
- The static `<title>` in `index.html` is `Rook — Contract intelligence`. The favicon references the root site's `/favicon.png`, which is a landing asset and not a demo asset.

### Workspace header
- Left: concise scope and one h1. Route subtitles below are descriptor/help copy, not mandatory duplicate visible headings; omit them from the default header when redundant.
- **Kicker (generic):** `POLYMARKET`. In AXF-02 and later it becomes `POLYMARKET / {family label from backend metadata}`, and further scope segments come only from backend metadata. The demo's fixed `MACRO / US RATES / 2026` is **not** carried.
- h1 uses the route title; optional subtitle/help must not compete with the title or repeat the main panel heading.
- Right: readable book/account metadata; text/controls follow the shared type roles, with no microfont exception.
  - Phase 1 (no wallet yet): line 1 `No portfolio`; line 2 is a faint dot plus `NOT CONNECTED`.
  - This region is reserved for AXF-03's wallet controls (Connect wallet, Enter address, account, Refresh, last sync, Disconnect). Phase 1 renders **no** non-functional wallet buttons.

### Route outlet
Each route renders one full-width `Panel` containing that view's current state (see State Contract). In Phase 1 no view fabricates rows, zeros, summary-strip readouts, or demo data.

### Footer
Compact product context: `Rook Workstation` and `Polymarket`. No global read-only/probabilities/execution disclaimer banner. Hypothetical simulation and consequential scope limits are labeled at their relevant controls/results. Footer wraps without clipping.

### Width behaviour
- Desktop composition is independently implemented from the revised shared visual contract, verified at 1440×900 and 1920×1080; no identical-demo-parity requirement.
- The demo's hard `.app { min-width: 1200px }` is **not** carried.
- When space tightens, hide optional brand/help copy before reducing readable text; keep all navigation reachable.
- Below 1200px:
  - The nav scrolls horizontally (`overflow-x: auto`). Every tab stays reachable by keyboard and pointer, with no hidden-scrollbar trick on focusable content.
  - The workspace header wraps: the book area moves below the title, and the header height becomes auto with 12px row-gap.
  - Two-column pane layouts (later phases) stack. The side panel goes below the main panel, and the resize handle is hidden.
- Browser zoom must work at every width.

---

## Primitive Contract (`src/components/primitives.tsx`, Phase 1 builds)

| Primitive | Visual contract | Interaction and accessibility |
|-----------|-----------------|------------------------------|
| `Panel({title, count?, actions?, children})` | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | Title is an `h2`; the section gets `aria-labelledby` pointing at it. |
| `PanelFootnote` | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | — |
| `Badge({tone})` | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | Text content is always meaningful on its own. |
| `KeyValue({label})` | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | — |
| `ResizeHandle({value,min,max,onChange,label,invert})` | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | `role="separator"`, `aria-orientation="vertical"`, `aria-valuenow/min/max`, `tabIndex=0`. Pointer drag uses pointer capture. ArrowLeft and ArrowRight step ±12px (±48px with Shift). `invert` is for handles on the left of the panel they size. Default widths: side panel 320px (Portfolio) or 330px (others), range 260–680; rail 252 (200–520); evidence 360 (280–640). Width state is per view and resets on remount. |
| `Modal({title,onClose})` (inspector drawer; used from AXF-02) | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | `showModal()`. Esc and backdrop click close it. Body scroll is locked while open. **Focus returns to the opener** on close. Close button has `aria-label="Close dialog"`. The dialog has `aria-label` set to the title. |
| `PrimaryButton` | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | `disabled` gives 0.4 opacity and the default cursor. While busy, set `aria-busy="true"` and `disabled`, and change the label to `Reloading…`. |
| `TextButton` / `IconButton` | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | Icon buttons require an `aria-label`. |
| Global form controls | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | Visible `<label>` required (used from AXF-03). |
| Table base (global) | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | Row headers use `th scope="row"`. |
| Value helpers | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | Unavailable numeric values render `—` with the reason in visible adjacent text or `title` plus `aria-label`. They never render as `0`. |
| `StatePanel({kind, noun, error?, onRetry?})` (new) | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | See State Contract |
| `StaleBanner({asOf, onRetry})` (new) | Shared role-based surfaces/type from project UI-SPEC; exact dimensions are proposed pending proof. | See State Contract |

---


## State Contract (Phase 1)

`StatePanel` renders within Panel, reserves stable geometry (420px minimum remains a starting value), and uses a readable section heading, 14px body and 13px wrapping reference line, all Manrope. Keep badge, heading, body, retry and reference hierarchy; refine spacing without changing state semantics.

| Kind | Trigger | Badge | Semantics |
|------|---------|-------|-----------|
| `loading` | Query pending with no cached data | none | Panel `aria-busy="true"`; heading is `role="status"`. Text only, with no spinner and no placeholder rows. |
| `empty` | Complete successful response with zero items | none | Plain text. No numeric readouts. |
| `unavailable` | The view's backend capability does not exist yet on this server: no endpoint configured, or the typed error is `not_implemented` (404/501) | `NOT AVAILABLE` (attention) | Plain text, no CTA. |
| `error` | First load failed (network, 5xx, unknown) | `ERROR` (attention) | Heading `role="alert"`; a `Reload data` primary CTA re-runs the query. |
| `rate_limited` | 429 | `RATE LIMITED` (attention) | CTA disabled and labelled `Retry in {n}s` until the backend's `Retry-After` elapses. It then becomes `Reload data`. No automatic retry. |
| `stale_version` | Backend reports that the pinned version changed | `OUTDATED` (attention) | CTA `Reload data` refetches the current version. |
| Not found (route) | Unknown `/app/*` path | none | Link styled as a primary button: `Go to Exposure`. |

`StaleBanner`: shown when a **refresh** fails and prior data is retained. It sits at the top of the panel body, below the header. Styles: full width, padding `8px 16px`, background `--warn-fill`, 1px `--warn-line` bottom border, readable secondary text in the attention role. A `TextButton` on the right reads `Reload data`. The banner has `role="status"`. The previous data stays fully visible beneath it.

Phase 1 behaviour:
- **No silent fixture fallback.** Views never show local or demo data when a request fails, is missing, or is not configured.
- Every `/app/*` view renders the `unavailable` or `empty` state honestly until its data phase connects it.
- A missing `VITE_API_ORIGIN` at runtime is treated as the `unavailable` kind with the configuration-specific copy below. It is never treated as empty.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (Phase 1) | `Reload data`. It is the only primary action in the phase and is used by the error and outdated states. Busy label: `Reloading…`. |
| Not-found CTA | `Go to Exposure` |
| Loading (per view) | `Loading exposure…` / `Loading positions…` / `Loading scenarios…` / `Loading relationships…` / `Loading trade ideas…` / `Loading contracts…` / `Loading sources…` |
| Empty state heading and body: Exposure | `No exposure to show` / `Exposure appears here once a portfolio has synced.` |
| Empty: Portfolio (panel title `Position navigator`) | `No portfolio loaded` / `Positions appear here once a wallet portfolio has synced.` |
| Empty: Scenarios | `No scenarios to show` / `Scenarios appear here once a portfolio has synced.` |
| Empty: Relationships | `No relationships to show` / `Settlement relationships appear here once a portfolio has synced.` |
| Empty: Trade (panel title `Trade ideas`) | `Nothing to simulate yet` / `Hypothetical trades become available once a portfolio has synced.` |
| Empty: Contracts | `No contracts published yet` / `Published contracts appear here once the catalog is available.` |
| Empty: Data (panel title `Sources & assumptions`) | `No provenance to show` / `Sources and assumptions appear here once contracts are published.` |
| Unavailable (capability) | Heading `Not available on this server yet` / body `This view needs {noun} from the Rook API, which this server doesn't provide yet.` The `{noun}` values are: portfolio exposure, portfolio positions, scenario results, relationship data, simulation results, the contract catalog, provenance data. |
| Unavailable (API origin not configured) | `Rook API not configured` / `This build has no API address, so no data can load. Set VITE_API_ORIGIN and rebuild.` |
| Error state (first load) | `Couldn't load {noun}` / `The Rook API didn't respond. Check your connection, then reload.` Reference line, shown only if the backend returns a request ID: `Reference {request_id}`. |
| Error state (unexpected response) | `Couldn't load {noun}` / `The server returned an unexpected response ({status}). Reload, or try again later.` |
| Rate limited | `Too many requests` / `The server asked Rook to wait before trying again.` CTA `Retry in {n}s`, which becomes `Reload data`. |
| Outdated version | `This data has changed` / `A newer version is available on the server. Reload to see current results.` |
| Stale banner (refresh failed) | `Refresh failed — showing data from {D MMM YYYY, HH:MM} UTC.` with the action `Reload data` |
| Not found | `Page not found` / `That address doesn't match a Rook view.` |
| Book area (no account) | `No portfolio` / `NOT CONNECTED` |
| Kicker | `POLYMARKET` |
| Footer | `Rook Workstation` · `Polymarket` |
| Document title | `{Nav label} · Rook Workstation`. Static fallback: `Rook — Contract intelligence`. |
| Destructive confirmation | Not applicable. Phase 1 is read-only and has no destructive actions. Disconnect (AXF-03) is specified in that phase's UI-SPEC. |

Later-phase error kinds (validation, unresolved account, unsupported scope, expired session) are typed by the Phase 1 API client and render through `StatePanel` with this fallback copy until their own phases refine it:
- Unsupported scope: `This scope isn't supported` / `Choose another family from the catalog.`
- Expired session: `Your session has ended` / `Sign in again to see your saved workspace.`
- Unresolved account: `Polymarket account could not be resolved` / `Check the address and try again.`
- Validation: inline field error, `{Field} {problem}.`

Timestamps are formatted in UTC with Manrope tabular numerals, for example `30 Sep 2026, 14:05 UTC`. Venue IDs, request IDs and decimal strings are displayed verbatim.

---

## Do Not Carry Over From the Demo

1. **Blanket ctrl/meta-wheel `preventDefault`** (`App.tsx:47–51`). Production allows browser and trackpad zoom. Later canvas panes (AXF-05 graph) may intercept wheel events only inside their own viewport element.
2. **Fixed `MACRO / US RATES / 2026` kicker.** Replaced by `POLYMARKET` plus backend-metadata scope.
3. **Ticker tape** (`Ticker.tsx`, `.tape` 35px row) and its `SNAPSHOT` label. Omitted by the current product direction; do not reintroduce the ribbon automatically.
4. **`DEMO BOOK · N POSITIONS`**, the fictional portfolio name, the violet "live" status dot, and the `SNAPSHOT DATA · Fictional portfolio…` footer.
5. **Hash routing** (`#/exposure`). Replaced by TanStack Router paths under `/app/`. Nav tabs become links, not buttons.
6. **Google Analytics `gtag` snippet** in `demo/index.html`. It is not added to production: no analytics decision exists, and wallet addresses may appear in routes.
7. **`.app { min-width: 1200px }`.** Replaced by the width behaviour above.
8. **Dead token entries** (unused `--fs-*`, `--radius-*`, `--dur-*`, `--z-*`, `--line-focus`, glow and halo, the legacy aliases block) and hidden elements (`.logo-mark`, `.grip`).
9. **Family-specific styles and copy** (`.fed-baseline`, rate-path wording such as "No further rate moves").
10. **The demo `favicon.svg`** (a demo asset). Production uses the root `/favicon.png`.

---

## UI Considerations

Historical state-coverage probe run 2026-09-30 after the previous checker approval (visual dimensions/copy references are superseded by the active sections above) (ui-consideration-probe, 12 surfaces, 50 applicable). Resolved: 22 explicit, 6 backstop; 7 dismissed with reason; 15 unresolved (deferred to AXF-02/AXF-03). Empty/error copy lives in the Copywriting Contract; this section covers state coverage only.

| Element | Category | Status | Resolution / Reason |
|---------|----------|--------|---------------------|
| E1 App bar / nav | loading | — dismissed | Static chrome; nav and brand fetch nothing. The UTC clock is local time, not data. |
| E1 App bar / nav | error | — dismissed | No request is made by the app bar in Phase 1. |
| E1 App bar / nav | overflow | ✅ resolved (explicit) | Below 1200px the nav scrolls horizontally (`overflow-x: auto`); every tab stays reachable by keyboard and pointer. |
| E1 App bar / nav | long-text | ✅ resolved (explicit) | Tab labels are the fixed strings in the route table; the brand small label is hidden at ≤1350px. |
| E2 Routes | loading | 🧪 resolved (backstop) | Route change renders the shell immediately; the view's panel owns its loading state (no route-level blank screen). |
| E2 Routes | error | ✅ resolved (explicit) | Unknown `/app/*` renders Not-found inside the shell with no active tab; invalid search params are dropped by `replace` navigation and the view renders its default. |
| E2 Routes | overflow | — dismissed | Routes have no visual container of their own; nav overflow is covered by E1. |
| E2 Routes | long-text | ✅ resolved (explicit) | `document.title` is always `{Nav label} · Rook Workstation`; overlong or invalid params are discarded, never echoed. |
| E3 Workspace header | overflow | ✅ resolved (explicit) | Below 1200px the header wraps: book area moves below the title, height becomes auto with 12px row-gap. |
| E3 Workspace header | long-text | 🧪 resolved (backstop) | Kicker is the fixed `POLYMARKET` in Phase 1; verify at 1024px that a long subtitle wraps without overlapping the book area. |
| E4 Route outlet | empty | ✅ resolved (explicit) | A complete successful zero-item response renders `StatePanel kind=empty` with the per-view Empty copy; no zeros or numeric readouts. |
| E4 Route outlet | loading | ✅ resolved (explicit) | Pending with no cache renders `StatePanel kind=loading` (420px min-height, `aria-busy`, `Loading {noun}…`, no spinner or placeholder rows). |
| E4 Route outlet | error | ✅ resolved (explicit) | First-load failure renders `StatePanel kind=error` with `Reload data`; 429 → `rate_limited`, version change → `stale_version`, absent capability or missing `VITE_API_ORIGIN` → `unavailable`. Never a fixture fallback. |
| E4 Route outlet | populated | — dismissed | No view is connected to data in Phase 1; populated layouts arrive with AXF-02+. |
| E4 Route outlet | partial | ✅ resolved (explicit) | Refresh failure keeps prior data visible under a `StaleBanner` with its UTC timestamp. |
| E4 Route outlet | overflow | ✅ resolved (explicit) | Panel reserves 420px min-height; content scrolls inside `.table-scroll { overflow: auto }`. |
| E4 Route outlet | zero-one-many | ⚠ unresolved — planner must treat as assumption | Deferred to the data phases (AXF-02+) — planner must treat as assumption; no row data exists in Phase 1. |
| E5 Footer | overflow | 🧪 resolved (backstop) | Verify at 1024px that the compact footer context wraps rather than clipping. |
| E5 Footer | long-text | ✅ resolved (explicit) | Footer copy is the two fixed strings in this contract. |
| E6 Table base | empty | ✅ resolved (explicit) | Zero rows never render an empty table; the outlet shows `StatePanel kind=empty` instead. |
| E6 Table base | loading | ✅ resolved (explicit) | Tables are not rendered while loading; `StatePanel kind=loading` reserves the geometry. |
| E6 Table base | error | ✅ resolved (explicit) | Tables are not rendered on first-load error; `StatePanel kind=error` replaces them. |
| E6 Table base | populated | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-02 (first connected table) — planner must treat as assumption. |
| E6 Table base | partial | ✅ resolved (explicit) | An unavailable numeric cell renders `—` with the reason in visible adjacent text or `title` plus `aria-label`; never `0`. |
| E6 Table base | overflow | ✅ resolved (explicit) | `.table-scroll { overflow: auto }` with sticky `thead` (and sticky `tfoot`). |
| E6 Table base | zero-one-many | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-02 — planner must treat as assumption. |
| E7 ResizeHandle | loading | — dismissed | Pure client-side control; nothing is fetched. |
| E7 ResizeHandle | error | — dismissed | Out-of-range values are clamped to min/max; there is no failure path. |
| E7 ResizeHandle | long-text | — dismissed | The handle renders no text; its `label` is an accessible name only. |
| E8 Modal inspector | empty | ⚠ unresolved — planner must treat as assumption | Modal is first used in AXF-02 — planner must treat as assumption. |
| E8 Modal inspector | loading | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-02 — planner must treat as assumption. |
| E8 Modal inspector | error | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-02 — planner must treat as assumption. |
| E8 Modal inspector | populated | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-02 — planner must treat as assumption. |
| E8 Modal inspector | partial | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-02 — planner must treat as assumption. |
| E8 Modal inspector | overflow | ✅ resolved (explicit) | Width 580px capped at `calc(100vw - 80px)`; body is scrollable at full height. |
| E8 Modal inspector | zero-one-many | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-02 — planner must treat as assumption. |
| E9 PrimaryButton | loading | ✅ resolved (explicit) | While busy: `aria-busy="true"`, `disabled`, label `Reloading…`. |
| E9 PrimaryButton | error | ✅ resolved (explicit) | A failed reload returns the panel to its error StatePanel with the button re-enabled; 429 shows a disabled `Retry in {n}s` until `Retry-After` elapses. |
| E9 PrimaryButton | long-text | ✅ resolved (explicit) | Labels are fixed: `Reload data`, `Reloading…`, `Retry in {n}s`, `Go to Exposure`. |
| E10 StatePanel | overflow | ✅ resolved (explicit) | `max-width: 480px`, `min-height: 420px`, centred column; body text wraps. |
| E10 StatePanel | long-text | 🧪 resolved (backstop) | Reference line uses `overflow-wrap: anywhere`; verify with a 70+ character request ID that nothing overflows the panel. |
| E11 StaleBanner | loading | 🧪 resolved (backstop) | While a retry from the banner is in flight the banner stays and the retained data stays visible. |
| E11 StaleBanner | error | ✅ resolved (explicit) | A further failed refresh keeps the banner and the previous data; the timestamp remains that of the retained data. |
| E11 StaleBanner | long-text | 🧪 resolved (backstop) | Verify at 1024px that the banner message wraps and `Reload data` stays visible. |
| E12 Form controls | empty | ⚠ unresolved — planner must treat as assumption | Forms first appear in AXF-03 (wallet/address) — planner must treat as assumption. |
| E12 Form controls | loading | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-03 — planner must treat as assumption. |
| E12 Form controls | error | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-03 — planner must treat as assumption. |
| E12 Form controls | partial | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-03 — planner must treat as assumption. |
| E12 Form controls | overflow | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-03 — planner must treat as assumption. |
| E12 Form controls | long-text | ⚠ unresolved — planner must treat as assumption | Deferred to AXF-03 — planner must treat as assumption. |

Backstop truths (flat form for the plan-phase lift):

- { statement: "E2 Routes / loading: Route change renders the shell immediately; the view's panel owns its loading state (no route-level blank screen).", verification: backstop }
- { statement: "E3 Workspace header / long-text: Kicker is the fixed `POLYMARKET` in Phase 1; verify at 1024px that a long subtitle wraps without overlapping the book area.", verification: backstop }
- { statement: "E5 Footer / overflow: Verify at 1024px that the compact footer context wraps rather than clipping.", verification: backstop }
- { statement: "E10 StatePanel / long-text: Reference line uses `overflow-wrap: anywhere`; verify with a 70+ character request ID that nothing overflows the panel.", verification: backstop }
- { statement: "E11 StaleBanner / loading: While a retry from the banner is in flight the banner stays and the retained data stays visible.", verification: backstop }
- { statement: "E11 StaleBanner / long-text: Verify at 1024px that the banner message wraps and `Reload data` stays visible.", verification: backstop }

---

## Interaction and Accessibility Summary

- Keyboard: all tabs, CTAs, and resize handles are reachable in DOM order. The focus ring is 2px `--accent-soft` with a 2px offset. Modals return focus to their opener. Esc closes the modal.
- Status: loading uses `role="status"`; first-load error headings use `role="alert"`; the stale banner uses `role="status"`. Colour is never the sole carrier of meaning.
- Zoom: native browser zoom (keyboard and pinch) is never blocked.
- Motion: static gradients; restrained optional transitions respect reduced motion. No decorative animation requirement.
- Title and scroll: set on every route change.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none. shadcn is not used (`Tool: none`). | not applicable |
| third-party | none | not applicable |

Third-party npm dependencies introduced for UI in Phase 1: `lucide-react`, `@fontsource/manrope`. These are the same packages the demo uses, declared independently in root `package.json`.

---

## Pre-population Sources

| Source | Decisions used |
|--------|---------------|
| Revised project UI-SPEC, consolidated report and code audit | Active visual direction and proposed recipes; old demo tokens no longer authoritative |
| `.planning/UI-SPEC.md` (project-level) | Preserve list; loading, first-load and refresh-failure behaviour; zoom; narrow-width folding; no fake ticker; no MACRO label; em dash for unavailable values |
| `.planning/API-CONTRACT.md` | Typed error kinds mapped to states; no fixture fallback; retry and `Retry-After` handling |
| `01-01-PLAN.md` / PROJECT.md / AGENTS.md | `/app/` base, TanStack Router, no demo imports, generic labels, native zoom, no fake ticker |
| Historical researcher defaults (visual defaults superseded) | Default route `/app/exposure`; kicker `POLYMARKET`; footer copy; per-view empty and unavailable copy; `Reload data` CTA; StatePanel 420px reserved height |

---

## Historical checker receipt — superseded visual revision

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: FLAG (demo-derived accent variants; non-blocking)
- [x] Dimension 4 Typography: FLAG (demo-derived 9-size scale; non-blocking)
- [x] Dimension 5 Spacing: FLAG (demo-parity exception table; non-blocking)
- [x] Dimension 6 Registry Safety: PASS
- [x] Dimension 7 Inventory Provenance: PASS

**Historical approval (not approval of this revision):** approved 2026-09-30 (gsd-ui-checker: 4 PASS, 3 FLAG, 0 BLOCK)


### Scroll acceptance added 2026-10-07

Consume the bounded-workspace/selected-outcome requirements in `.planning/UI-SPEC.md` and the redesign implementation receipt. Verify no outer document overflow at 1440×900 and 1920×1080, matching heatmap/rail height, independent keyboard-scrollable contributions, and reachable final contribution/inspector/hedge actions. Longer content scrolls within the workspace; narrow widths/zoom must retain access. Do not repeat reference research or import demo code.
