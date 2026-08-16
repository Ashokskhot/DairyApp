import { COW_RATE_CHART } from '../data/rateCharts/cowRateChart';

/**
 * Normalize a numeric value to one decimal place.
 */
function normalizeRateValue(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}

/**
 * Get the cow milk rate for the given FAT and SNF.
 *
 * @param fat Milk FAT percentage
 * @param snf Milk SNF percentage
 * @returns Rate per litre, or null when no matching rate exists
 */
export function getCowRate(
  fat: number,
  snf: number
): number | null {
  const normalizedFat = normalizeRateValue(fat);
  const normalizedSnf = normalizeRateValue(snf);

  return COW_RATE_CHART[normalizedFat]?.[normalizedSnf] ?? null;
}

/**
 * Calculate total milk amount.
 *
 * @param quantity Milk quantity in litres
 * @param fat Milk FAT percentage
 * @param snf Milk SNF percentage
 * @returns Total amount, or null when no rate exists
 */
export function calculateMilkAmount(
  quantity: number,
  fat: number,
  snf: number
): number | null {
  const rate = getCowRate(fat, snf);

  if (rate === null) {
    return null;
  }

  return quantity * rate;
}