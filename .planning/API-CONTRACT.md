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

## P0 waitlist contract — AXM-02.1 / AXF-01.1

- `POST /v1/waitlist`: JSON `name` (trimmed 1–100), `email` (valid, <=254,
  lowercase), optional `whatsapp` (international + and 8–15 digits after
  spaces/hyphens/parentheses are removed), `website` hidden honeypot (default empty).
- New and duplicate submissions: HTTP 202 `{"status":"accepted"}`. Unique
  normalized email with transactional PostgreSQL ON CONFLICT DO NOTHING;
  duplicates preserve the first row. Nonempty honeypot accepts without writing.
- Invalid input: 422. Database failure: generic 503 with no signup payload logs.
  Nginx intake limit: five/minute/IP, burst five, 429 with Retry-After 60.
- `GET /ready`: 200 `{"status":"ok"}` only with accessible database and
  waitlist table, otherwise generic 503. No snapshot needed. `/health` unchanged.
- No credentials; CORS GET/POST/OPTIONS, Content-Type for configured origins
  `https://rook.pm,https://www.rook.pm`. No listing/admin/export/message endpoints.
- Frontend at Vercel rook.pm uses build-time `VITE_API_ORIGIN=https://api.rook.pm`
  for generated `/config.js` and future React. Backend one `.env`, RDS verify-full.

## Demo requests — 2026-10-12

- Public page `/request-demo`, linked from the landing header, collects only email.
- `POST /v1/demo-requests`: JSON `{"email":"you@example.com"}`; validated,
  trimmed, lowercase, <=254 characters; extra fields rejected. New and duplicate
  emails return HTTP 202 `{"status":"accepted"}` after committing to
  `app.demo_requests` (migration 0008). The first row and timestamp are retained.
- Validation 422, generic database failure 503, shared Nginx intake limit 429.
  Same API origin and CORS configuration as waitlist; no credentials in requests.
- `/ready` now requires both intake tables. Credentials are emailed manually
  later by the operator; the page only confirms a saved request.
