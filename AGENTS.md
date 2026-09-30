# Axiom frontend

Read `.planning/PROJECT.md`, `.planning/ROADMAP.md`, and the relevant phase plan before implementing production work. API dependencies are in `.planning/API-CONTRACT.md`; visual rules are in `.planning/UI-SPEC.md`.

- The validated `demo/` is the visual and interaction reference. Do not recreate or revalidate its hardcoded family as production scope.
- Production families, positions, exposure, relationships, and simulation come from `../axiom-backend`. Do not replace missing backend capabilities with browser semantic logic or silent demo fallbacks.
- Build production independently in root src/, with root tooling/dependencies and tests/. Use the demo only as visual reference; do not copy or import its code, CSS, configs or assets. Preserve the approved appearance and Rook branding.
- Leave demo/ unchanged. Production builds without demo. Later sharing may flow demo -> production-owned components, never the reverse; do not introduce shared packages prematurely.
- Keep exact API amounts and external IDs intact. Do not compute backend financial results from rounded display values.
- First release is read-only wallet portfolios and hypothetical simulation. No trading keys, spend approvals, order submission or execution controls.
- Use focused checks for changed integration, money, identity and request-ordering behaviour. No blanket human-review gates or repeat demo UAT. User instructions override generic workflow checkpoints, including the inherited GSD verification-timing setting.
- Planning files belong in `.planning/`; the external-vault workflow is retired.
- Keep frontend and backend changes scoped to their own repositories. Coordinate absent API contracts explicitly.
