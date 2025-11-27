import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface ClientGalleryHeaderProps {
  galleryName: string;
  onSignOut: () => void;
}

export function ClientGalleryHeader({ galleryName, onSignOut }: ClientGalleryHeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{galleryName}</h1>
          <p className="text-sm text-muted-foreground">Wählen Sie Ihre Lieblingsfotos</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Abmelden
        </Button>
      </div>
    </header>
  );
}
