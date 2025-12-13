import { Camera, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type ShootingType = 'Foto' | 'Drohne' | 'Kombi' | 'Staging';

interface ShootingTypeSelectorProps {
  selected: ShootingType | null;
  onSelect: (type: ShootingType) => void;
}

const shootingTypes: Array<{
  type: ShootingType;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}> = [
  {
    type: 'Foto',
    icon: <Camera className="h-8 w-8" />,
    title: 'Immobilienshooting',
    description: 'Profi-Innenaufnahmen, die Interessenten begeistern',
  },
  {
    type: 'Drohne',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M3 9l3 3l-3 3" />
        <path d="M21 9l-3 3l3 3" />
        <path d="M12 3l0 3" />
        <path d="M12 18l0 3" />
      </svg>
    ),
    title: 'Drohnenshooting',
    description: 'Luftaufnahmen für den perfekten Überblick',
  },
  {
    type: 'Kombi',
    icon: <Layers className="h-8 w-8" />,
    title: 'Kombi-Paket',
    description: 'Das Beste aus beiden Welten – innen & außen',
    badge: 'BELIEBT',
  },
  {
    type: 'Staging',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14" />
        <path d="M5 12v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" />
        <path d="M7 12V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
      </svg>
    ),
    title: 'Virtuelles Staging',
    description: 'Leere Räume virtuell einrichten lassen',
  },
];

export function ShootingTypeSelector({ selected, onSelect }: ShootingTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {shootingTypes.map((item) => (
        <button
          key={item.type}
          onClick={() => onSelect(item.type)}
          className={cn(
            'relative p-6 rounded-lg border-2 text-left transition-all',
            'hover:border-primary/50 hover:shadow-md',
            selected === item.type
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border bg-card'
          )}
        >
          {item.badge && (
            <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
              {item.badge}
            </Badge>
          )}

          <div className="flex items-start gap-4">
            <div className={cn(
              'p-3 rounded-lg',
              selected === item.type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {item.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
