function fmtPct(value) {
  if (value === null || value === undefined) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function fmtNum(value) {
  if (value === null || value === undefined) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('ko-KR')}`;
}

function renderCard(region) {
  return `
    <div class="card card--${region.status}" data-status="${region.status}">
      <h3>${region.fullName}</h3>
      <dl>
        <dt title="관세청 시도별 수출입실적 — 완결 연도 기준 전년 동기 대비">수출입 증감(전년비)</dt><dd>${fmtPct(region.exportChangePct)}</dd>
        <dt title="산업단지공단 가동업체 ÷ 입주업체 — 2025년 4분기 스냅샷">산업단지 가동률</dt><dd>${region.occupancyRate !== null ? region.occupancyRate.toFixed(1) + '%' : 'N/A'}</dd>
        <dt title="KEPCO 산업용 전기 신설+증설−해지 (주택용 제외)">전기사용고객 순증감</dt><dd>${fmtNum(region.netPowerChange)}</dd>
      </dl>
    </div>`;
}

function renderFactoryCard(factory) {
  return `
    <div class="factory-card">
      <strong>${factory.companyName}</strong>
      <span>${factory.industryName} · 종업원 ${factory.employeeCount.toLocaleString('ko-KR')}명</span>
      <span>${factory.mainProduct}</span>
    </div>`;
}

export function renderHtml(data) {
  const cardsHtml = data.regions.map(renderCard).join('\n');
  const factoryHtml = data.factorySample.map(renderFactoryCard).join('\n');
  const dataJson = JSON.stringify(data);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>지역산업 현황판</title>
<style>
  :root { --bg:#0a0e16; --card:#121826; --edge:#1e2637; --ink:#e8e4d8; --ink2:#9aa3b5; --warn:#e06c5f; --good:#46c28e; }
  * { box-sizing: border-box; }
  body { background: var(--bg); color: var(--ink); font-family: 'Pretendard','Apple SD Gothic Neo',sans-serif; padding: 40px 56px; }
  header p { color: var(--ink2); max-width: 60ch; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 24px; }
  .card { background: var(--card); border: 1px solid var(--edge); border-radius: 12px; padding: 16px; }
  .card--warning { border-color: var(--warn); }
  .card--good { border-color: var(--good); }
  .card h3 { margin: 0 0 8px; }
  .card dl { margin: 0; font-size: 14px; color: var(--ink2); }
  .card dt { display: inline-block; width: 60%; }
  .card dd { display: inline-block; margin: 0; color: var(--ink); }
  .factories { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
  .factory-card { background: var(--card); border: 1px solid var(--edge); border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
  .card { transition: transform 0.15s ease, border-color 0.15s ease; }
  .card:hover { transform: translateY(-2px); border-color: var(--ink2); }
  .toolbar { display: flex; align-items: center; gap: 20px; margin-top: 20px; flex-wrap: wrap; }
  #sort-toggle { background: var(--card); color: var(--ink); border: 1px solid var(--edge); border-radius: 8px; padding: 8px 14px; font-size: 14px; cursor: pointer; }
  #sort-toggle:hover { border-color: var(--ink2); }
  .legend { display: flex; gap: 16px; font-size: 13px; color: var(--ink2); }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .dot--warning { background: var(--warn); }
  .dot--good { background: var(--good); }
  dt[title] { cursor: help; border-bottom: 1px dotted var(--ink2); }
</style>
</head>
<body>
<header>
  <h1>지역산업 현황판</h1>
  <p>이 화면, 사람이 만들면: 관세청 통계 조회 + 산단공 파일 다운로드 + 한전 데이터 신청 + 엑셀 취합 — 최소 반나절. 이건 자동으로 만들었습니다.</p>
</header>
<div class="toolbar">
  <button id="sort-toggle" type="button">정렬: 경고 먼저</button>
  <div class="legend">
    <span class="legend-item"><i class="dot dot--warning"></i>경고 (2개 이상 지표 악화)</span>
    <span class="legend-item"><i class="dot dot--good"></i>호조 (3개 지표 전부 개선)</span>
  </div>
</div>
<section class="grid">
${cardsHtml}
</section>
<h2>지금 이 순간 등록된 공장 (Factoryon 실시간 조회)</h2>
<section class="factories">
${factoryHtml}
</section>
<script id="dashboard-data" type="application/json">${dataJson}</script>
<script>
(function () {
  var grid = document.querySelector('.grid');
  var btn = document.getElementById('sort-toggle');
  var originalOrder = Array.prototype.slice.call(grid.children);
  var priority = { warning: 0, neutral: 1, good: 2 };
  var sortedByWarning = false;

  btn.addEventListener('click', function () {
    sortedByWarning = !sortedByWarning;
    if (sortedByWarning) {
      var cards = Array.prototype.slice.call(grid.children).sort(function (a, b) {
        return priority[a.dataset.status] - priority[b.dataset.status];
      });
      cards.forEach(function (card) { grid.appendChild(card); });
      btn.textContent = '정렬: 지역 순으로';
    } else {
      originalOrder.forEach(function (card) { grid.appendChild(card); });
      btn.textContent = '정렬: 경고 먼저';
    }
  });
})();
</script>
</body>
</html>`;
}
