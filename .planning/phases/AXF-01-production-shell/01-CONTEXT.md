# Production shell and API boundary

Status: planned. Requirements: FND-01, FND-02.
Backend prerequisite: None for scaffolding; API origin and existing OpenAPI for integration.

Locked context: existing validated demo design; backend semantics; wallet/address onboarding; selected Polymarket families; simulation only. No demo-family recreation. Follow ../../UI-SPEC.md and ../../API-CONTRACT.md.

Plans: 01-01, 01-02, 01-03, 01-04. Execute sequentially. Backend gaps are named dependencies; do not build browser replacements. Implementation details may adapt to the finalized backend contract without changing user scope.

Production implementation lives in root src/ and root config/tests, outside demo/. Do not import or copy demo code; use it only as visual reference. Any later sharing flows demo -> production-owned components.
