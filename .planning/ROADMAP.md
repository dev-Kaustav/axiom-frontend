# Roadmap — Axiom Frontend v1

All phases are planned, none executed. Backend readiness is an explicit dependency, not an instruction to fake data or to re-test the demo.

## Phase 1: Production shell and API boundary
**ID:** AXF-01
**Goal:** Production shell and API boundary using backend data while preserving the validated terminal.
**Depends on:** None
**Requirements:** FND-01, FND-02
**Backend:** None for scaffolding; API origin and existing OpenAPI for integration
**Success criteria:** Production is independently implemented in root src/ with its own build/config/dependencies outside demo/; no production imports or copies demo code. Both routes retain correct assets/deep links; no silent fixture fallback.; Typed API requests preserve IDs/decimals, cancellation, structured errors, and response versions.
**Plans:** 0/2 complete

- [ ] 01-01-PLAN.md — Build an independent production frontend outside demo
- [ ] 01-02-PLAN.md — Add typed requests and contract-to-view adapters

## Phase 2: Backend catalog and evidence
**ID:** AXF-02
**Goal:** Backend catalog and evidence using backend data while preserving the validated terminal.
**Depends on:** Phase 1
**Requirements:** CAT-01, CAT-02
**Backend:** AXM-04 published families and AXM-05 catalog/provenance API
**Success criteria:** Browse backend contracts and coverage with pagination and metadata-driven family labels.; Inspect backend rules, provenance, assumptions and admission status without local reinterpretation.
**Plans:** 0/1 complete

- [ ] 02-01-PLAN.md — Connect catalog and inspector to published contracts

## Phase 3: Wallet onboarding and workspace
**ID:** AXF-03
**Goal:** Wallet onboarding and workspace using backend data while preserving the validated terminal.
**Depends on:** Phase 2
**Requirements:** WAL-01, WAL-02, WAL-03
**Backend:** AXM-08 resolution, sync and session APIs
**Success criteria:** Connect a wallet or enter an address; display resolved Polymarket account or actionable failure.; Show sync progress, last good snapshot, freshness, partial/error/empty distinctions and refresh.; Saved workspace login uses a backend-verified challenge/session; account changes clear private state.
**Plans:** 0/2 complete

- [ ] 03-01-PLAN.md — Connect wallet/address onboarding and durable sync status
- [ ] 03-02-PLAN.md — Add private workspace sign-in and session recovery

## Phase 4: Portfolio and scenario analytics
**ID:** AXF-04
**Goal:** Portfolio and scenario analytics using backend data while preserving the validated terminal.
**Depends on:** Phase 3
**Requirements:** EXP-01, EXP-02, EXP-03
**Backend:** AXM-09 analytical responses and AXM-08 portfolio snapshots
**Success criteria:** Portfolio rows reconcile with assigned and unresolved holdings; quantities and costs preserve precision.; Exposure and scenarios render backend results pinned to portfolio and semantic versions.; Separate incompatible bases/currencies and distinguish missing P&L from zero.
**Plans:** 0/1 complete

- [ ] 04-01-PLAN.md — Replace portfolio and exposure calculations with backend view models

## Phase 5: Relationships and hypothetical trades
**ID:** AXF-05
**Goal:** Relationships and hypothetical trades using backend data while preserving the validated terminal.
**Depends on:** Phase 4
**Requirements:** REL-01, SIM-01, SIM-02
**Backend:** AXM-09 relationship data and AXM-10 simulation/suggestion APIs
**Success criteria:** Relationships and evidence use backend proofs and stable instrument/state identifiers.; Hypothetical trade requests render consistent before/after results without mutating real holdings.; Suggestions expose objective, candidate scope and price/fee assumptions; stale results are invalidated.
**Plans:** 0/1 complete

- [ ] 05-01-PLAN.md — Connect relationships, suggestions and before/after simulation

## Phase 6: Production delivery and integration
**ID:** AXF-06
**Goal:** Production delivery and integration using backend data while preserving the validated terminal.
**Depends on:** Phase 5
**Requirements:** OPS-01, OPS-02
**Backend:** AXM-11 API/worker deployment and all preceding frontend phases
**Success criteria:** Production route, API/session configuration, caching and environment documentation support deployed use.; One representative connected journey and changed failure paths work without demo revalidation.
**Plans:** 0/1 complete

- [ ] 06-01-PLAN.md — Finish deployment configuration and one live integration journey
