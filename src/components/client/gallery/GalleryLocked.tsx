import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GalleryLockedProps } from './types';

export function GalleryLocked({ onNavigate }: GalleryLockedProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Diese Galerie wurde finalisiert und ist nun gesperrt. Sie können keine Änderungen mehr an Ihrer Auswahl vornehmen.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={onNavigate}>Zum Dashboard</Button>
      </div>
    </div>
  );
}
