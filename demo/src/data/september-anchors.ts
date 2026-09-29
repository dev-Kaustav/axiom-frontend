import decision from './september-decision.json' with { type: 'json' };

/** Official historical facts; refreshing venue marks must preserve this baseline. */
export function septemberAnchors() {
  return [
  {
    "anchor_id": "sep_2026_decision",
    "statement": "September 16, 2026 FOMC decision",
    "value": "HIKE_25",
    "derivation": "EXTERNAL_SOURCE" as const,
    "confidence": "VERIFIED" as const,
    "reasoning": "The September 16, 2026 FOMC statement announced a 25 bp increase to a target range of 3.75%–4.00%, effective September 17. This is an established decision, already included in the demo baseline.",
    "evidence": [],
    "source_url": decision.source_url
  },
  {
    "anchor_id": "upper_bound_after_sep_2026_bps",
    "statement": "Current target federal funds upper bound after the September meeting (bp)",
    "value": decision.upper_bound_bp,
    "derivation": "EXTERNAL_SOURCE" as const,
    "confidence": "VERIFIED" as const,
    "reasoning": "The Federal Reserve announced a 3.75%–4.00% target range on September 16, 2026, effective September 17. All future paths start at the 4.00% upper bound (400 bp); 3.75% is the lower bound, not the starting upper bound.",
    "evidence": [],
    "source_url": decision.source_url
  }
];
}
