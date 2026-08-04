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

test('includes filter, search, and metric sort controls with handlers', () => {
  const html = renderHtml(FIXTURE_DATA);
  assert.match(html, /id="region-search"/);
  assert.match(html, /id="sort-select"/);
  assert.match(html, /data-filter="warning"/);
  assert.match(html, /addEventListener\('click'/);
  assert.match(html, /addEventListener\('change'/);
});

test('region rows carry a data-status attribute for client-side sorting', () => {
  const html = renderHtml(FIXTURE_DATA);
  assert.match(html, /data-status="good"/);
});

test('metric headers carry explanatory title tooltips', () => {
  const html = renderHtml(FIXTURE_DATA);
  assert.match(html, /<span title="[^"]+">수출입 증감/);
});

test('escapes unsafe values rendered into HTML', () => {
  const html = renderHtml({
    ...FIXTURE_DATA,
    factorySample: [{ companyName: '<script>alert(1)</script>', employeeCount: 1, industryName: '제조업', mainProduct: '제품' }],
  });
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
