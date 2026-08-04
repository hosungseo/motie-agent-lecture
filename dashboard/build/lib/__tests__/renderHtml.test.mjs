import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderHtml } from '../renderHtml.mjs';

const FIXTURE_DATA = {
  regions: [
    {
      code: '11',
      fullName: '서울특별시',
      shortName: '서울',
      exportChangePct: 12.3,
      occupancyRate: 91.5,
      saleRate: 94.47,
      netPowerChange: 500,
      status: 'good',
    },
  ],
  factorySample: [
    { companyName: '테스트공장', employeeCount: 42, industryName: '제조업', mainProduct: '테스트제품' },
  ],
  generatedAt: '2026-08-05',
};

test('embeds the data as JSON inside a script tag', () => {
  const html = renderHtml(FIXTURE_DATA);
  assert.match(html, /<script id="dashboard-data" type="application\/json">/);
  assert.match(html, /"fullName":\s*"서울특별시"/);
});

test('is a self-contained document (no external script/link tags)', () => {
  const html = renderHtml(FIXTURE_DATA);
  assert.doesNotMatch(html, /<script[^>]+src=/);
  assert.doesNotMatch(html, /<link[^>]+href="https?:/);
});

test('includes the bonus widget factory name', () => {
  const html = renderHtml(FIXTURE_DATA);
  assert.match(html, /테스트공장/);
});
