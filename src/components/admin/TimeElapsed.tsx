import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TimeElapsedProps {
  startTime: string | null;
  label?: string;
  variant?: 'default' | 'secondary' | 'outline';
}

export function TimeElapsed({ startTime, label = 'Zeit seit Freigabe', variant = 'outline' }: TimeElapsedProps) {
  const [elapsed, setElapsed] = useState<string>('');

  useEffect(() => {
    if (!startTime) return;

    const calculateElapsed = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    };

    // Initial calculation
    setElapsed(calculateElapsed());

    // Update every second
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  return (
    <Badge variant={variant} className="flex items-center gap-2 animate-pulse">
      <Clock className="h-3 w-3" />
      <span className="font-mono tabular-nums">{elapsed}</span>
      {label && <span className="text-xs opacity-75">· {label}</span>}
    </Badge>
  );
}
