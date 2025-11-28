export const GALLERY_STATUSES = {
  Planning: {
    label: 'Shooting in Planung',
    shortLabel: 'Planung',
    color: 'bg-gray-100 text-gray-800',
    icon: 'Calendar',
  },
  Open: {
    label: 'Vorschaugalerie offen',
    shortLabel: 'Offen',
    color: 'bg-blue-100 text-blue-800',
    icon: 'Eye',
  },
  Closed: {
    label: 'Vorschaugalerie geschlossen',
    shortLabel: 'Geschlossen',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'Lock',
  },
  Processing: {
    label: 'In Bearbeitung',
    shortLabel: 'Bearbeitung',
    color: 'bg-orange-100 text-orange-800',
    icon: 'Settings',
  },
  Delivered: {
    label: 'Geliefert',
    shortLabel: 'Geliefert',
    color: 'bg-green-100 text-green-800',
    icon: 'CheckCircle',
  },
} as const;

export type GalleryStatus = keyof typeof GALLERY_STATUSES;

export const GALLERY_STATUS_ORDER: GalleryStatus[] = [
  'Planning',
  'Open',
  'Closed',
  'Processing',
  'Delivered',
];
