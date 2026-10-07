# Axiom Frontend

## What This Is
An independently implemented production terminal using the independent workstation in `demo/` as an interaction reference and the revised shared UI contract as visual direction. Backend-published families and wallet portfolios replace bundled demo data and browser-owned semantic calculations. The existing Rook visual branding stays unless separately changed; Axiom is the repository/project identity.

## Core Value
A user links or enters a Polymarket wallet, sees what their real holdings pay across supported states, understands settlement relationships, and simulates changes without submitting trades.

## Agreed Scope — 2026-09-30
- Polymarket across several backend-selected families; family ingestion belongs to the backend.
- Wallet connection/address entry, synchronization status, saved workspace, portfolio, exposure, scenarios, relationships, contracts/evidence, hypothetical trades.
- `demo/` is the visual and interaction reference only. Do not port, validate again, or reproduce its hardcoded family. Production calculations are backend-owned.
- Use React/TypeScript/Vite and independently implement the revised shared visual direction and existing interactions: panes, navigation, tables, inspector and relationships. Production owns its tokens and components.
- No live execution, trading credentials, CSV import, new exchange, or AI chat. Visual redesign is now authorized by the 2026-10-07 request; see UI-SPEC.md and shared research.
- Planning only in this task; no implementation or deployment claimed.

## Existing Structure
Root scripts build the static landing site and nested Vite demo into `dist/`. Vite currently assumes `/demo/`; Vercel middleware gates only that path. `demo/src/App.tsx` imports fixed positions and coordinates seven views. Domain modules and the ticker import bundled JSON and calculate semantics locally. This existing demo remains independent; its visual redesign is authorized. Production starts in root `src/`.

## Confirmed frontend stack
React + TypeScript + Vite; TanStack Router for typed navigation and validated URL state; TanStack Query for API caching, deduplication and refresh; Wagmi for wallet connection and authentication-message signing. FastAPI remains authoritative. Production is independent of demo.

## Architecture Decisions
- Root `src/` is the production application, with its own root package dependencies, index.html, vite.config.ts and tsconfig.json. Keep `demo/` as its independent package. No copying or importing demo implementation into production.
- Proposed production route `/app/`; `/demo/` stays independently built. Root scripts compose landing, production and demo outputs only at deployment packaging. Production build/typecheck must work without installing or building demo. No mode switch inside demo.
- Later component sharing, if requested, flows demo -> production-owned components. No shared-package extraction is in this milestone; production never depends on demo.
- Production source, styles, tests, config and assets live outside demo/. API contracts drive new components from the start.
- One typed API boundary with response-to-view adapters. Backend OpenAPI wins over proposed examples. Local fixtures are development-only and never a production fallback.
- Backend owns quantities, costs, basis alignment, payoff relationships, suggestions, and simulation. Frontend formats values and manages interaction state.
- Public wallet inspection and authenticated private workspace data are distinct. Wallet connection is not proof of ownership.
- All decimal quantities/money and venue identifiers cross the API without lossy Number conversion. Formatting rounds only for display.
- Configured API origin contains no secrets. Prefer same-origin API forwarding if deployment supports it; otherwise explicitly coordinate cookies/CORS/CSRF with backend.

## Workflow
Use GSD project/planning artifacts and frontend-design/ui-ux-pro-max guidance with revised UI-SPEC.md and the linked shared redesign research as authority. Old token values and demo-parity constraints are superseded. No mandatory human review or repeated demo UAT. Check changed integration paths and money/identity errors; do not add tests for every component. Model profile inherits this task; work is sequential. No vault workflow.

## Backend Dependency
`../../axiom-backend/.planning/PRODUCTION-PLAN.md` is the cross-project delivery reference. Existing domain endpoints alone do not serve the full UI. `.planning/API-CONTRACT.md` names missing backend capabilities so frontend implementation cannot invent server behaviour.

## Visual direction revision — 2026-10-07

The user requests a finished dark product with intentional foreground/background separation, selective gradients, Rook/violet identity, Manrope everywhere, readable text, no price ribbon and no unnecessary disclaimers. Reuse [the shared redesign report](reports/Rook%20dark%20terminal%20redesign.md) across AXF-01 through AXF-06 as mapped in UI-SPEC.md. Exact recipes and layout proportions remain proposed pending representative Exposure proof; no implementation, checker approval or phase completion is claimed. Production still independently implements the visual contract without importing or copying demo code/data. API, exact-value, backend dependency and honest-state requirements remain active.
