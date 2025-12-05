// Service types for booking
export const SERVICES = [
  { 
    id: 'photo', 
    name: 'Immobilienshooting', 
    description: 'Professionelle Innen- und Außenaufnahmen',
    icon: 'Camera', 
    baseDuration: 60 
  },
  { 
    id: 'drone', 
    name: 'Drohnenshooting', 
    description: 'Luftaufnahmen & Vogelperspektive',
    icon: 'Plane', 
    baseDuration: 45 
  },
  { 
    id: 'combo', 
    name: 'Kombi-Paket', 
    description: 'Foto + Drohne zum Vorteilspreis',
    icon: 'Package', 
    baseDuration: 90, 
    badge: 'BELIEBT' 
  },
] as const;

// Packages per service type
export const PACKAGES = {
  photo: [
    { id: 'home-s', name: 'Home S', photos: 10, duration: 45, price: 149 },
    { id: 'home-m', name: 'Home M', photos: 15, duration: 60, price: 199 },
    { id: 'home-l', name: 'Home L', photos: 20, duration: 75, price: 249 },
    { id: 'home-xl', name: 'Home XL', photos: 30, duration: 90, price: 349 },
  ],
  drone: [
    { id: 'drone-s', name: 'Drohne S', photos: 5, duration: 30, price: 99 },
    { id: 'drone-m', name: 'Drohne M', photos: 10, duration: 45, price: 149 },
    { id: 'drone-l', name: 'Drohne L', photos: 15, duration: 60, price: 199 },
  ],
  combo: [
    { id: 'combo-m', name: 'Kombi M', photos: 20, duration: 75, price: 299 },
    { id: 'combo-l', name: 'Kombi L', photos: 30, duration: 100, price: 399 },
    { id: 'combo-xl', name: 'Kombi XL', photos: 40, duration: 120, price: 499 },
  ],
} as const;

// Upgrade options
export const UPGRADES = [
  { id: 'video', name: 'Video-Tour', description: '60-90 Sek. Immobilienvideo', duration: 30, price: 99 },
  { id: '360', name: '360° Rundgang', description: 'Interaktive Matterport-Tour', duration: 20, price: 79 },
  { id: 'twilight', name: 'Dämmerungsaufnahmen', description: 'Blaue Stunde Aufnahmen', duration: 30, price: 69 },
] as const;

// Booking steps
export const BOOKING_STEPS = [
  { id: 1, name: 'Anzahl', description: 'Wie viele Objekte?' },
  { id: 2, name: 'Adresse', description: 'Wo ist die Immobilie?' },
  { id: 3, name: 'Service', description: 'Welche Art Shooting?' },
  { id: 4, name: 'Paket', description: 'Paket & Extras wählen' },
  { id: 5, name: 'Termin', description: 'Verfügbare Zeit wählen' },
  { id: 6, name: 'Kontakt', description: 'Ihre Daten' },
] as const;

// Home base for travel time calculation
export const HOME_BASE = {
  address: 'Augsburg, Germany',
  coordinates: { lat: 48.3705, lng: 10.8978 }
};

// Business hours for scheduling
export const BUSINESS_HOURS = {
  start: 8, // 08:00
  end: 18,  // 18:00
  slotInterval: 30, // minutes
};

export type ServiceType = typeof SERVICES[number]['id'];
export type PackageOption = typeof PACKAGES[keyof typeof PACKAGES][number];
export type UpgradeOption = typeof UPGRADES[number];
