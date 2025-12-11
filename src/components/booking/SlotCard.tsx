import React from 'react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock, MapPin, Car, Star, Wallet, RefreshCw, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotCardProps {
  type: 'recommended' | 'cheapest' | 'flexible' | 'weekend';
  label: string;
  description: string;
  date: string;
  slots: {
    property_index: number;
    address: string;
    start: string;
    end: string;
    drive_time_minutes?: number;
  }[];
  totalDriveTime?: number;
  isSelected: boolean;
  onSelect: () => void;
}

const typeIcons = {
  recommended: Star,
  cheapest: Wallet,
  flexible: RefreshCw,
  weekend: Calendar,
};

const typeColors = {
  recommended: 'text-yellow-500',
  cheapest: 'text-green-500',
  flexible: 'text-blue-500',
  weekend: 'text-purple-500',
};

export function SlotCard({
  type,
  label,
  description,
  date,
  slots,
  totalDriveTime,
  isSelected,
  onSelect,
}: SlotCardProps) {
  const Icon = typeIcons[type];
  const dateObj = parseISO(date);

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50',
        isSelected ? 'border-primary bg-primary/5' : 'border-border',
        type === 'weekend' && 'bg-yellow-50/50 dark:bg-yellow-950/10'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', typeColors[type])} />
          <span className="font-semibold">{label}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(dateObj, 'EEE, dd.MM.', { locale: de })}
        </div>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      )}

      <div className="space-y-2">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="flex items-center gap-3 text-sm"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{slot.start} - {slot.end}</span>
            </div>
            {slot.address && (
              <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{slot.address}</span>
              </div>
            )}
            {slot.drive_time_minutes && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Car className="h-3 w-3" />
                <span>{slot.drive_time_minutes} Min.</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalDriveTime && (
        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
          <Car className="h-3.5 w-3.5" />
          <span>Gesamtfahrzeit: ca. {totalDriveTime} Minuten</span>
        </div>
      )}

      {type === 'weekend' && (
        <div className="mt-3 pt-3 border-t text-xs text-yellow-600 dark:text-yellow-400 font-medium">
          ⚠️ Wochenendbuchungen erfordern Bestätigung. Zuschlag: 25-50%
        </div>
      )}
    </button>
  );
}
