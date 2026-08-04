import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseIndustrialParkXlsx } from '../parseIndustrialPark.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const XLSX_PATH = path.resolve(
  __dirname,
  '../../../data/raw/한국산업단지공단_전국산업단지현황통계_20251231.xlsx'
);

test('parses all 17 시도 소계 rows', () => {
  const rows = parseIndustrialParkXlsx(XLSX_PATH);
  assert.equal(rows.length, 17);
});

test('서울 row has expected raw values (2025Q4 snapshot)', () => {
  const rows = parseIndustrialParkXlsx(XLSX_PATH);
  const seoul = rows.find((r) => r.shortName === '서울');
  assert.ok(seoul, 'seoul row not found');
  assert.equal(seoul.tenantCount, 15648);
  assert.equal(seoul.operatingCount, 14318);
  assert.equal(seoul.saleRate, 94.47);
});

test('occupancyRate is computed as operatingCount / tenantCount * 100', () => {
  const rows = parseIndustrialParkXlsx(XLSX_PATH);
  const seoul = rows.find((r) => r.shortName === '서울');
  assert.ok(Math.abs(seoul.occupancyRate - 91.5) < 0.05);
});
