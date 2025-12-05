import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ClientDashboard } from '@/components/client/ClientDashboard';
import { ClientSettingsTab } from '@/components/client/ClientSettingsTab';
import { StagingRequestTab } from '@/components/client/StagingRequestTab';
import { useClientProfile } from '@/hooks/useClientProfile';

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const activeTab = searchParams.get('tab') || 'galleries';
  const { data: clientProfile } = useClientProfile(user?.email);

  return (
    <div className="min-h-full">
      {activeTab === 'galleries' && <ClientDashboard />}
      {activeTab === 'staging' && <StagingRequestTab />}
      {activeTab === 'settings' && (
        <ClientSettingsTab 
          client={clientProfile || null} 
          userEmail={user?.email || ''} 
        />
      )}
    </div>
  );
}
