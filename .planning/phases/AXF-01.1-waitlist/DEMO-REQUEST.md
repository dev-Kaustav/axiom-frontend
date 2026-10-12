# Demo request follow-up — 2026-10-12

User requested a new screen reached from the landing header, collecting only
email into a separate backend table for later manual credential delivery.

Implementation: `/request-demo`, email-only form with pending/validation/failure
and confirmed success states, shared generated API configuration, backend
`POST /v1/demo-requests`, and migration 0008 for `app.demo_requests`.
Keep the existing waitlist and gated `/demo` workstation available.
The landing header retains “Join the waitlist” alongside the added “Request
demo” action; both actions remain visible on phones.

Rollout: deploy backend after `alembic upgrade head`; install the updated Nginx
configuration and reload it to apply the shared intake rate limit. Deploy the
frontend with `VITE_API_ORIGIN=https://api.rook.pm`. Production acceptance remains
pending until a real browser request is verified in RDS.

Local verification completed: 36 backend tests passed against a dedicated local
Postgres scratch database (including waitlist regression and migration metadata
comparison); five build checks, six demo-gate checks and two browser checks
passed. Browser layouts covered 1440, 375, 320 and 844 pixel widths. A real
Chrome request to a temporary local API returned 202; a second request with
uppercase email also returned 202, and SQL confirmed one normalized row.
The success-state form visibility was corrected after browser verification.
These checks used local scratch data only, not RDS.

Focused checks: backend persistence, normalized/concurrent duplicates, readiness,
migration metadata; browser email-only payload, invalid input, failed requests,
pending duplicate prevention, mobile layout, success focus, and demo gate.
