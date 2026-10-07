# Axiom frontend

Read `.planning/PROJECT.md`, `.planning/ROADMAP.md`, and the relevant phase plan before implementing production work. API dependencies are in `.planning/API-CONTRACT.md`; visual rules are in `.planning/UI-SPEC.md`.

- The independently built `demo/` is an interaction reference; the revised `.planning/UI-SPEC.md` and linked research govern the visual direction. Do not recreate or revalidate its hardcoded family as production scope.
- Production families, positions, exposure, relationships, and simulation come from `../axiom-backend`. Do not replace missing backend capabilities with browser semantic logic or silent demo fallbacks.
- Build production independently in root src/, with root tooling/dependencies and tests/. Use the demo only as visual reference; do not copy or import its code, CSS, configs or assets. Apply the revised shared visual direction and preserve Rook branding; old exact appearance/token rules are superseded.
- Demo redesign is authorized. Keep its package independent; production builds without demo. Later sharing may flow demo -> production-owned components, never the reverse; do not introduce shared packages prematurely.
- Keep exact API amounts and external IDs intact. Do not compute backend financial results from rounded display values.
- First release is read-only wallet portfolios and hypothetical simulation. No trading keys, spend approvals, order submission or execution controls.
- Use focused checks for changed integration, money, identity and request-ordering behaviour. No blanket human-review gates or repeat demo UAT. User instructions override generic workflow checkpoints, including the inherited GSD verification-timing setting.
- Planning files belong in `.planning/`; the external-vault workflow is retired.
- Keep frontend and backend changes scoped to their own repositories. Coordinate absent API contracts explicitly.

Run Archify from this repository root; keep diagrams, editable candidates and verification receipts under this repository’s `.archify/` directory.

Reuse `.planning/reports/Rook dark terminal redesign.md` and linked research in UI phases rather than restarting design research. The linked implementation receipt records the executed Exposure proof and lighting correction; final visual review and production adoption remain pending. Manrope sans throughout, no mono or price ribbon; preserve honest state/API contracts while removing unnecessary product disclaimers.

The rendered demo correction uses shared radial light across adjoining surfaces/gutters, not repeated vertical header gradients. Reuse `.planning/reports/Rook dark terminal implementation.md` with the research report; production acceptance includes bounded viewport/workspace and whole-panel selected-outcome scrolling with sticky actions, hidden scrollbar chrome, restrained pointer-responsive lighting, and the relationship map on the left with the evidence inspector above the Hedge failure watch on the right.
