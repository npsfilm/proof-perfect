import { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock, Loader2, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useWorkflowRuns } from '@/hooks/useWorkflows';
import { useScheduledSteps } from '@/hooks/useWorkflowNodes';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface ExecutionPathItem {
  node_id: string;
  node_type: string;
  action_type?: string;
  timestamp: string;
  status: string;
  result?: boolean;
  scheduled_for?: string;
}

interface WorkflowRunsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string | null;
}

export function WorkflowRunsDialog({ open, onOpenChange, workflowId }: WorkflowRunsDialogProps) {
  const { data: runs, isLoading } = useWorkflowRuns(workflowId || undefined);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running':
      case 'processing':
      case 'executing':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'waiting':
        return <Clock className="h-4 w-4 text-amber-500" />;
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
      case 'waiting':
        return 'Wartet';
      default:
        return 'Ausstehend';
    }
  };

  const getNodeTypeLabel = (nodeType: string) => {
    switch (nodeType) {
      case 'trigger': return 'Trigger';
      case 'action': return 'Aktion';
      case 'delay': return 'Verzögerung';
      case 'condition': return 'Bedingung';
      case 'end': return 'Ende';
      default: return nodeType;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Workflow-Ausführungen</DialogTitle>
          <DialogDescription>
            Zeigt die letzten 100 Ausführungen dieses Workflows mit Ausführungspfad
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
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {runs?.map((run) => {
                const executionPath = (run.execution_path as unknown as ExecutionPathItem[]) || [];
                const isExpanded = expandedRun === run.id;

                return (
                  <Collapsible
                    key={run.id}
                    open={isExpanded}
                    onOpenChange={() => setExpandedRun(isExpanded ? null : run.id)}
                  >
                    <div className="rounded-lg border">
                      {/* Header */}
                      <CollapsibleTrigger asChild>
                        <div className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
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
                              {executionPath.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  • {executionPath.length} Schritte
                                </span>
                              )}
                            </div>
                            {run.error_message && (
                              <p className="mt-1 text-sm text-destructive truncate">
                                {run.error_message}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={run.status === 'success' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}
                            >
                              {getStatusLabel(run.status)}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      {/* Expanded Details */}
                      <CollapsibleContent>
                        <div className="border-t p-3 space-y-4">
                          {/* Execution Path */}
                          {executionPath.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Ausführungspfad</h4>
                              <div className="space-y-1">
                                {executionPath.map((step, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "flex items-center gap-2 text-xs p-2 rounded",
                                      step.status === 'completed' && "bg-green-500/10",
                                      step.status === 'executing' && "bg-blue-500/10",
                                      step.status === 'waiting' && "bg-amber-500/10",
                                      step.status === 'failed' && "bg-red-500/10"
                                    )}
                                  >
                                    <span className="text-muted-foreground w-4">{i + 1}.</span>
                                    {getStatusIcon(step.status)}
                                    <span className="font-medium">{getNodeTypeLabel(step.node_type)}</span>
                                    {step.action_type && (
                                      <span className="text-muted-foreground">({step.action_type})</span>
                                    )}
                                    {step.result !== undefined && (
                                      <Badge variant="outline" className="ml-auto text-[10px]">
                                        {step.result ? 'Ja' : 'Nein'}
                                      </Badge>
                                    )}
                                    {step.scheduled_for && (
                                      <span className="ml-auto text-muted-foreground">
                                        Geplant: {format(new Date(step.scheduled_for), 'dd.MM. HH:mm', { locale: de })}
                                      </span>
                                    )}
                                    <span className="text-muted-foreground text-[10px] ml-auto">
                                      {format(new Date(step.timestamp), 'HH:mm:ss', { locale: de })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Trigger Payload */}
                          {run.trigger_payload && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Trigger-Daten</h4>
                              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-[150px]">
                                {JSON.stringify(run.trigger_payload, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Timing Info */}
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Gestartet: {format(new Date(run.started_at), 'HH:mm:ss', { locale: de })}</span>
                            {run.completed_at && (
                              <span>
                                Beendet: {format(new Date(run.completed_at), 'HH:mm:ss', { locale: de })}
                              </span>
                            )}
                            {run.started_at && run.completed_at && (
                              <span>
                                Dauer: {Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s
                              </span>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
