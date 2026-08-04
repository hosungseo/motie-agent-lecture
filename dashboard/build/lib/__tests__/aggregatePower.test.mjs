import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregatePower } from '../aggregatePower.mjs';

// 2026-08-05 실호출로 캡처 (KEPCO 서울 강남구 2025-09, 일부 발췌 + 검증용 주택용 행 포함)
const FIXTURE_ROWS = [
  { biz: '건설업', new: 659, expansion: 50, cancel: 2528 },
  { biz: '교육 서비스업', new: 0, expansion: 1025, cancel: 0 },
  { biz: '부동산업', new: 6768, expansion: 1705, cancel: 1496 },
  { biz: '제조업', new: 0, expansion: 30, cancel: 0 },
  { biz: '주택용', new: 1080, expansion: 63, cancel: 1400 },
];

test('excludes 주택용 rows from the industrial signal', () => {
  const net = aggregatePower(FIXTURE_ROWS);
  // (659+50-2528) + (0+1025-0) + (6768+1705-1496) + (0+30-0) = 6213
  assert.equal(net, 6213);
});

test('returns 0 for empty input', () => {
  assert.equal(aggregatePower([]), 0);
});

test('including 주택용 would change the result (sanity check the filter matters)', () => {
  const withoutFilter = FIXTURE_ROWS.reduce((sum, r) => sum + r.new + r.expansion - r.cancel, 0);
  const withFilter = aggregatePower(FIXTURE_ROWS);
  assert.notEqual(withFilter, withoutFilter);
});
