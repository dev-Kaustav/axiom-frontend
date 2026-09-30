# Frontend/backend integration contract

Status: capability contract; proposed operations are not implemented routes. Existing server source: `../../axiom-backend/api/main.py` and `api/schemas.py`. Freeze exact added paths/types against backend OpenAPI before each dependent implementation. Do not edit backend code as incidental frontend work.

| UI capability | Existing / required backend | Owner / readiness |
|---|---|---|
| Outcome resolution | GET /v1/instruments:resolve | Exists; real published registry required |
| Contract details | GET /v1/instruments/{id}?include=provenance | Exists; richer source display may require response extension |
| Basis states/relationships | GET /v1/bases/{id} | Exists; display descriptions, stable state IDs and richer relationship forms need agreement |
| Exposure | POST /v1/exposure | Exists; payout-only, not full UI P&L/drivers/scenario response |
| Catalog/coverage | Paginated instruments, scopes and coverage | AXM-05 addition |
| Wallet resolution | Input address -> profile/signer/position-holder mapping or typed error | AXM-08 addition |
| Portfolio synchronization | Create/read portfolio, request sync, read status, paginated positions/activity | AXM-08 addition |
| Private session | Challenge, verify, current session, logout | AXM-08 addition |
| Portfolio analytics | Version-pinned contributions, scenarios, costs and optional P&L | AXM-09 addition |
| Relationships | Scoped proof/evidence and graph-ready relation data | AXM-09 addition; reuse basis output where sufficient |
| Simulation/suggestions | Exact hypothetical inputs, common basis comparison, price/fee provenance and objective | AXM-10 addition |

## Payload rules
- IDs are opaque strings. Distinguish wallet signer, Polymarket position holder, portfolio ID, instrument ID, outcome token ID, basis ID/version and state key.
- Exact amounts/quantities use decimal strings and explicit currencies. Missing costs/prices are nullable with reasons; never coerce to zero. Formatting must not lose fractional shares/sub-cent values.
- Analytical responses identify portfolio snapshot, interpretation/basis versions, as-of time, coverage and relevant assumptions.
- Frontend does not construct a joint worst case from independently indexed bases, infer missing NO prices, or assign probability to scenario counts.
- Unsupported holdings remain visible. Results can be partially covered without implying full-portfolio certainty.
- State references carry basis ID/version and state key, never a persistent array index.
- Sync has explicit initial/loading/complete/partial/failed state, last success and observation window. Retain last good results with visible staleness during outages.
- Errors distinguish validation, unresolved account, unsupported scope, expired session, unavailable server, rate limit and stale version. Respect retry guidance and avoid polling storms.
- Account change/logout cancels requests and clears private caches. A late response from the prior address cannot populate the new account view.

## Integration sequencing
Frontend Phase 1 scaffolding can start now. Phase 2 live acceptance requires AXM-04/05 publication/catalog. Phase 3 requires AXM-08. Phase 4 requires AXM-09. Phase 5 requires AXM-09/10. Development fixtures may illustrate agreed contracts but do not count as live integration completion.

## Confirmed client libraries
TanStack Router owns validated navigable URL state. TanStack Query owns server data with account/snapshot/version-scoped keys, cancellation and explicit freshness policies. Wagmi owns wallet connection/signing, not backend authorization or portfolio accounting.
