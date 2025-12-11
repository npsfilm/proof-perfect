import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, Users, FileText, Shield } from 'lucide-react';
import { useState } from 'react';
import { useCompanyRole } from '@/hooks/useCompanyRole';
import { useAuth } from '@/contexts/AuthContext';
import { PersonalTab } from './PersonalTab';
import { CompanyTab } from './CompanyTab';
import { TeamTab } from './TeamTab';
import { InvoicesTab } from './InvoicesTab';
import { PermissionsTab } from './PermissionsTab';

interface SettingsLayoutProps {
  userEmail: string;
}

export function SettingsLayout({ userEmail }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const { user } = useAuth();
  const { data: membership, isLoading } = useCompanyRole(user?.id);
  
  const isOwnerOrAdmin = membership?.role === 'owner' || membership?.role === 'company_admin';
  const isOwner = membership?.role === 'owner';
  const canViewInvoices = isOwnerOrAdmin || membership?.can_view_invoices;
  const companyId = membership?.company_id;
  const companyName = membership?.companies?.name;

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

  return (
    <div className="container mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-8 max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="personal" className="flex items-center gap-2 py-2.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Persönlich</span>
          </TabsTrigger>
          
          {isOwnerOrAdmin && (
            <TabsTrigger value="company" className="flex items-center gap-2 py-2.5">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Firma</span>
            </TabsTrigger>
          )}
          
          {isOwnerOrAdmin && (
            <TabsTrigger value="team" className="flex items-center gap-2 py-2.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
          )}
          
          {canViewInvoices && companyId && (
            <TabsTrigger value="invoices" className="flex items-center gap-2 py-2.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Rechnungen</span>
            </TabsTrigger>
          )}
          
          {isOwner && companyId && (
            <TabsTrigger value="permissions" className="flex items-center gap-2 py-2.5">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Berechtigungen</span>
            </TabsTrigger>
          )}
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
