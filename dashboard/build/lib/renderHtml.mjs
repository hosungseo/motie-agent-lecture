function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

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

function statusLabel(status) {
  return { warning: '주의', neutral: '관찰', good: '양호' }[status] ?? '관찰';
}

function negativeSignals(region) {
  const signals = [];
  if (region.exportChangePct !== null && region.exportChangePct < 0) signals.push(`수출입 ${fmtPct(region.exportChangePct)}`);
  if (region.occupancyRate !== null && region.occupancyRate < 90) signals.push(`가동률 ${region.occupancyRate.toFixed(1)}%`);
  if (region.netPowerChange !== null && region.netPowerChange < 0) signals.push(`전력 고객 ${fmtNum(region.netPowerChange)}`);
  return signals;
}

function renderWarning(region, index) {
  return `
          <article class="signal-case reveal" style="--delay:${index * 90}ms">
            <div class="signal-case__index">0${index + 1}</div>
            <div>
              <p class="eyebrow">CHECK REGION</p>
              <h3>${escapeHtml(region.fullName)}</h3>
            </div>
            <div class="signal-case__reasons">${negativeSignals(region).map((signal) => `<span>${escapeHtml(signal)}</span>`).join('')}</div>
            <a href="#region-${escapeHtml(region.code)}" aria-label="${escapeHtml(region.fullName)} 지표 보기">지표 보기 <span aria-hidden="true">↘</span></a>
          </article>`;
}

function renderRegion(region, maxExport, maxPower) {
  const exportWidth = region.exportChangePct === null ? 0 : Math.max(4, Math.abs(region.exportChangePct) / maxExport * 100);
  const occupancyWidth = region.occupancyRate === null ? 0 : Math.max(4, Math.min(100, region.occupancyRate));
  const powerWidth = region.netPowerChange === null ? 0 : Math.max(4, Math.abs(region.netPowerChange) / maxPower * 100);
  return `
          <article class="region-row" id="region-${escapeHtml(region.code)}" tabindex="0" role="button" aria-pressed="false"
            data-name="${escapeHtml(`${region.fullName} ${region.shortName}`)}"
            data-status="${escapeHtml(region.status)}"
            data-export="${region.exportChangePct ?? ''}"
            data-occupancy="${region.occupancyRate ?? ''}"
            data-power="${region.netPowerChange ?? ''}">
            <div class="region-identity">
              <span class="status status--${escapeHtml(region.status)}">${statusLabel(region.status)}</span>
              <strong>${escapeHtml(region.fullName)}</strong>
              <small>${escapeHtml(region.shortName)} · ${escapeHtml(region.code)}</small>
            </div>
            <div class="metric metric--${region.exportChangePct < 0 ? 'down' : 'up'}">
              <span class="metric__mobile-label">수출입 증감</span>
              <strong>${fmtPct(region.exportChangePct)}</strong>
              <i aria-hidden="true"><b style="width:${exportWidth.toFixed(1)}%"></b></i>
            </div>
            <div class="metric metric--${region.occupancyRate < 90 ? 'down' : 'up'}">
              <span class="metric__mobile-label">산단 가동률</span>
              <strong>${region.occupancyRate !== null ? `${region.occupancyRate.toFixed(1)}%` : 'N/A'}</strong>
              <i aria-hidden="true"><b style="width:${occupancyWidth.toFixed(1)}%"></b></i>
            </div>
            <div class="metric metric--${region.netPowerChange < 0 ? 'down' : 'up'}">
              <span class="metric__mobile-label">전력 고객 순증감</span>
              <strong>${fmtNum(region.netPowerChange)}</strong>
              <i aria-hidden="true"><b style="width:${powerWidth.toFixed(1)}%"></b></i>
            </div>
            <span class="region-row__arrow" aria-hidden="true">↗</span>
          </article>`;
}

function renderFactory(factory, index) {
  return `
          <article class="factory-row reveal" style="--delay:${index * 70}ms">
            <span class="factory-row__index">${String(index + 1).padStart(2, '0')}</span>
            <div><strong>${escapeHtml(factory.companyName)}</strong><span>${escapeHtml(factory.industryName)}</span></div>
            <div><small>주요 생산품</small><span>${escapeHtml(factory.mainProduct)}</span></div>
            <div><small>종업원</small><span>${Number(factory.employeeCount ?? 0).toLocaleString('ko-KR')}명</span></div>
          </article>`;
}

export function renderHtml(data) {
  const regions = data.regions ?? [];
  const warnings = regions.filter((region) => region.status === 'warning');
  const good = regions.filter((region) => region.status === 'good');
  const neutral = regions.filter((region) => region.status === 'neutral');
  const occupancyValues = regions.map((region) => region.occupancyRate).filter(Number.isFinite);
  const avgOccupancy = occupancyValues.length
    ? occupancyValues.reduce((total, value) => total + value, 0) / occupancyValues.length
    : 0;
  const totalPower = regions.reduce((total, region) => total + (region.netPowerChange ?? 0), 0);
  const maxExport = Math.max(1, ...regions.map((region) => Math.abs(region.exportChangePct ?? 0)));
  const maxPower = Math.max(1, ...regions.map((region) => Math.abs(region.netPowerChange ?? 0)));
  const generatedAt = data.generatedAt ?? '2026-08-05';
  const safeDataJson = JSON.stringify(data).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#11120f" />
<meta name="description" content="관세청·산업단지공단·KEPCO 데이터를 자동 결합한 17개 시도 지역산업 현황판" />
<title>지역산업 시그널 — 17개 시도 산업 현황판</title>
<style>
  :root {
    --ink:#11120f; --paper:#f2efe7; --white:#fffef8; --muted:#696960; --line:#cbc8bd;
    --accent:#ff5c00; --warning:#c43a2c; --good:#177c55; --neutral:#6d6b63;
    --display:'Pretendard','Apple SD Gothic Neo','Noto Sans KR',sans-serif;
    --mono:'SFMono-Regular','Roboto Mono','IBM Plex Mono',monospace;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth;background:var(--paper)}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--display);font-synthesis:none}
  button,input,select{font:inherit}
  a{color:inherit}
  .skip-link{position:fixed;left:20px;top:16px;z-index:1000;padding:12px 16px;background:var(--white);color:var(--ink);transform:translateY(-160%)}
  .skip-link:focus{transform:none}
  .visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
  .site-nav{position:absolute;z-index:20;top:0;left:0;width:100%;height:84px;padding:0 clamp(24px,5vw,72px);display:flex;align-items:center;justify-content:space-between;color:var(--white);border-bottom:1px solid rgba(255,255,255,.18)}
  .brand{display:flex;align-items:center;gap:14px;font-weight:800;text-decoration:none;letter-spacing:-.03em}
  .brand-mark{display:grid;place-items:center;width:32px;height:32px;background:var(--accent);color:var(--ink);font-family:var(--mono);font-size:12px}
  .site-nav__links{display:flex;align-items:center;gap:28px;font-size:14px}
  .site-nav__links a{text-decoration:none;color:#d8d7d0}.site-nav__links a:hover,.site-nav__links a:focus-visible{color:var(--white)}
  .hero{position:relative;min-height:900px;height:100svh;overflow:hidden;background:var(--ink);color:var(--white);padding:clamp(138px,18vh,190px) clamp(24px,5vw,72px) 64px}
  .hero::before,.hero::after{content:'';position:absolute;pointer-events:none}
  .hero::before{inset:84px 0 0;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px);background-size:clamp(72px,8vw,132px) clamp(72px,8vw,132px);mask-image:linear-gradient(to bottom,black,transparent 85%)}
  .hero::after{width:48vw;height:48vw;right:-19vw;bottom:-24vw;border:1px solid rgba(255,92,0,.55);border-radius:50%;box-shadow:0 0 0 8vw rgba(255,92,0,.035),0 0 0 16vw rgba(255,92,0,.025)}
  .hero__content{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:7vw;align-items:end;max-width:1500px;margin:0 auto;height:100%}
  .eyebrow{margin:0 0 24px;font:700 12px/1 var(--mono);letter-spacing:.16em;color:var(--accent)}
  .hero h1{margin:0;max-width:920px;font-size:clamp(64px,9.1vw,148px);line-height:.88;letter-spacing:-.075em;font-weight:850}
  .hero h1 span{display:block;color:var(--accent)}
  .hero__lead{margin:38px 0 0;max-width:570px;font-size:clamp(18px,1.55vw,25px);line-height:1.55;color:#c9c8c1;letter-spacing:-.025em}
  .hero__aside{align-self:end;border-top:1px solid rgba(255,255,255,.35);padding-top:24px}
  .hero__number{display:flex;align-items:flex-start;gap:12px}
  .hero__number strong{font:800 clamp(100px,12vw,188px)/.82 var(--mono);letter-spacing:-.09em}
  .hero__number span{padding-top:12px;font:700 13px/1.4 var(--mono);color:var(--accent)}
  .hero__aside p{max-width:340px;margin:28px 0 34px;color:#aaa9a3;line-height:1.65}
  .primary-link{display:inline-flex;align-items:center;justify-content:space-between;gap:50px;min-width:260px;padding:18px 0;border-top:1px solid var(--accent);border-bottom:1px solid var(--accent);color:var(--white);font-weight:750;text-decoration:none}
  .primary-link span{color:var(--accent);transition:transform .2s ease}.primary-link:hover span{transform:translate(4px,4px)}
  .hero__meta{position:absolute;z-index:2;left:clamp(24px,5vw,72px);bottom:30px;display:flex;gap:24px;font:600 11px/1 var(--mono);letter-spacing:.09em;color:#777872}
  main{overflow:hidden}
  .summary{display:grid;grid-template-columns:1.6fr repeat(4,1fr);border-bottom:1px solid var(--line);background:var(--white)}
  .summary__intro,.summary__item{min-height:190px;padding:34px clamp(22px,3vw,46px);border-right:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between}
  .summary__intro{background:var(--accent);color:var(--ink)}
  .summary__intro p{max-width:320px;margin:0;font-weight:800;font-size:clamp(24px,2vw,34px);line-height:1.08;letter-spacing:-.045em}
  .summary small{font:700 11px/1.3 var(--mono);letter-spacing:.08em;color:var(--muted)}
  .summary__intro small{color:rgba(17,18,15,.7)}
  .summary__item strong{font:800 clamp(34px,3.8vw,64px)/1 var(--mono);letter-spacing:-.06em}
  .section{padding:clamp(90px,10vw,160px) clamp(24px,5vw,72px)}
  .section--dark{background:var(--ink);color:var(--white)}
  .section__head{display:grid;grid-template-columns:minmax(240px,.65fr) minmax(0,1.35fr);gap:6vw;align-items:end;max-width:1500px;margin:0 auto 70px}
  .section__head h2{margin:0;font-size:clamp(48px,6.2vw,100px);line-height:.92;letter-spacing:-.065em}
  .section__head p:not(.eyebrow){max-width:520px;margin:0 0 8px;font-size:18px;line-height:1.7;color:var(--muted)}
  .section--dark .section__head p:not(.eyebrow){color:#aaa9a3}
  .signal-list{max-width:1500px;margin:0 auto;border-top:1px solid #41413c}
  .signal-case{display:grid;grid-template-columns:80px minmax(220px,1.1fr) minmax(300px,1fr) 130px;gap:24px;align-items:center;min-height:170px;border-bottom:1px solid #41413c}
  .signal-case__index{font:700 13px/1 var(--mono);color:#6c6d67}
  .signal-case .eyebrow{margin-bottom:12px}.signal-case h3{margin:0;font-size:clamp(32px,3vw,52px);letter-spacing:-.05em}
  .signal-case__reasons{display:flex;flex-wrap:wrap;gap:8px}.signal-case__reasons span{padding:8px 11px;border:1px solid #575750;color:#d0cfc8;font:600 13px/1 var(--mono)}
  .signal-case a{justify-self:end;text-decoration:none;font-size:14px;color:#c1c0ba}.signal-case a span{display:block;margin-top:8px;color:var(--accent);font-size:24px}
  .workspace{background:var(--paper);padding-bottom:140px}
  .workspace__head{max-width:1500px;margin:0 auto;padding:clamp(90px,10vw,150px) clamp(24px,5vw,72px) 55px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:end}
  .workspace__head h2{margin:0;font-size:clamp(54px,7vw,112px);line-height:.85;letter-spacing:-.07em}.workspace__head p{max-width:520px;margin:0 0 4px;color:var(--muted);font-size:18px;line-height:1.65}
  .controls-wrap{position:sticky;z-index:10;top:0;background:rgba(242,239,231,.94);border-top:1px solid var(--line);border-bottom:1px solid var(--line);backdrop-filter:blur(12px)}
  .controls{max-width:1500px;margin:auto;min-height:82px;padding:14px clamp(24px,5vw,72px);display:flex;gap:14px;align-items:center}
  .filter-group{display:flex;gap:6px}.filter{min-height:44px;border:1px solid var(--line);background:transparent;padding:10px 14px;color:var(--muted);cursor:pointer}.filter[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:var(--white)}
  .search{position:relative;flex:1;min-width:180px}.search input{width:100%;border:1px solid var(--line);background:var(--white);padding:11px 42px 11px 14px;color:var(--ink);border-radius:0}.search span{position:absolute;right:14px;top:11px;color:var(--muted)}
  select{appearance:none;min-width:176px;border:1px solid var(--line);border-radius:0;background:var(--white);padding:11px 38px 11px 14px;color:var(--ink);background-image:linear-gradient(45deg,transparent 50%,var(--ink) 50%),linear-gradient(135deg,var(--ink) 50%,transparent 50%);background-position:calc(100% - 16px) 17px,calc(100% - 11px) 17px;background-size:5px 5px;background-repeat:no-repeat}
  .result-count{min-width:76px;text-align:right;font:700 12px/1 var(--mono);color:var(--muted)}
  .region-table{max-width:1500px;margin:40px auto 0;padding:0 clamp(24px,5vw,72px)}
  .region-table__header,.region-row{display:grid;grid-template-columns:minmax(220px,1.25fr) repeat(3,minmax(160px,1fr)) 28px;gap:28px;align-items:center}
  .region-table__header{padding:0 20px 12px;color:var(--muted);font:700 11px/1.3 var(--mono);letter-spacing:.06em}
  .region-row{position:relative;min-height:116px;padding:22px 20px;border-top:1px solid var(--line);transition:background .2s ease,color .2s ease;outline:none}
  .region-row:last-of-type{border-bottom:1px solid var(--line)}.region-row:hover,.region-row:focus-visible,.region-row.is-active{background:var(--ink);color:var(--white)}
  .region-identity{display:grid;grid-template-columns:auto 1fr;column-gap:12px;align-items:center}.region-identity strong{font-size:24px;letter-spacing:-.035em}.region-identity small{grid-column:2;color:var(--muted);font:600 11px/1.4 var(--mono)}
  .status{grid-row:1/3;align-self:center;padding:7px 8px;color:var(--white);font:700 10px/1 var(--mono);letter-spacing:.05em}.status--warning{background:var(--warning)}.status--good{background:var(--good)}.status--neutral{background:var(--neutral)}
  .metric strong{display:block;font:750 22px/1 var(--mono);letter-spacing:-.035em}.metric i{display:block;width:100%;height:3px;margin-top:15px;background:var(--line);overflow:hidden}.metric i b{display:block;height:100%;background:currentColor}.metric--down{color:var(--warning)}.metric--up{color:var(--good)}
  .region-row:hover .metric i,.region-row:focus-visible .metric i,.region-row.is-active .metric i{background:#41413c}.region-row:hover .region-identity small,.region-row:focus-visible .region-identity small,.region-row.is-active .region-identity small{color:#92938c}
  .region-row__arrow{font-size:22px;color:var(--accent);opacity:0;transform:translate(-5px,5px);transition:.2s}.region-row:hover .region-row__arrow,.region-row:focus-visible .region-row__arrow,.region-row.is-active .region-row__arrow{opacity:1;transform:none}
  .metric__mobile-label{display:none}.empty-state{padding:70px 20px;border-top:1px solid var(--line);text-align:center;color:var(--muted)}
  .factories{background:var(--accent);color:var(--ink);padding:clamp(90px,10vw,150px) clamp(24px,5vw,72px)}
  .factories__inner{max-width:1500px;margin:auto}.factories__head{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:end;margin-bottom:65px}.factories h2{margin:0;font-size:clamp(50px,6.5vw,102px);line-height:.88;letter-spacing:-.07em}.factories__head p{max-width:480px;margin:0;font-size:17px;line-height:1.65}
  .factory-list{border-top:2px solid var(--ink)}.factory-row{display:grid;grid-template-columns:70px minmax(260px,1.3fr) minmax(240px,1fr) 140px;gap:28px;align-items:center;min-height:112px;border-bottom:1px solid rgba(17,18,15,.35)}
  .factory-row__index{font:700 12px/1 var(--mono)}.factory-row>div{display:flex;flex-direction:column;gap:7px}.factory-row strong{font-size:22px;letter-spacing:-.035em}.factory-row small{font:700 10px/1 var(--mono);letter-spacing:.08em;opacity:.64}
  .method{background:var(--ink);color:var(--white);padding:110px clamp(24px,5vw,72px) 50px}.method__inner{max-width:1500px;margin:auto}.method__head{display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:70px}.method h2{margin:0;font-size:clamp(46px,5vw,80px);letter-spacing:-.06em}.method__head p{max-width:420px;margin:0;color:#9b9b95;line-height:1.6}
  .source-flow{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #42423d;border-bottom:1px solid #42423d}.source{min-height:270px;padding:34px 30px;border-right:1px solid #42423d}.source:last-child{border-right:0}.source span{font:700 11px/1 var(--mono);color:var(--accent)}.source h3{margin:65px 0 14px;font-size:30px}.source p{margin:0;color:#979792;line-height:1.6}.method footer{display:flex;justify-content:space-between;gap:20px;padding-top:42px;color:#777872;font:600 11px/1.5 var(--mono)}
  .reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease var(--delay,0ms),transform .7s ease var(--delay,0ms)}.reveal.is-visible{opacity:1;transform:none}
  .hero__copy>*{animation:hero-in .75s cubic-bezier(.2,.7,.2,1) both}.hero__copy>*:nth-child(2){animation-delay:.08s}.hero__copy>*:nth-child(3){animation-delay:.16s}.hero__aside{animation:hero-in .8s .22s cubic-bezier(.2,.7,.2,1) both}@keyframes hero-in{from{opacity:0;transform:translateY(35px)}}
  [hidden]{display:none!important}
  :focus-visible{outline:3px solid var(--accent);outline-offset:3px}
  @media(max-width:980px){
    .site-nav__links a:not(:last-child){display:none}.hero{min-height:820px}.hero__content{grid-template-columns:1fr;align-content:center}.hero__aside{display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:end}.hero__number strong{font-size:110px}.hero__aside p{margin:0}.primary-link{grid-column:1/-1}
    .summary{grid-template-columns:repeat(2,1fr)}.summary__intro{grid-column:1/-1}.summary__item{min-height:150px}.section__head,.workspace__head,.factories__head{grid-template-columns:1fr}.signal-case{grid-template-columns:50px 1fr 130px}.signal-case__reasons{grid-column:2/4}.region-table__header{display:none}.region-row{grid-template-columns:1fr 1fr;gap:22px}.region-row__arrow{display:none}.metric__mobile-label{display:block;margin-bottom:8px;color:var(--muted);font:700 10px/1 var(--mono)}.factory-row{grid-template-columns:48px 1fr 1fr}.factory-row>div:last-child{grid-column:2}.source-flow{grid-template-columns:1fr}.source{min-height:auto;border-right:0;border-bottom:1px solid #42423d}.source:last-child{border-bottom:0}.source h3{margin-top:34px}
  }
  @media(max-width:680px){
    .site-nav{height:70px}.site-nav__links{gap:12px}.hero{height:auto;min-height:760px;padding-top:124px}.hero::before{inset:70px 0 0}.hero__content{display:block}.hero h1{font-size:clamp(58px,18vw,86px)}.hero__lead{font-size:17px}.hero__aside{display:block;margin-top:70px}.hero__number strong{font-size:92px}.hero__aside p{margin:20px 0 28px}.hero__meta{display:none}
    .summary__intro,.summary__item{min-height:134px;padding:24px 20px}.summary__intro p{font-size:25px}.summary__item strong{font-size:34px}.section{padding:90px 20px}.section__head{margin-bottom:45px}.signal-case{grid-template-columns:34px 1fr;gap:16px;padding:26px 0}.signal-case__reasons{grid-column:2}.signal-case a{grid-column:2;justify-self:start}.workspace__head{padding:90px 20px 42px}.controls{align-items:stretch;flex-wrap:wrap;padding:12px 20px}.filter-group{width:100%;display:grid;grid-template-columns:repeat(4,1fr)}.filter{padding:10px 5px}.search{order:2;width:calc(100% - 142px)}.sort-control{order:3}.sort-control select{min-width:142px;max-width:142px}.result-count{display:none}.region-table{padding:0 20px;margin-top:24px}.region-row{padding:24px 4px;gap:22px 14px}.region-identity{grid-column:1/-1}.region-identity strong{font-size:23px}.metric strong{font-size:19px}.metric:nth-child(4){grid-column:1/-1}.factories{padding:90px 20px}.factory-row{grid-template-columns:32px 1fr;gap:15px;padding:24px 0}.factory-row>div:nth-child(n+3){grid-column:2}.method{padding:90px 20px 40px}.method__head{display:block}.method__head p{margin-top:24px}.method footer{display:block}.method footer span{display:block;margin-top:10px}
  }
  @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.reveal,.hero__copy>*,.hero__aside{animation:none;transition:none;opacity:1;transform:none}}
</style>
</head>
<body>
<a class="skip-link" href="#main">본문으로 건너뛰기</a>
<nav class="site-nav" aria-label="주요 메뉴">
  <a class="brand" href="#top"><span class="brand-mark">AX</span><span>지역산업 시그널</span></a>
  <div class="site-nav__links"><a href="#signals">주의 지역</a><a href="#regions">지역 비교</a><a href="#sources">데이터 출처</a></div>
</nav>
<header class="hero" id="top">
  <div class="hero__content">
    <div class="hero__copy">
      <p class="eyebrow">PUBLIC DATA × AGENT WORKFLOW</p>
      <h1>흩어진 산업 신호를<span>한 화면에.</span></h1>
      <p class="hero__lead">관세청·산업단지공단·KEPCO 데이터를 자동으로 결합해 지역의 변화를 먼저 읽습니다.</p>
    </div>
    <aside class="hero__aside" aria-label="데이터 범위">
      <div class="hero__number"><strong>${regions.length}</strong><span>REGIONS<br>CONNECTED</span></div>
      <p>세 기관의 서로 다른 데이터를 17개 시도 기준으로 정규화한 오프라인 스냅샷입니다.</p>
      <a class="primary-link" href="#regions">17개 지역 비교하기 <span aria-hidden="true">↘</span></a>
    </aside>
  </div>
  <div class="hero__meta"><span>SNAPSHOT ${escapeHtml(generatedAt)}</span><span>3 SOURCES</span><span>NO LIVE API REQUIRED</span></div>
</header>
<main id="main">
  <section class="summary" aria-label="전국 요약">
    <div class="summary__intro"><small>ONE SCREEN / ONE DECISION</small><p>사람이 반나절 걸릴 취합을 한 번의 빌드로.</p></div>
    <div class="summary__item"><small>주의 지역</small><strong>${warnings.length}</strong></div>
    <div class="summary__item"><small>양호 지역</small><strong>${good.length}</strong></div>
    <div class="summary__item"><small>평균 가동률</small><strong>${avgOccupancy.toFixed(1)}%</strong></div>
    <div class="summary__item"><small>전력 고객 순증감</small><strong>${fmtNum(totalPower)}</strong></div>
  </section>

  <section class="section section--dark" id="signals">
    <div class="section__head reveal">
      <div><p class="eyebrow">PRIORITY SIGNALS</p><h2>먼저 볼<br>지역</h2></div>
      <p>수출입 감소, 산업단지 가동률 90% 미만, 산업용 전력 고객 감소 중 두 가지 이상이 겹친 지역입니다.</p>
    </div>
    <div class="signal-list">
${warnings.length ? warnings.map(renderWarning).join('') : '<p>현재 복합 주의 신호가 감지된 지역이 없습니다.</p>'}
    </div>
  </section>

  <section class="workspace" id="regions">
    <div class="workspace__head reveal">
      <div><p class="eyebrow">17 REGIONS / 3 METRICS</p><h2>지역 비교</h2></div>
      <p>상태를 좁히고 지표별로 다시 정렬해 보세요. 각 막대는 전체 지역 안에서의 상대적 크기를 보여줍니다.</p>
    </div>
    <div class="controls-wrap">
      <div class="controls" aria-label="지역 필터와 정렬">
        <div class="filter-group" role="group" aria-label="상태 필터">
          <button class="filter" type="button" data-filter="all" aria-pressed="true">전체</button>
          <button class="filter" type="button" data-filter="warning" aria-pressed="false">주의 ${warnings.length}</button>
          <button class="filter" type="button" data-filter="neutral" aria-pressed="false">관찰 ${neutral.length}</button>
          <button class="filter" type="button" data-filter="good" aria-pressed="false">양호 ${good.length}</button>
        </div>
        <label class="search"><span aria-hidden="true">⌕</span><input id="region-search" type="search" placeholder="지역 검색" autocomplete="off" aria-label="지역 검색"></label>
        <label class="sort-control"><span class="visually-hidden">정렬 방식</span><select id="sort-select" aria-label="정렬 방식"><option value="status">주의 신호 우선</option><option value="name">지역명 순</option><option value="export-asc">수출입 낮은 순</option><option value="occupancy-asc">가동률 낮은 순</option><option value="power-asc">전력 증감 낮은 순</option></select></label>
        <output class="result-count" id="result-count" aria-live="polite">${regions.length} / ${regions.length}</output>
      </div>
    </div>
    <div class="region-table">
      <div class="region-table__header" aria-hidden="true"><span>지역 / 상태</span><span title="관세청 시도별 수출입실적 — 전년 동기 대비">수출입 증감 ↗</span><span title="산업단지공단 가동업체 ÷ 입주업체 — 2025년 4분기">산단 가동률 ↗</span><span title="KEPCO 산업용 전기 신설+증설−해지">전력 고객 순증감 ↗</span><span></span></div>
      <div id="region-list">
${regions.map((region) => renderRegion(region, maxExport, maxPower)).join('')}
      </div>
      <p class="empty-state" id="empty-state" hidden>조건에 맞는 지역이 없습니다.</p>
    </div>
  </section>

  <section class="factories" aria-labelledby="factory-title">
    <div class="factories__inner">
      <div class="factories__head reveal"><h2 id="factory-title">공장 데이터,<br>실제 한 줄까지.</h2><p>Factoryon에서 빌드 시점에 조회한 등록 공장 샘플입니다. 네 번째 데이터 축을 붙이는 확장 가능성을 보여줍니다.</p></div>
      <div class="factory-list">${(data.factorySample ?? []).map(renderFactory).join('')}</div>
    </div>
  </section>

  <section class="method" id="sources">
    <div class="method__inner">
      <div class="method__head reveal"><h2>세 기관의 언어를<br>하나의 기준으로.</h2><p>원본 형식이 달라도 지역 코드를 중심으로 정규화·결합하고, 판정 규칙까지 같은 빌드 안에서 실행합니다.</p></div>
      <div class="source-flow">
        <article class="source reveal"><span>01 / CUSTOMS</span><h3>관세청</h3><p>시도별 수출입실적을 완결 연도 기준 전년 동기와 비교합니다.</p></article>
        <article class="source reveal" style="--delay:90ms"><span>02 / INDUSTRIAL PARK</span><h3>산업단지공단</h3><p>가동업체를 입주업체로 나눠 2025년 4분기 가동률을 계산합니다.</p></article>
        <article class="source reveal" style="--delay:180ms"><span>03 / ELECTRIC POWER</span><h3>KEPCO</h3><p>산업용 전기 신설·증설에서 해지를 빼 지역별 순증감을 구합니다.</p></article>
      </div>
      <footer><span>GENERATED ${escapeHtml(generatedAt)} · STATIC / OFFLINE SAFE</span><span>산업부 공공 AX 실습 강의 · 지역산업 현황판</span></footer>
    </div>
  </section>
</main>
<script id="dashboard-data" type="application/json">${safeDataJson}</script>
<script>
(function () {
  var list = document.getElementById('region-list');
  var rows = Array.prototype.slice.call(list.querySelectorAll('.region-row'));
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var search = document.getElementById('region-search');
  var sort = document.getElementById('sort-select');
  var count = document.getElementById('result-count');
  var empty = document.getElementById('empty-state');
  var currentFilter = 'all';
  var priority = { warning: 0, neutral: 1, good: 2 };

  function number(row, key) {
    if (row.dataset[key] === '') return Number.POSITIVE_INFINITY;
    var value = Number(row.dataset[key]);
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
  }

  function applyView() {
    var query = search.value.trim().toLocaleLowerCase('ko-KR');
    var visible = rows.filter(function (row) {
      return (currentFilter === 'all' || row.dataset.status === currentFilter) && row.dataset.name.toLocaleLowerCase('ko-KR').includes(query);
    });
    var mode = sort.value;
    visible.sort(function (a, b) {
      if (mode === 'name') return a.dataset.name.localeCompare(b.dataset.name, 'ko-KR');
      if (mode === 'export-asc') return number(a, 'export') - number(b, 'export');
      if (mode === 'occupancy-asc') return number(a, 'occupancy') - number(b, 'occupancy');
      if (mode === 'power-asc') return number(a, 'power') - number(b, 'power');
      return priority[a.dataset.status] - priority[b.dataset.status];
    });
    rows.forEach(function (row) { row.hidden = true; });
    visible.forEach(function (row) { row.hidden = false; list.appendChild(row); });
    count.value = visible.length + ' / ' + rows.length;
    count.textContent = count.value;
    empty.hidden = visible.length !== 0;
  }

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      currentFilter = button.dataset.filter;
      filters.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      applyView();
    });
  });
  search.addEventListener('input', applyView);
  sort.addEventListener('change', applyView);
  rows.forEach(function (row) {
    row.addEventListener('click', function () {
      rows.forEach(function (item) { if (item !== row) { item.classList.remove('is-active'); item.setAttribute('aria-pressed', 'false'); } });
      row.classList.toggle('is-active');
      row.setAttribute('aria-pressed', String(row.classList.contains('is-active')));
    });
    row.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); row.click(); }
    });
  });

  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: .14 });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }
  applyView();
})();
</script>
</body>
</html>`;
}
