import { test } from 'node:test';
import assert from 'node:assert/strict';
import { joinRegions } from '../join.mjs';

const customsCurrent = [
  { sidoNm: '서울특별시', year: '2025', expUsdAmt: 110 },
  { sidoNm: '부산광역시', year: '2025', expUsdAmt: 50 },
];
const customsPrev = [
  { sidoNm: '서울특별시', year: '2024', expUsdAmt: 100 },
  { sidoNm: '부산광역시', year: '2024', expUsdAmt: 100 },
];
const parkRows = [
  { shortName: '서울', tenantCount: 100, operatingCount: 95, saleRate: 94 },
  { shortName: '부산', tenantCount: 100, operatingCount: 80, saleRate: 90 },
];
const powerByCode = { '11': 500, '26': -200 };

test('joins three sources by region code', () => {
  const regions = joinRegions({ customsCurrent, customsPrev, parkRows, powerByCode });
  assert.equal(regions.length, 17);
  const seoul = regions.find((r) => r.code === '11');
  assert.equal(seoul.fullName, '서울특별시');
  assert.equal(seoul.exportChangePct, 10); // (110-100)/100*100
  assert.equal(seoul.occupancyRate, 95);
  assert.equal(seoul.netPowerChange, 500);
});

test('computes negative export change correctly', () => {
  const regions = joinRegions({ customsCurrent, customsPrev, parkRows, powerByCode });
  const busan = regions.find((r) => r.code === '26');
  assert.equal(busan.exportChangePct, -50); // (50-100)/100*100
  assert.equal(busan.netPowerChange, -200);
});

test('missing data for a region yields null fields instead of throwing', () => {
  const regions = joinRegions({ customsCurrent: [], customsPrev: [], parkRows: [], powerByCode: {} });
  const seoul = regions.find((r) => r.code === '11');
  assert.equal(seoul.exportChangePct, null);
  assert.equal(seoul.occupancyRate, null);
  assert.equal(seoul.netPowerChange, null);
});
