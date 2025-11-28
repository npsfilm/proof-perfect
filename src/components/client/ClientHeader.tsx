import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { Client } from '@/types/database';

interface ClientHeaderProps {
  client: Client | null;
  onSignOut: () => void;
  onSettingsClick?: () => void;
}

export function ClientHeader({ client, onSignOut, onSettingsClick }: ClientHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  const getClientName = () => {
    if (!client) return '';
    
    const title = client.anrede || '';
    const name = client.ansprache === 'Du' 
      ? client.vorname 
      : `${title} ${client.nachname}`;
    
    return name;
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-neu-flat">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">immoonpoint</h1>
            {client && (
              <p className="text-sm text-muted-foreground mt-1">
                {getGreeting()}, {getClientName()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSettingsClick && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSettingsClick}
                className="rounded-full"
              >
                <Settings className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Einstellungen</span>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSignOut}
              className="rounded-full"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Abmelden</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
