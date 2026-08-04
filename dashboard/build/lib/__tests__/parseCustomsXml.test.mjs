import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCustomsXml } from '../parseCustomsXml.mjs';

// 2026-08-05 실호출로 캡처한 실제 응답 (관세청 시도별 수출입실적, 서울, 2025년)
const FIXTURE_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><response><header><resultCode>00</resultCode><resultMsg>정상서비스.</resultMsg></header><body><items><item><cmtrBlncAmt>    -126,795,444</cmtrBlncAmt><expCnt>       5,839,026</expCnt><expUsdAmt>      68,724,178</expUsdAmt><impCnt>      14,589,123</impCnt><impUsdAmt>     195,519,621</impUsdAmt><priodTitle>총계</priodTitle></item><item><cmtrBlncAmt>    -126,795,444</cmtrBlncAmt><expCnt>       5,839,026</expCnt><expUsdAmt>      68,724,178</expUsdAmt><impCnt>      14,589,123</impCnt><impUsdAmt>     195,519,621</impUsdAmt><priodTitle>2025</priodTitle><sidoNm>서울특별시</sidoNm></item></items></body></response>`;

test('excludes the summary row without sidoNm', () => {
  const records = parseCustomsXml(FIXTURE_XML);
  assert.equal(records.length, 1);
});

test('parses numeric fields with commas/whitespace stripped', () => {
  const [record] = parseCustomsXml(FIXTURE_XML);
  assert.equal(record.sidoNm, '서울특별시');
  assert.equal(record.year, '2025');
  assert.equal(record.expUsdAmt, 68724178);
  assert.equal(record.impUsdAmt, 195519621);
  assert.equal(record.cmtrBlncAmt, -126795444);
});

test('returns empty array when body has no items', () => {
  const empty = `<?xml version="1.0"?><response><header><resultCode>99</resultCode><resultMsg>시작과 종료의 조회기간은 1년이내 기간만 가능합니다.</resultMsg></header><body/></response>`;
  assert.deepEqual(parseCustomsXml(empty), []);
});
