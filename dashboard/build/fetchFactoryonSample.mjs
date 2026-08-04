// dashboard/build/fetchFactoryonSample.mjs
const ENDPOINT = 'https://apis.data.go.kr/B550624/fctryRegistInfo/getFctryListInIrsttService_v2';

// 보너스 위젯 전용 — 집계 목적 아님(트래픽 한도 때문에 지역 전수 집계는 하지 않음, 설계 문서 참고).
// 산업단지 하나를 지정해 등록 공장 몇 건만 보여준다.
export async function fetchFactoryonSample(serviceKey, irsttNm = '남동국가산업단지', limit = 5) {
  const url = `${ENDPOINT}?serviceKey=${serviceKey}&pageNo=1&numOfRows=${limit}&irsttNm=${encodeURIComponent(irsttNm)}&type=json`;
  const res = await fetch(url);
  const body = await res.text();

  const toRecord = (item) => ({
    companyName: (item.cmpnyNm || '').trim(),
    address: item.rnAdres || '',
    employeeCount: Number(item.allEmplyCo) || 0,
    industryName: item.indutyNm || '',
    mainProduct: item.mainProductCn || '',
    registeredDate: item.frstFctryRegistDe || '',
  });

  // 실측 결과 이 엔드포인트는 type=json일 때 실제 JSON을 반환한다(XML이 아님).
  // 다만 공장온 API 특성상 응답 형식이 호출별로 XML로 바뀌는 사례가 보고되어 있어
  // XML 정규식 파서를 폴백으로 남겨둔다.
  const trimmed = body.trim();
  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed);
    const items = parsed?.body?.items?.item;
    if (!items) return [];
    return (Array.isArray(items) ? items : [items]).map(toRecord);
  }

  const itemBlocks = body.match(/<item>[\s\S]*?<\/item>/g) || [];
  return itemBlocks.map((block) => {
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return m ? m[1].trim() : '';
    };
    return toRecord({
      cmpnyNm: get('cmpnyNm'),
      rnAdres: get('rnAdres'),
      allEmplyCo: get('allEmplyCo'),
      indutyNm: get('indutyNm'),
      mainProductCn: get('mainProductCn'),
      frstFctryRegistDe: get('frstFctryRegistDe'),
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.loadEnvFile('.env.local');
  const result = await fetchFactoryonSample(process.env.DATA_GO_KR_SERVICE_KEY);
  console.log(result);
}
