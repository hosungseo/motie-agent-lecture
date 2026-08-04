// dashboard/build/fetchPower.mjs
import { REGIONS } from './lib/regions.mjs';
import { aggregatePower } from './lib/aggregatePower.mjs';

const ENDPOINT = 'https://bigdata.kepco.co.kr/openapi/v1/change/custNum/industryType.do';

// 2026-08-05 기준 확인된 최신 발행월. 2026-06은 404(NotFound)였음.
const YEAR = 2026;
const MONTH = '05';

async function fetchRegion(apiKey, metroCd) {
  const url = `${ENDPOINT}?year=${YEAR}&month=${MONTH}&metroCd=${metroCd}&apiKey=${apiKey}&returnType=json`;
  const res = await fetch(url);
  const body = await res.json();
  if (!body.data) return [];
  return body.data;
}

// 17개 시도를 순회하며 시군구 전체 데이터를 받아 시도 단위로 합산한다.
export async function fetchPower(apiKey) {
  const results = {};
  for (const region of REGIONS) {
    const rows = await fetchRegion(apiKey, region.code);
    results[region.code] = aggregatePower(rows);
  }
  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.loadEnvFile('.env.local');
  const result = await fetchPower(process.env.KEPCO_API_KEY);
  console.log(result);
}
