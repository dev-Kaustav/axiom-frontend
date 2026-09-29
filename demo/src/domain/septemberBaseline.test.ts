import { expect, test } from 'vitest';
import { ANCHORS, RANGE_WIDTH_BP, facts } from './world';
import universe from '../data/universe/universe.json';
import decision from '../data/september-decision.json';
import { septemberAnchors } from '../data/september-anchors';

const hold = { interSepOct: 0, october: 0, interOctDec: 0, december: 0, postDec: 0 };

test('September hike is already included in the 4.00% starting upper bound', () => {
  expect(ANCHORS.startUpperBp).toBe(400);
  expect(ANCHORS.startUpperBp - RANGE_WIDTH_BP).toBe(375);
  expect(decision.upper_bound_bp).toBe(ANCHORS.startUpperBp);
  expect(decision.lower_bound_bp).toBe(ANCHORS.startUpperBp - RANGE_WIDTH_BP);
  expect(facts(hold).path).toEqual([400, 400, 400, 400, 400, 400]);
  expect(facts(hold).hikes2026).toBe(1);
  expect(facts(hold).scheduledPath).toBe('HPP');
  expect(facts({ ...hold, october: 25 }).terminalUpperBp).toBe(425);
  expect(facts({ ...hold, october: 25 }).hikes2026).toBe(2);
});

test('snapshot and future universe builds retain the same official Fed evidence', () => {
  for (const anchor of septemberAnchors()) {
    expect(universe.anchors.find(a => a.anchor_id === anchor.anchor_id)).toEqual(anchor);
  }
  expect(decision.decision_date).toBe('2026-09-16');
  expect(decision.effective_date).toBe('2026-09-17');
  expect(decision.change_bp).toBe(25);
});
