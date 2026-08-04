const FIELD_NAMES = ['sidoNm', 'priodTitle', 'expUsdAmt', 'impUsdAmt', 'expCnt', 'impCnt', 'cmtrBlncAmt'];

function extractTag(itemXml, tagName) {
  const match = itemXml.match(new RegExp(`<${tagName}>([^<]*)</${tagName}>`));
  return match ? match[1].trim() : undefined;
}

// 관세청 GW API(getSidotradeList)의 flat <item> 응답을 파싱한다.
// "총계" 합계 행은 sidoNm이 없으므로 제외한다.
export function parseCustomsXml(xmlText) {
  const itemBlocks = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];

  return itemBlocks
    .map((block) => {
      const raw = {};
      for (const field of FIELD_NAMES) {
        raw[field] = extractTag(block, field);
      }
      return raw;
    })
    .filter((raw) => raw.sidoNm)
    .map((raw) => ({
      sidoNm: raw.sidoNm,
      year: raw.priodTitle,
      expUsdAmt: Number(raw.expUsdAmt.replace(/,/g, '')),
      impUsdAmt: Number(raw.impUsdAmt.replace(/,/g, '')),
      expCnt: Number(raw.expCnt.replace(/,/g, '')),
      impCnt: Number(raw.impCnt.replace(/,/g, '')),
      cmtrBlncAmt: Number(raw.cmtrBlncAmt.replace(/,/g, '')),
    }));
}
