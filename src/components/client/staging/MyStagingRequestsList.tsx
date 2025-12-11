import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStagingRequests } from '@/hooks/useStagingRequests';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Clock, CheckCircle2, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAnsprache } from '@/contexts/AnspracheContext';

const statusConfig = {
  pending: {
    label: 'Ausstehend',
    icon: Clock,
    variant: 'default' as const,
  },
  processing: {
    label: 'In Bearbeitung',
    icon: Settings,
    variant: 'secondary' as const,
  },
  delivered: {
    label: 'Geliefert',
    icon: CheckCircle2,
    variant: 'default' as const,
  },
};

export function MyStagingRequestsList() {
  const { t } = useAnsprache();
  const { data: requests, isLoading } = useStagingRequests();

  if (isLoading) {
    return <LoadingState message="Anfragen werden geladen..." />;
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Keine Staging-Anfragen"
        description={t('Du hast noch keine nachträglichen Staging-Anfragen gestellt.', 'Sie haben noch keine nachträglichen Staging-Anfragen gestellt.')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const config = statusConfig[request.status];
        const Icon = config.icon;

        return (
          <Card key={request.id} className="shadow-neu-flat hover:shadow-neu-float transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="font-medium">{request.galleries.name}</div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{request.staging_style}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(request.created_at), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </div>
                    {request.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {request.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={config.variant} className="shrink-0">
                  {config.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
