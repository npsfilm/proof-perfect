import { Clock, User, Building, Star } from 'lucide-react';

interface TrustElementsProps {
  variant?: 'compact' | 'full';
}

const trustItems = [
  { icon: Clock, text: '48h-Liefergarantie' },
  { icon: User, text: 'Persönlicher Ansprechpartner' },
  { icon: Building, text: '1.500+ Objekte' },
  { icon: Star, text: '5,0 ★ Google' },
];

export function TrustElements({ variant = 'compact' }: TrustElementsProps) {
  if (variant === 'full') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trustItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <item.icon className="h-4 w-4 text-primary" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
      {trustItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <item.icon className="h-3 w-3 text-primary" />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}
