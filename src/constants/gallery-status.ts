export const GALLERY_STATUSES = {
  Planning: {
    label: 'Shooting in Planung',
    shortLabel: 'Planung',
    color: 'bg-status-planning text-status-planning-foreground',
    icon: 'Calendar',
  },
  Open: {
    label: 'Vorschaugalerie offen',
    shortLabel: 'Offen',
    color: 'bg-status-open text-status-open-foreground',
    icon: 'Eye',
  },
  Closed: {
    label: 'Vorschaugalerie geschlossen',
    shortLabel: 'Geschlossen',
    color: 'bg-status-closed text-status-closed-foreground',
    icon: 'Lock',
  },
  Processing: {
    label: 'In Bearbeitung',
    shortLabel: 'Bearbeitung',
    color: 'bg-status-processing text-status-processing-foreground',
    icon: 'Settings',
  },
  Delivered: {
    label: 'Geliefert',
    shortLabel: 'Geliefert',
    color: 'bg-status-delivered text-status-delivered-foreground',
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
