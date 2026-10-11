---
gsd_state_version: "1.0"
milestone: v1
status: awaiting_operator_rollout
stopped_at: AXF-01.1 local implementation; operator rollout pending
last_updated: "2026-10-12"
state_head: e0830dee893d357add27fa1ff329d201309398ea
progress:
  total_phases: 7
  completed_phases: 0
  total_plans: 11
  completed_plans: 0
  percent: 0
current_phase_name: Landing waitlist integration
current_phase: AXF-01.1
current_plan: PLAN
---

# Project State

## Project Reference

See PROJECT.md, ROADMAP.md, API-CONTRACT.md and UI-SPEC.md.

## Current Position

Phase 1 of 6. Plan 01-01 is next. Planning completed inline using GSD formats and existing-code inspection; no independent agent review claimed.

## Decisions

User explicitly approved backend-driven production, selected Polymarket families, wallet sync, and simulation without execution. Demo is visual reference only. No vault, no mandatory human gates, no unnecessary demo tests. Preserve Rook visuals. Proposed /app/ production route remains reversible.

## Dependencies

Phase 1 can start without new backend endpoints. Live catalog needs AXM-04/05; wallet/session needs AXM-08; analytics/relationships need AXM-09; simulation needs AXM-10. No missing backend contract is reported as implemented.

## Historical Next Action

Execute 01-01-PLAN.md from this repository with gsd-execute-phase 1. Do not launch all phases as though backend additions already exist.

## Latest correction

Production is an independent rewrite in root src/ with root tooling and dependencies. No demo code imports/copies or edits are planned. Later sharing may make demo depend on production-owned components, never the reverse. All eight plans have been updated to this boundary.

## Confirmed stack

User accepted React/TypeScript/Vite + TanStack Router + TanStack Query, with Wagmi wallet integration. Phase 1 and wallet plans updated; no dependencies installed or application code implemented.

## Session

**Last session:** 2026-09-30T13:23:38.609Z
**Stopped at:** Phase 1 UI-SPEC approved
**Resume file:** .planning/phases/AXF-01-production-shell/01-UI-SPEC.md

## Visual planning revision — 2026-10-07

Shared redesign research is incorporated into UI-SPEC.md and AXF-01–06 plans. Old tokens, mono fonts, exact demo parity and no-redesign restrictions are superseded by explicit user direction. Candidate visual recipes remain proposed pending representative Exposure proof; no new checker run, application implementation or completion is claimed. Existing progress/counters and backend/API dependencies are unchanged. The earlier session/approval notes above are historical; resume with the revised UI contract.


## Current P0 pointer — 2026-10-12

Earlier phase/progress/session notes are historical. Current focus is AXF-01.1.
Code and local verification are implemented; user will run production DevOps.
Next: follow backend docs/deployment.md, set Vercel VITE_API_ORIGIN, and confirm
browser signup plus duplicate behavior in RDS. Resume broader product plans only
after P0 acceptance. No deployed success or broader operations completion claimed.
