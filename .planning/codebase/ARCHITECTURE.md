# Observed frontend baseline

Inspected 2026-09-30; no application changes made.
- Root package builds landing assets in public/ and nested demo/ into dist/ using scripts/build.mjs.
- demo/package.json: React 19, TypeScript, Vite, Lucide; Vitest and Playwright already present.
- demo/vite.config.ts: /demo/ base. vercel.json and middleware.ts target /demo; demo-gate.mjs is demonstration access control, not production wallet authentication.
- demo/src/App.tsx: hash navigation across Exposure, Portfolio, Scenarios, Relationships, Trade, Contracts, Data. Fixed portfolio imports and Fed label.
- demo/src/domain/engine.ts: bundled universe and portfolio composition; local semantics and arithmetic through world/basis/claims/exposure/relations/decisionSupport.
- Demo components import its domain facade and deeper modules. Leave this graph alone; implement production components independently.
- Ticker imports snapshot and positions at module load. ContractInspector expects synchronous contractView. Production equivalents need asynchronous data adapters; demo components are not migrated.
- Tokens/styles and primitives are the validated visual baseline. Domain tests validate demo calculations and are not a production family acceptance dependency.
- Existing root/nested builds must keep public landing and demo functioning while adding production output.

## Planned independent application
Root src/ owns production code; index.html, vite.config.ts, tsconfig.json and root package.json own its build/dependencies. tests/ owns production checks. Demo remains a separate package. Root deployment composition can build both but production itself must not require demo to compile or run. No shared component extraction now.
