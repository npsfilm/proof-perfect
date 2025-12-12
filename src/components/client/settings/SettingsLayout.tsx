import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, Users, FileText, Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useCompanyRole } from '@/hooks/useCompanyRole';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { PersonalTab } from './PersonalTab';
import { CompanyTab } from './CompanyTab';
import { TeamTab } from './TeamTab';
import { InvoicesTab } from './InvoicesTab';
import { PermissionsTab } from './PermissionsTab';
import { cn } from '@/lib/utils';

interface SettingsLayoutProps {
  userEmail: string;
}

interface TabConfig {
  value: string;
  label: string;
  icon: React.ElementType;
  show: boolean;
}

export function SettingsLayout({ userEmail }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState<string | null>('personal');
  const { user } = useAuth();
  const { data: membership, isLoading } = useCompanyRole(user?.id);
  const isMobile = useIsMobile();
  
  const isOwnerOrAdmin = membership?.role === 'owner' || membership?.role === 'company_admin';
  const isOwner = membership?.role === 'owner';
  const canViewInvoices = isOwnerOrAdmin || membership?.can_view_invoices;
  const companyId = membership?.company_id;
  const companyName = membership?.companies?.name;

  // Build available tabs
  const tabs: TabConfig[] = [
    { value: 'personal', label: 'Persönlich', icon: User, show: true },
    { value: 'company', label: 'Firma', icon: Building2, show: isOwnerOrAdmin && !!companyId },
    { value: 'team', label: 'Team', icon: Users, show: isOwnerOrAdmin && !!companyId },
    { value: 'invoices', label: 'Rechnungen', icon: FileText, show: canViewInvoices && !!companyId },
    { value: 'permissions', label: 'Berechtigungen', icon: Shield, show: isOwner && !!companyId },
  ].filter(tab => tab.show);

  const activeTabConfig = tabs.find(t => t.value === activeTab);

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // If user has no company membership, show basic personal settings only
  if (!membership) {
    return (
      <div className="container mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-8 max-w-4xl">
        <PersonalTab userEmail={userEmail} companyName={null} />
      </div>
    );
  }

  // Mobile: Show tab overview or tab content
  if (isMobile) {
    // Show tab content with back button
    if (activeTab) {
      return (
        <div className="container mx-auto px-3 py-4 max-w-4xl">
          <button 
            onClick={() => setActiveTab(null)} 
            className="flex items-center gap-2 text-muted-foreground mb-4 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zu Einstellungen
          </button>
          
          <div className="flex items-center gap-2 mb-6">
            {activeTabConfig && <activeTabConfig.icon className="h-5 w-5 text-primary" />}
            <h2 className="text-xl font-semibold">{activeTabConfig?.label}</h2>
          </div>

          {activeTab === 'personal' && <PersonalTab userEmail={userEmail} companyName={companyName || null} />}
          {activeTab === 'company' && companyId && <CompanyTab companyId={companyId} />}
          {activeTab === 'team' && companyId && <TeamTab companyId={companyId} />}
          {activeTab === 'invoices' && companyId && <InvoicesTab companyId={companyId} />}
          {activeTab === 'permissions' && companyId && <PermissionsTab companyId={companyId} />}
        </div>
      );
    }

    // Show tab overview as vertical list
    return (
      <div className="container mx-auto px-3 py-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-lg border bg-card transition-colors",
                "hover:bg-muted/50 active:bg-muted"
              )}
            >
              <tab.icon className="h-5 w-5 text-primary" />
              <span className="font-medium flex-1 text-left">{tab.label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: Standard horizontal tabs
  return (
    <div className="container mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-8 max-w-4xl">
      <Tabs value={activeTab || 'personal'} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto gap-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 py-2.5">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <PersonalTab userEmail={userEmail} companyName={companyName || null} />
        </TabsContent>

        {isOwnerOrAdmin && companyId && (
          <TabsContent value="company" className="mt-6">
            <CompanyTab companyId={companyId} />
          </TabsContent>
        )}

        {isOwnerOrAdmin && companyId && (
          <TabsContent value="team" className="mt-6">
            <TeamTab companyId={companyId} />
          </TabsContent>
        )}

        {canViewInvoices && companyId && (
          <TabsContent value="invoices" className="mt-6">
            <InvoicesTab companyId={companyId} />
          </TabsContent>
        )}

        {isOwner && companyId && (
          <TabsContent value="permissions" className="mt-6">
            <PermissionsTab companyId={companyId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
