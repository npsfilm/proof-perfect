import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date;
}

export function SaveStatusIndicator({ isSaving, lastSaved }: SaveStatusIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!isSaving && lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  if (!isSaving && !showSaved) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
        isSaving && 'bg-blue-500/10 text-blue-600',
        showSaved && 'bg-green-500/10 text-green-600'
      )}
    >
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Wird gespeichert...</span>
        </>
      ) : (
        <>
          <Check className="h-3 w-3" />
          <span>Gespeichert</span>
        </>
      )}
    </div>
  );
}
