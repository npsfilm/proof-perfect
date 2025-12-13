// Base address for travel cost calculation
export const BASE_ADDRESS = "Klinkerberg 9, 86152 Augsburg";
export const BASE_COORDINATES: [number, number] = [10.8978, 48.3705]; // Augsburg

/**
 * Calculate travel cost based on distance
 * Formula: roundTrip * rate, rounded to nearest 10
 * Rate: 0.65€/km for <200km roundtrip, 0.85€/km for ≥200km
 */
export function calculateTravelCost(distanceKm: number): number {
  const roundTrip = distanceKm * 2;
  const rate = roundTrip < 200 ? 0.65 : 0.85;
  const rawCost = roundTrip * rate;
  
  // Round to nearest 10
  const rounded = Math.round(rawCost / 10) * 10;
  
  // Free if less than 20€
  return rounded < 20 ? 0 : rounded;
}

/**
 * Format travel cost for display
 */
export function formatTravelCost(costCents: number): string {
  if (costCents === 0) {
    return "Kostenfrei";
  }
  return `${(costCents / 100).toFixed(0)} €`;
}

/**
 * Calculate virtual staging price based on quantity
 * Volume discount: 1=39€, 3=99€ (33€/ea), 5=150€ (30€/ea), 6+=29€/ea
 */
export function calculateStagingPrice(count: number): number {
  if (count === 1) return 3900; // 39€
  if (count <= 3) return count * 3300; // 33€ each
  if (count <= 5) return count * 3000; // 30€ each
  return count * 2900; // 29€ each for 6+
}

/**
 * Calculate total price breakdown
 */
export interface PriceBreakdown {
  packagePriceCents: number;
  travelCostCents: number;
  upgradesCents: number;
  stagingCents: number;
  netPriceCents: number;
  vatCents: number;
  grossPriceCents: number;
}

export function calculateTotalPrice(
  packagePriceCents: number,
  travelCostEuros: number,
  upgradesPriceCents: number,
  stagingCount: number
): PriceBreakdown {
  const travelCostCents = travelCostEuros * 100;
  const stagingCents = calculateStagingPrice(stagingCount);
  
  const netPriceCents = packagePriceCents + travelCostCents + upgradesPriceCents + stagingCents;
  const vatCents = Math.round(netPriceCents * 0.19);
  const grossPriceCents = netPriceCents + vatCents;
  
  return {
    packagePriceCents,
    travelCostCents,
    upgradesCents: upgradesPriceCents,
    stagingCents,
    netPriceCents,
    vatCents,
    grossPriceCents,
  };
}

/**
 * Format cents to Euro display
 */
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format cents to Euro display with decimals
 */
export function formatPriceWithDecimals(cents: number): string {
  return (cents / 100).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
