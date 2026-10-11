# Local verification — 2026-10-12

Status: LOCAL PASS; production rollout and browser/RDS acceptance OPERATOR PENDING.
User explicitly owns production DevOps. No production migrations or signups run
by the agent; production Nginx/certificates/renewal are not represented as verified.

## Frontend evidence

- `VITE_API_ORIGIN=https://api.rook.pm npm run build`: passed.
- `VITE_API_ORIGIN=https://api.rook.pm node --test tests/build/waitlist-config.test.mjs`:
  generated asset contains only the requested public origin, loaded before form JS.
- `npm run test:gate`: six existing demo gate tests passed.
- Playwright `tests/waitlist_browser.py`: navigation/hero anchors, bottom placement,
  sticky header offset, reduced motion, keyboard, desktop and 390/320 mobile stack,
  real local acceptance/duplicate requests, values preserved, 422 focus/validation,
  429 retry guidance, 503/network failures, pending suppression, and demo sign-in passed.
- Browser scratch API persistence: exactly one row after two submissions.
- Desktop/mobile screenshots inspected locally; no generated screenshot/build
  artifacts committed. Unrelated demo App.tsx/styles.css edits remain uncommitted.
- `node --check` passed for build and form scripts.
- Existing production-app `npm run typecheck` fails in unchanged
  src/state/viewState.ts at lines 46 and 52 (union access to error). This is outside
  the static landing build and waitlist scope; no broader shell completion claimed.

## Reproduce

Build with the desired VITE_API_ORIGIN, then run the config test with the same
value. Browser tests require Python Playwright/Chromium, preview at :4174,
VITE_API_ORIGIN=http://127.0.0.1:9001 and a backend at :9001 pointing only to a
migrated scratch database with AXIOM_CORS_ORIGINS=http://127.0.0.1:4174 and no
AXIOM_REGISTRY_PATH. Run `python tests/waitlist_browser.py`.

Vercel environment, Git production deployment and live browser/RDS acceptance
are operator tasks in DEPLOYMENT.txt and ../axiom-backend/docs/deployment.md.

## Cherry-picked main verification

Waitlist commit is cherry-picked onto latest main, preserving its three newer
commits. Unrelated local demo edits are excluded. Demo build and root packaging
passed using main source; production origin asset check and all six gate checks
passed. Browser suite passed against the cherry-picked main frontend/backend
and isolated scratch PostgreSQL. Vercel deploys main with
VITE_API_ORIGIN=https://api.rook.pm; live rollout remains operator-owned.
