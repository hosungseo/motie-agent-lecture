// dashboard/build/fetchCustoms.mjs
import { parseCustomsXml } from './lib/parseCustomsXml.mjs';

const ENDPOINT = 'https://apis.data.go.kr/1220000/sidotrade/getSidotradeList';

async function fetchYear(serviceKey, strtYymm, endYymm) {
  const url = `${ENDPOINT}?serviceKey=${serviceKey}&strtYymm=${strtYymm}&endYymm=${endYymm}`;
  const res = await fetch(url);
  const xml = await res.text();
  return parseCustomsXml(xml);
}

// 관세청 API는 조회기간이 1년을 초과할 수 없어 연도별로 나눠 호출한다.
// currentYear/prevYear는 완결된 연도 기준(둘 다 1/1~12/31 전체) — 데모 실행 시점(2026-08) 기준 2025/2024.
export async function fetchCustoms(serviceKey, currentYear = 2025, prevYear = 2024) {
  const [current, prev] = await Promise.all([
    fetchYear(serviceKey, `${currentYear}01`, `${currentYear}12`),
    fetchYear(serviceKey, `${prevYear}01`, `${prevYear}12`),
  ]);
  return { current, prev };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.loadEnvFile('.env.local');
  const result = await fetchCustoms(process.env.DATA_GO_KR_SERVICE_KEY);
  console.log(`current: ${result.current.length} regions, prev: ${result.prev.length} regions`);
  console.log(result.current[0]);
}
