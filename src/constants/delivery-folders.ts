import { ImagePlus, Globe, Sofa, Sunrise } from 'lucide-react';

export type DeliveryFolderType = 'full_resolution' | 'web_version' | 'virtual_staging' | 'blue_hour';

export const DELIVERY_FOLDERS = {
  full_resolution: {
    label: 'Volle Auflösung',
    description: 'Originalbilder in höchster Qualität',
    icon: ImagePlus,
    color: 'text-primary',
  },
  web_version: {
    label: 'Web-Version',
    description: 'Optimiert für Web und Social Media',
    icon: Globe,
    color: 'text-blue-500',
  },
  virtual_staging: {
    label: 'Virtuelles Staging',
    description: 'Möblierte Räume',
    icon: Sofa,
    color: 'text-purple-500',
  },
  blue_hour: {
    label: 'Virtuelle Blaue Stunde',
    description: 'Dämmerungsaufnahmen',
    icon: Sunrise,
    color: 'text-orange-500',
  },
} as const;
