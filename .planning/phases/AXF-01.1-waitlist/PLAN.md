# AXF-01.1: Landing waitlist integration

Priority: P0. Depends on AXM-02.1. Requirements: WL-UI-01, WL-CFG-01.
Execute before broader product work; existing phase evidence stays historical.

1. Implement bottom waitlist section, navigation/hero anchors, responsive form and honest request states.
2. Configure VITE_API_ORIGIN-generated public configuration, preserving demo gate.
3. Verify anchors, sticky offset, keyboard/mobile layout, pending/errors/success, generated config and demo gate.
4. Commit and push this repository's changes; preserve unrelated edits and exclude secrets/artifacts.
5. Operator sets Vercel build origin, confirms Git production deployment and browser/RDS signup.

Acceptance: deployed browser signup creates exactly one RDS row, repeated normalized
email preserves it, with no snapshot required. Local success does not mark live
acceptance complete. No listing/admin/export or automated messaging scope.
