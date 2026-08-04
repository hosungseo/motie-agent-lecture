// 출처: 관세청조회코드_v1.2.xlsx > 시도코드 시트 (17개 시도, 2026-08 기준)
export const REGIONS = [
  { code: '11', fullName: '서울특별시', shortName: '서울' },
  { code: '26', fullName: '부산광역시', shortName: '부산' },
  { code: '27', fullName: '대구광역시', shortName: '대구' },
  { code: '28', fullName: '인천광역시', shortName: '인천' },
  { code: '29', fullName: '광주광역시', shortName: '광주' },
  { code: '30', fullName: '대전광역시', shortName: '대전' },
  { code: '31', fullName: '울산광역시', shortName: '울산' },
  { code: '36', fullName: '세종특별자치시', shortName: '세종' },
  { code: '41', fullName: '경기도', shortName: '경기' },
  { code: '43', fullName: '충청북도', shortName: '충북' },
  { code: '44', fullName: '충청남도', shortName: '충남' },
  { code: '46', fullName: '전라남도', shortName: '전남' },
  { code: '47', fullName: '경상북도', shortName: '경북' },
  { code: '48', fullName: '경상남도', shortName: '경남' },
  { code: '50', fullName: '제주특별자치도', shortName: '제주' },
  { code: '51', fullName: '강원특별자치도', shortName: '강원' },
  { code: '52', fullName: '전북특별자치도', shortName: '전북' },
];

const fullNameMap = new Map(REGIONS.map((r) => [r.fullName, r.code]));
const shortNameMap = new Map(REGIONS.map((r) => [r.shortName, r.code]));

export function codeByFullName(name) {
  return fullNameMap.get(name);
}

export function codeByShortName(name) {
  return shortNameMap.get(name);
}
