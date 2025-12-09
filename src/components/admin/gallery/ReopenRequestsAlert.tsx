import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { ReopenRequest } from './types';

interface ReopenRequestsAlertProps {
  pendingRequests: ReopenRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isResolving: boolean;
}

export function ReopenRequestsAlert({
  pendingRequests,
  onApprove,
  onReject,
  isResolving,
}: ReopenRequestsAlertProps) {
  if (pendingRequests.length === 0) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <AlertCircle className="h-5 w-5 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">
        Anfrage zur Wiedereröffnung
      </AlertTitle>
      <AlertDescription className="text-orange-800 dark:text-orange-200">
        <div className="space-y-3 mt-2">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-start justify-between gap-4 p-3 bg-white dark:bg-orange-900/20 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Ein Kunde bittet um Wiedereröffnung dieser Galerie
                </p>
                {request.message && (
                  <p className="text-sm mt-1 text-muted-foreground">
                    Nachricht: "{request.message}"
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(request.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprove(request.id)}
                  disabled={isResolving}
                  className="gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Genehmigen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(request.id)}
                  disabled={isResolving}
                  className="gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Ablehnen
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
