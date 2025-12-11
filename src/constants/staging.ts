import { Bed, Sofa, UtensilsCrossed, Bath, Briefcase, Lamp } from 'lucide-react';

export const ROOM_TYPES = [
  { id: 'bedroom', label: 'Schlafzimmer', icon: Bed },
  { id: 'living', label: 'Wohnzimmer', icon: Sofa },
  { id: 'kitchen', label: 'Küche', icon: UtensilsCrossed },
  { id: 'bathroom', label: 'Bad', icon: Bath },
  { id: 'office', label: 'Büro', icon: Briefcase },
  { id: 'dining', label: 'Esszimmer', icon: Lamp },
] as const;

export type RoomType = typeof ROOM_TYPES[number]['id'];

export const STAGING_STYLE_OPTIONS = [
  { id: 'standard', label: 'Standard', color: 'bg-stone-100' },
  { id: 'modern', label: 'Modern', color: 'bg-slate-200' },
  { id: 'scandinavian', label: 'Skandinavisch', color: 'bg-amber-50' },
  { id: 'industrial', label: 'Industrial', color: 'bg-zinc-300' },
  { id: 'midcentury', label: 'Midcentury', color: 'bg-orange-100' },
  { id: 'luxury', label: 'Luxus', color: 'bg-amber-200' },
  { id: 'coastal', label: 'Coastal', color: 'bg-sky-100' },
  { id: 'farmhouse', label: 'Farmhouse', color: 'bg-lime-50' },
] as const;

export type StagingStyleOption = typeof STAGING_STYLE_OPTIONS[number]['id'];

// STAGING_STYLES removed - now database-driven via useStagingStyles hook
