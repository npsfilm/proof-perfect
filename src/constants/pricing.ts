// ImmoOnPoint Pricing Constants

export const PACKAGES = [
  { id: 'basic', name: 'Basis', photos: 10, price: 149 },
  { id: 'standard', name: 'Standard', photos: 15, price: 199 },
  { id: 'premium', name: 'Premium', photos: 20, price: 249 },
  { id: 'deluxe', name: 'Deluxe', photos: 30, price: 349 },
] as const;

export const ADDONS = [
  { id: 'drone', name: 'Drohnenaufnahmen', price: 79, description: '5 Luftaufnahmen inklusive' },
  { id: 'blue_hour', name: 'Virtuelle Blaue Stunde', price: 29, description: 'Pro Bild', perPhoto: true },
  { id: 'staging', name: 'Virtuelles Staging', price: 89, description: 'Pro Raum', perPhoto: true },
  { id: 'express', name: 'Express-Lieferung (24h)', price: 49, description: 'Lieferung innerhalb 24 Stunden' },
  { id: 'floor_plan', name: 'Grundriss', price: 59, description: '2D Grundriss-Erstellung' },
] as const;

export const STAGING_DISCOUNT = {
  threshold: 5,
  freeItems: 1,
  description: '5 kaufen, 1 gratis',
} as const;

export type PackageId = typeof PACKAGES[number]['id'];
export type AddonId = typeof ADDONS[number]['id'];
