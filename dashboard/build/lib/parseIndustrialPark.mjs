import XLSX from 'xlsx';

// "시도별" 시트 열 순서(0-indexed):
// 0 구분 | 1 단지수 | 2 지정면적 | 3 관리면적 | 4 전체면적 | 5 분양대상
// | 6 분양 | 7 미분양 | 8 분양률 | 9 입주업체 | 10 가동업체
export function parseIndustrialParkXlsx(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['시도별'];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  return rows
    .filter((row) => typeof row[0] === 'string' && row[0].endsWith('소계'))
    .map((row) => {
      const tenantCount = Number(row[9]);
      const operatingCount = Number(row[10]);
      return {
        shortName: row[0].replace('소계', ''),
        parkCount: Number(row[1]),
        saleRate: Number(row[8]),
        tenantCount,
        operatingCount,
        occupancyRate: (operatingCount / tenantCount) * 100,
      };
    });
}
