import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderOpen, Home, Settings } from 'lucide-react';

interface ClientNavTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ClientNavTabs({ activeTab, onTabChange }: ClientNavTabsProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 lg:px-6">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="galleries" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Galerien
            </TabsTrigger>
            <TabsTrigger 
              value="staging" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
            >
              <Home className="h-4 w-4 mr-2" />
              Staging anfordern
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
            >
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
