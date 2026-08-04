import { REGIONS } from './regions.mjs';

function indexByFullName(records) {
  return new Map(records.map((r) => [r.sidoNm, r]));
}

function indexByShortName(records) {
  return new Map(records.map((r) => [r.shortName, r]));
}

export function joinRegions({ customsCurrent, customsPrev, parkRows, powerByCode }) {
  const currentByName = indexByFullName(customsCurrent);
  const prevByName = indexByFullName(customsPrev);
  const parkByName = indexByShortName(parkRows);

  return REGIONS.map((region) => {
    const current = currentByName.get(region.fullName);
    const prev = prevByName.get(region.fullName);
    const park = parkByName.get(region.shortName);
    const netPowerChange = Object.prototype.hasOwnProperty.call(powerByCode, region.code)
      ? powerByCode[region.code]
      : null;

    const exportChangePct =
      current && prev && prev.expUsdAmt
        ? ((current.expUsdAmt - prev.expUsdAmt) / prev.expUsdAmt) * 100
        : null;

    return {
      code: region.code,
      fullName: region.fullName,
      shortName: region.shortName,
      exportChangePct,
      occupancyRate: park && park.tenantCount ? (park.operatingCount / park.tenantCount) * 100 : null,
      saleRate: park ? park.saleRate : null,
      netPowerChange,
    };
  });
}
