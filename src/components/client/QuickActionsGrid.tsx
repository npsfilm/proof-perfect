import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, Download, Home } from 'lucide-react';
import { QuickActionCard } from './QuickActionCard';

interface QuickActionsGridProps {
  deliveredCount?: number;
  stagingRequestsCount?: number;
  onOpenDownloads: () => void;
}

export function QuickActionsGrid({
  deliveredCount = 0,
  stagingRequestsCount = 0,
  onOpenDownloads,
}: QuickActionsGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fade-in">
      <QuickActionCard
        icon={Calendar}
        title="Shooting buchen"
        description="Termin vereinbaren"
        onClick={() => navigate('/buchung')}
        gradient="from-primary/5 to-primary/10"
      />

      <QuickActionCard
        icon={Sparkles}
        title="Virtuelle Bearbeitung"
        description="Blaue Stunde, Sommer-Winter"
        onClick={() => navigate('/virtuelle-bearbeitung')}
        gradient="from-secondary/5 to-secondary/10"
      />

      <QuickActionCard
        icon={Download}
        title="Meine Downloads"
        description="Gelieferte Dateien"
        badge={deliveredCount > 0 ? deliveredCount : undefined}
        badgeVariant="secondary"
        onClick={onOpenDownloads}
        gradient="from-blue-500/5 to-blue-500/10"
      />

      <QuickActionCard
        icon={Home}
        title="Virtuelles Staging"
        description="Räume einrichten"
        badge={stagingRequestsCount > 0 ? `${stagingRequestsCount} offen` : undefined}
        badgeVariant="default"
        onClick={() => navigate('/dashboard?tab=staging')}
        gradient="from-purple-500/5 to-purple-500/10"
      />
    </div>
  );
}
