import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, FolderOpen, Home, Settings } from 'lucide-react';
import { Client } from '@/types/database';
import { useBranding } from '@/contexts/BrandingContext';

interface ClientHeaderProps {
  client: Client | null;
  onSignOut: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function ClientHeader({ client, onSignOut, activeTab, onTabChange }: ClientHeaderProps) {
  const { siteName } = useBranding();
  
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
    <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-foreground">{siteName}</h1>
            {client && (
              <p className="text-sm text-muted-foreground mt-1">
                {getGreeting()}, {getClientName()}
              </p>
            )}
          </div>
          
          {activeTab && onTabChange && (
            <div className="flex-1 flex justify-center">
              <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className="h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="galleries" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Galerien</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="staging" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Staging anfordern</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Einstellungen</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSignOut}
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
