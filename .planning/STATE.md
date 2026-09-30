---
gsd_state_version: "1.0"
status: ready_to_execute
current_phase: AXF-01
current_phase_name: Production shell and API boundary
current_plan: "01"
stopped_at: Frontend initialized and six phases planned; implementation not started
last_updated: "2026-09-30T06:32:38.303633+00:00"
progress:
  total_phases: 6
  completed_phases: 0
  total_plans: 8
  completed_plans: 0
  percent: 0
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

## Next Action
Execute 01-01-PLAN.md from this repository with gsd-execute-phase 1. Do not launch all phases as though backend additions already exist.

## Latest correction
Production is an independent rewrite in root src/ with root tooling and dependencies. No demo code imports/copies or edits are planned. Later sharing may make demo depend on production-owned components, never the reverse. All eight plans have been updated to this boundary.

## Confirmed stack
User accepted React/TypeScript/Vite + TanStack Router + TanStack Query, with Wagmi wallet integration. Phase 1 and wallet plans updated; no dependencies installed or application code implemented.
