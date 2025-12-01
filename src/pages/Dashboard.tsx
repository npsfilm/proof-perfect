import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientHeader } from '@/components/client/ClientHeader';
import { ClientDashboard } from '@/components/client/ClientDashboard';
import { ClientSettingsTab } from '@/components/client/ClientSettingsTab';
import { StagingRequestTab } from '@/components/client/StagingRequestTab';
import { useClientProfile } from '@/hooks/useClientProfile';

export default function Dashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get('tab') || 'galleries';
  const { data: clientProfile } = useClientProfile(user?.email);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Lädt...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader 
        client={clientProfile || null}
        onSignOut={signOut}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      
      {role === 'admin' && (
        <div className="border-b border-border bg-muted/50">
          <div className="container mx-auto px-4 lg:px-6 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2 rounded-full shadow-neu-flat-sm"
              title="Zur Admin-Ansicht wechseln"
            >
              <Shield className="h-4 w-4" />
              <span>Admin-Ansicht</span>
            </Button>
          </div>
        </div>
      )}
      
      <main>
        {activeTab === 'galleries' && <ClientDashboard />}
        {activeTab === 'staging' && <StagingRequestTab />}
        {activeTab === 'settings' && (
          <ClientSettingsTab 
            client={clientProfile || null} 
            userEmail={user?.email || ''} 
          />
        )}
      </main>
    </div>
  );
}
