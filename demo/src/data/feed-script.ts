// Fictional presentation catalysts. IDs refer to the demo's quoted contracts;
// directions are YES-side and never enter the settlement engine.
export const HEADLINES = [
  { tag: 'FOMC', text: 'October desks firm hike pricing ahead of the decision window', contracts: [{ id: '2589813', direction: 1 }, { id: '2589812', direction: -1 }] },
  { tag: 'FLOW', text: 'December hike buyer sweeps offers across three levels', contracts: [{ id: '3215008', direction: 1 }] },
  { tag: 'MACRO', text: 'Cooling payrolls shift interest toward lower year-end rates', contracts: [{ id: '690200', direction: -1 }, { id: '1168142', direction: -1 }] },
  { tag: 'RATES', text: 'Front-end yields rise; 4.25% touch bids refresh', contracts: [{ id: '690202', direction: 1 }, { id: '1168141', direction: 1 }] },
  { tag: 'FLOW', text: 'Year-end hike contracts see repeated sell-side sweeps', contracts: [{ id: '3215008', direction: -1 }, { id: '4170754', direction: -1 }] },
  { tag: 'FOMC', text: 'Two-way October interest builds as hold buyers return', contracts: [{ id: '2589812', direction: 1 }, { id: '2589813', direction: -1 }] },
  { tag: 'MACRO', text: 'Retail sales surprise firms pricing for another 2026 hike', contracts: [{ id: '4620900', direction: 1 }, { id: '2657589', direction: -1 }] },
  { tag: 'RATES', text: 'Curve steepens; upper-rate contracts attract fresh bids', contracts: [{ id: '690200', direction: 1 }, { id: '1168142', direction: 1 }] },
] as const;
