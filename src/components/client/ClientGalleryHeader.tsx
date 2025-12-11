import { Button } from '@/components/ui/button';
import { LogOut, HelpCircle } from 'lucide-react';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface ClientGalleryHeaderProps {
  galleryName: string;
  onSignOut: () => void;
  onShowHelp?: () => void;
  children?: React.ReactNode;
}

export function ClientGalleryHeader({ galleryName, onSignOut, onShowHelp, children }: ClientGalleryHeaderProps) {
  const { t } = useAnsprache();
  
  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{galleryName}</h1>
          <p className="text-sm text-muted-foreground">{t('Wähle deine Lieblingsfotos', 'Wählen Sie Ihre Lieblingsfotos')}</p>
        </div>
        <div className="flex items-center gap-2">
          {children}
          {onShowHelp && (
            <Button variant="ghost" size="sm" onClick={onShowHelp}>
              <HelpCircle className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Hilfe</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Abmelden</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
