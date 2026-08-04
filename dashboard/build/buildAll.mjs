// dashboard/build/buildAll.mjs
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchCustoms } from './fetchCustoms.mjs';
import { fetchPower } from './fetchPower.mjs';
import { fetchFactoryonSample } from './fetchFactoryonSample.mjs';
import { parseIndustrialParkXlsx } from './lib/parseIndustrialPark.mjs';
import { joinRegions } from './lib/join.mjs';
import { classifyRegion } from './lib/warnings.mjs';
import { renderHtml } from './lib/renderHtml.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const XLSX_PATH = path.join(ROOT, 'data/raw/한국산업단지공단_전국산업단지현황통계_20251231.xlsx');

async function main() {
  process.loadEnvFile(path.join(ROOT, '.env.local'));
  const dataGoKrKey = process.env.DATA_GO_KR_SERVICE_KEY;
  const kepcoKey = process.env.KEPCO_API_KEY;

  console.log('fetching customs data...');
  const { current: customsCurrent, prev: customsPrev } = await fetchCustoms(dataGoKrKey);

  console.log('fetching KEPCO power data for 17 regions...');
  const powerByCode = await fetchPower(kepcoKey);

  console.log('parsing industrial park xlsx...');
  const parkRows = parseIndustrialParkXlsx(XLSX_PATH);

  console.log('fetching Factoryon bonus sample...');
  const factorySample = await fetchFactoryonSample(dataGoKrKey);

  const joined = joinRegions({ customsCurrent, customsPrev, parkRows, powerByCode });
  const regions = joined.map((region) => ({ ...region, status: classifyRegion(region) }));

  const data = { regions, factorySample, generatedAt: new Date().toISOString().slice(0, 10) };

  writeFileSync(path.join(ROOT, 'data/data.json'), JSON.stringify(data, null, 2));
  writeFileSync(path.join(ROOT, 'index.html'), renderHtml(data));

  const warningCount = regions.filter((r) => r.status === 'warning').length;
  const goodCount = regions.filter((r) => r.status === 'good').length;
  console.log(`done. ${regions.length} regions, ${warningCount} warning, ${goodCount} good.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
