import { Button } from '@/components/ui/button';

export type PhotoFilter = 'all' | 'selected' | 'unselected';

interface GalleryFilterBarProps {
  activeFilter: PhotoFilter;
  onFilterChange: (filter: PhotoFilter) => void;
  counts: {
    all: number;
    selected: number;
    unselected: number;
  };
}

export function GalleryFilterBar({ activeFilter, onFilterChange, counts }: GalleryFilterBarProps) {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      <Button
        variant={activeFilter === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
        className="whitespace-nowrap"
      >
        Alle ({counts.all})
      </Button>
      <Button
        variant={activeFilter === 'selected' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('selected')}
        className="whitespace-nowrap"
      >
        Ausgewählt ({counts.selected})
      </Button>
      <Button
        variant={activeFilter === 'unselected' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('unselected')}
        className="whitespace-nowrap"
      >
        Nicht ausgewählt ({counts.unselected})
      </Button>
    </div>
  );
}
