# Frontend UI implementation contract

Visual reference only: existing `demo/src/tokens.css`, `styles.css`, `components/primitives.tsx`, and seven-view workstation. Applied skill: frontend-design. User-approved demo supersedes suggestions to invent a new palette/layout.

## Preserve
Manrope body typography and IBM Plex Mono numeric typography; near-black surface ladder; violet brand/selection; green/red P&L; amber attention; existing compact radii and density. Define production-owned tokens in src/styles/tokens.css and primitives in src/components/primitives.tsx. Reproduce the approved visual values/hierarchy without copying or importing demo implementation. Independently implement the same table/inspector hierarchy, resizable panes, relationship graph, evidence cards, and before/after comparison patterns. Existing Rook branding is not renamed by this work.

## Additions
- Wallet/portfolio control in the existing book/header area: Connect wallet, Enter address, current account, Refresh, last sync and Disconnect.
- Before first portfolio: concise connect/address form. Empty wallet: "No positions found" only after a complete successful fetch. Resolution failure: "Polymarket account could not be resolved" with address correction.
- Catalog available independently of a saved workspace where backend permits. Scope selection uses backend metadata; remove the fixed MACRO / US RATES / 2026 production label.
- Loading: reserved panel/table geometry and readable status, not fabricated rows. First-load failure: retry panel. Refresh failure: keep previous data with "Refresh failed — showing data from …".
- Partial coverage: assigned/unresolved counts and direct link to affected holdings. Unavailable numeric cells show an em dash with reason, never zero.
- Separate exposure groups for incompatible bases/currencies. State links remain scoped to their versions.
- Simulation CTA: "Simulate trade"; proposed positions and indicative prices are visibly hypothetical. No Buy/Execute controls.
- Ticker uses actual backend price snapshots with timestamps, or is omitted if unavailable. Never label static fixtures live.

## Interaction/accessibility
Preserve keyboard navigation and inspector focus return. New forms have labels, inline errors and disabled/busy semantics. Status never depends on colour alone. Allow browser zoom; do not carry the blanket ctrl-wheel prevention into the production shell. Keep desktop workstation density; narrower layouts stack/fold secondary panels and allow deliberate table scrolling without hiding required controls. Respect reduced motion; no new decorative animation work.

## Verification scope
Inspect new onboarding/state views in the browser during implementation. Verify changed keyboard/focus paths. No new redesign, screenshot-baseline campaign, or repeat validation of the hardcoded demo family.

## Code ownership
Production lives in root src/, with root build/config and tests/. No production import, alias, stylesheet, asset or dependency may resolve into demo/. The demo may consume production-owned components in a later separately scoped change; no production-to-demo dependency is allowed.
