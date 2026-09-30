# Wallet onboarding and workspace

Status: planned. Requirements: WAL-01, WAL-02, WAL-03.
Backend prerequisite: AXM-08 resolution, sync and session APIs.

Locked context: existing validated demo design; backend semantics; wallet/address onboarding; selected Polymarket families; simulation only. No demo-family recreation. Follow ../../UI-SPEC.md and ../../API-CONTRACT.md.

Plans: 03-01, 03-02. Execute sequentially. Backend gaps are named dependencies; do not build browser replacements. Implementation details may adapt to the finalized backend contract without changing user scope.

Production implementation lives in root src/ and root config/tests, outside demo/. Do not import or copy demo code; use it only as visual reference. Any later sharing flows demo -> production-owned components.
