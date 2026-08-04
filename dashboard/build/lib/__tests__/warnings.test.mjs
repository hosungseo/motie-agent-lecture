import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyRegion } from '../warnings.mjs';

test('two negative signals → warning', () => {
  const region = { exportChangePct: -5, occupancyRate: 95, netPowerChange: -10 };
  assert.equal(classifyRegion(region), 'warning');
});

test('three negative signals → warning', () => {
  const region = { exportChangePct: -5, occupancyRate: 80, netPowerChange: -10 };
  assert.equal(classifyRegion(region), 'warning');
});

test('all positive signals → good', () => {
  const region = { exportChangePct: 5, occupancyRate: 95, netPowerChange: 10 };
  assert.equal(classifyRegion(region), 'good');
});

test('only one negative signal → neutral', () => {
  const region = { exportChangePct: -5, occupancyRate: 95, netPowerChange: 10 };
  assert.equal(classifyRegion(region), 'neutral');
});

test('missing data (null) does not count as negative → neutral, not warning', () => {
  const region = { exportChangePct: null, occupancyRate: null, netPowerChange: -10 };
  assert.equal(classifyRegion(region), 'neutral');
});
