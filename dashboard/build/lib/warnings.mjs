const OCCUPANCY_THRESHOLD = 90;

export function classifyRegion(region) {
  const signals = [
    region.exportChangePct !== null && region.exportChangePct < 0,
    region.occupancyRate !== null && region.occupancyRate < OCCUPANCY_THRESHOLD,
    region.netPowerChange !== null && region.netPowerChange < 0,
  ];
  const negativeCount = signals.filter(Boolean).length;

  const positiveSignals = [
    region.exportChangePct !== null && region.exportChangePct >= 0,
    region.occupancyRate !== null && region.occupancyRate >= OCCUPANCY_THRESHOLD,
    region.netPowerChange !== null && region.netPowerChange >= 0,
  ];
  const positiveCount = positiveSignals.filter(Boolean).length;

  if (negativeCount >= 2) return 'warning';
  if (positiveCount === 3) return 'good';
  return 'neutral';
}
