import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkflowRuns } from '@/hooks/useWorkflows';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';

interface WorkflowRunsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string | null;
}

export function WorkflowRunsDialog({ open, onOpenChange, workflowId }: WorkflowRunsDialogProps) {
  const { data: runs, isLoading } = useWorkflowRuns(workflowId || undefined);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return 'Erfolgreich';
      case 'failed':
        return 'Fehlgeschlagen';
      case 'running':
        return 'Läuft...';
      default:
        return 'Ausstehend';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Workflow-Ausführungen</DialogTitle>
          <DialogDescription>
            Zeigt die letzten 100 Ausführungen dieses Workflows
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingState message="Lade Ausführungen..." />
        ) : runs?.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Keine Ausführungen"
            description="Dieser Workflow wurde noch nicht ausgeführt"
          />
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {runs?.map((run) => (
                <div
                  key={run.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="mt-0.5">{getStatusIcon(run.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {run.trigger_event}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(run.started_at), 'dd.MM.yyyy HH:mm:ss', {
                          locale: de,
                        })}
                      </span>
                    </div>
                    {run.error_message && (
                      <p className="mt-1 text-sm text-destructive truncate">
                        {run.error_message}
                      </p>
                    )}
                    {run.trigger_payload && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(run.trigger_payload, null, 2)}
                      </pre>
                    )}
                  </div>
                  <Badge
                    variant={run.status === 'success' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}
                  >
                    {getStatusLabel(run.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
