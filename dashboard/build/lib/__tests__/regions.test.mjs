import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS, codeByFullName, codeByShortName } from '../regions.mjs';

test('REGIONS has exactly 17 entries', () => {
  assert.equal(REGIONS.length, 17);
});

test('codeByFullName resolves 관세청/KEPCO 표기', () => {
  assert.equal(codeByFullName('서울특별시'), '11');
  assert.equal(codeByFullName('경기도'), '41');
  assert.equal(codeByFullName('강원특별자치도'), '51');
  assert.equal(codeByFullName('전북특별자치도'), '52');
});

test('codeByShortName resolves 산단공 "OO소계" 표기', () => {
  assert.equal(codeByShortName('서울'), '11');
  assert.equal(codeByShortName('경기'), '41');
  assert.equal(codeByShortName('전북'), '52');
});

test('codeByFullName returns undefined for unknown name', () => {
  assert.equal(codeByFullName('없는지역'), undefined);
});
