# Frontend requirements — v1

All items are pending implementation.

- [ ] **FND-01**: Production is independently implemented in root src/ with its own build/config/dependencies outside demo/; no production imports or copies demo code. Both routes retain correct assets/deep links; no silent fixture fallback.
- [ ] **FND-02**: Typed API requests preserve IDs/decimals, cancellation, structured errors, and response versions.
- [ ] **CAT-01**: Browse backend contracts and coverage with pagination and metadata-driven family labels.
- [ ] **CAT-02**: Inspect backend rules, provenance, assumptions and admission status without local reinterpretation.
- [ ] **WAL-01**: Connect a wallet or enter an address; display resolved Polymarket account or actionable failure.
- [ ] **WAL-02**: Show sync progress, last good snapshot, freshness, partial/error/empty distinctions and refresh.
- [ ] **WAL-03**: Saved workspace login uses a backend-verified challenge/session; account changes clear private state.
- [ ] **EXP-01**: Portfolio rows reconcile with assigned and unresolved holdings; quantities and costs preserve precision.
- [ ] **EXP-02**: Exposure and scenarios render backend results pinned to portfolio and semantic versions.
- [ ] **EXP-03**: Separate incompatible bases/currencies and distinguish missing P&L from zero.
- [ ] **REL-01**: Relationships and evidence use backend proofs and stable instrument/state identifiers.
- [ ] **SIM-01**: Hypothetical trade requests render consistent before/after results without mutating real holdings.
- [ ] **SIM-02**: Suggestions expose objective, candidate scope and price/fee assumptions; stale results are invalidated.
- [ ] **OPS-01**: Production route, API/session configuration, caching and environment documentation support deployed use.
- [ ] **OPS-02**: One representative connected journey and changed failure paths work without demo revalidation.

## Traceability

| Requirement | Phase |
|---|---|
| FND-01 | AXF-01 |
| FND-02 | AXF-01 |
| CAT-01 | AXF-02 |
| CAT-02 | AXF-02 |
| WAL-01 | AXF-03 |
| WAL-02 | AXF-03 |
| WAL-03 | AXF-03 |
| EXP-01 | AXF-04 |
| EXP-02 | AXF-04 |
| EXP-03 | AXF-04 |
| REL-01 | AXF-05 |
| SIM-01 | AXF-05 |
| SIM-02 | AXF-05 |
| OPS-01 | AXF-06 |
| OPS-02 | AXF-06 |

## Deferred
Live orders, automated execution, trading keys, additional venues, CSV import, and demo-model parity.
