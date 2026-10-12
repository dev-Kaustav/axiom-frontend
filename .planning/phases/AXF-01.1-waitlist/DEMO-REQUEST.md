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
frontend with `VITE_API_ORIGIN=https://api.rook.pm`. A backend Git push alone
does not deploy EC2; the server must run the rollout below.

Production acceptance completed on 2026-10-12. The live frontend initially
reached an older API that returned 404 for `/v1/demo-requests`; EC2 was still on
commit 627b3db with migration 0007. Ran `make prod` on EC2 to deploy 90f0de1 and
apply migration 0008. Added the demo request rate-limit location to the installed
Nginx site, preserving the Certbot configuration; `nginx -t` and reload passed.
Live Chrome submissions from rook.pm returned 202 and displayed the success
screen. A repeated uppercase email produced one normalized, timestamped RDS
row. Removed only the uniquely marked smoke-test row. Both header actions remain
visible; API readiness and the www origin's CORS preflight passed.

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
