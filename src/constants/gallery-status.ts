export const GALLERY_STATUSES = {
  Draft: {
    label: 'Entwurf',
    color: 'bg-gray-100 text-gray-800',
  },
  Sent: {
    label: 'Gesendet',
    color: 'bg-blue-100 text-blue-800',
  },
  Reviewed: {
    label: 'Überprüft',
    color: 'bg-yellow-100 text-yellow-800',
  },
  Delivered: {
    label: 'Geliefert',
    color: 'bg-green-100 text-green-800',
  },
} as const;

export type GalleryStatus = keyof typeof GALLERY_STATUSES;
