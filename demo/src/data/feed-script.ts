// Scripted wire for the Trade replay feed. Dummy copy for presentation only:
// it loops, names no person or outlet, and never feeds a payout computation.
export const HEADLINES: readonly { tag: string; text: string }[] = [
  { tag: 'FOMC', text: 'October decision window: desks flag two-way risk around a 25 bp move' },
  { tag: 'FLOW', text: 'Large buyer lifts December cut contracts across three levels' },
  { tag: 'MACRO', text: 'Core inflation print in line; front-end yields little changed' },
  { tag: 'RATES', text: '2-year yield edges higher into the close of the European session' },
  { tag: 'FLOW', text: 'Year-end 4.50% contracts see repeated sell-side sweeps' },
  { tag: 'FOMC', text: 'Minutes show divided committee on pace of further hikes' },
  { tag: 'MACRO', text: 'Payrolls revision lowers prior two months; markets add to cut pricing' },
  { tag: 'VENUE', text: 'Polymarket rate-path volume running above its 30-day average' },
  { tag: 'RATES', text: 'Curve steepens as long end sells off on supply concerns' },
  { tag: 'FLOW', text: 'Hold-in-October bids refresh at higher levels after data' },
  { tag: 'FOMC', text: 'Blackout period begins ahead of the October meeting' },
  { tag: 'MACRO', text: 'Jobless claims fall to a six-week low' },
  { tag: 'FLOW', text: 'Two-sided interest in inter-meeting touch contracts' },
  { tag: 'RATES', text: 'Fed funds futures trim December cut probability by 4 points' },
  { tag: 'VENUE', text: 'New strikes listed on the 2026 terminal rate event' },
  { tag: 'MACRO', text: 'Retail sales beat consensus; hike pricing nudges up' },
  { tag: 'FLOW', text: 'Profit-taking in "no cuts in 2026" after a strong week' },
  { tag: 'FOMC', text: 'Speaker calendar light; focus shifts to the dot plot' },
  { tag: 'RATES', text: 'Real yields drift lower; breakevens stable' },
  { tag: 'FLOW', text: 'Block of NO on another 2026 hike crosses near the offer' },
];
