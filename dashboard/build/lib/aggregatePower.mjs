// KEPCO 산업분류별 전기사용고객 증감 rows(시군구 x 산업분류)를 지역 단위 순증감으로 합산한다.
// "주택용"은 산업 신호가 아니므로 제외한다.
export function aggregatePower(rows) {
  return rows
    .filter((row) => row.biz !== '주택용')
    .reduce((sum, row) => sum + row.new + row.expansion - row.cancel, 0);
}
