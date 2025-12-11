import { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { TriggerEvent, getTriggerDefinition } from '@/types/workflows';

interface ExecutionLogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  nodeId?: string;
}

interface ExecutionPathItem {
  node_id: string;
  node_type: string;
  action_type?: string;
  timestamp: string;
  status: string;
  result?: boolean;
  scheduled_for?: string;
}

interface WorkflowTestPanelProps {
  workflowId: string;
  triggerEvent?: TriggerEvent;
  triggerNodeId?: string;
  onExecutionStart?: (runId: string) => void;
  onExecutionComplete?: () => void;
}

export function WorkflowTestPanel({
  workflowId,
  triggerEvent,
  triggerNodeId,
  onExecutionStart,
  onExecutionComplete
}: WorkflowTestPanelProps) {
  const [testPayload, setTestPayload] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLogEntry[]>([]);
  const [executionPath, setExecutionPath] = useState<ExecutionPathItem[]>([]);
  const [runStatus, setRunStatus] = useState<string | null>(null);

  // Generate sample payload based on trigger event
  useEffect(() => {
    if (triggerEvent) {
      const samplePayload = generateSamplePayload(triggerEvent);
      setTestPayload(JSON.stringify(samplePayload, null, 2));
    }
  }, [triggerEvent]);

  // Poll for run updates
  useEffect(() => {
    if (!currentRunId || !isRunning) return;

    const interval = setInterval(async () => {
      const { data: run } = await supabase
        .from('workflow_runs')
        .select('status, execution_path, error_message')
        .eq('id', currentRunId)
        .single();

      if (run) {
        setExecutionPath((run.execution_path as unknown as ExecutionPathItem[]) || []);
        setRunStatus(run.status);

        if (run.status === 'success' || run.status === 'failed') {
          setIsRunning(false);
          addLog(
            run.status === 'success' ? 'Workflow erfolgreich abgeschlossen' : `Workflow fehlgeschlagen: ${run.error_message}`,
            run.status === 'success' ? 'success' : 'error'
          );
          onExecutionComplete?.();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRunId, isRunning, onExecutionComplete]);

  const addLog = (message: string, type: ExecutionLogEntry['type'] = 'info', nodeId?: string) => {
    setExecutionLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString('de-DE'),
      message,
      type,
      nodeId
    }]);
  };

  const runTest = async () => {
    if (!triggerNodeId) {
      addLog('Kein Trigger-Node gefunden', 'error');
      return;
    }

    let payload: Record<string, any>;
    try {
      payload = JSON.parse(testPayload || '{}');
    } catch {
      addLog('Ungültiges JSON in Test-Daten', 'error');
      return;
    }

    setIsRunning(true);
    setExecutionLogs([]);
    setExecutionPath([]);
    setRunStatus('running');
    addLog('Test gestartet...', 'info');

    try {
      // Create a workflow run - get the trigger_event from the workflow
      const { data: workflow } = await supabase
        .from('workflows')
        .select('trigger_event')
        .eq('id', workflowId)
        .single();

      const { data: run, error: runError } = await supabase
        .from('workflow_runs')
        .insert({
          workflow_id: workflowId,
          status: 'running',
          trigger_event: workflow?.trigger_event || triggerEvent || 'gallery_created',
          trigger_payload: payload,
          execution_path: []
        })
        .select()
        .single();

      if (runError) throw runError;

      setCurrentRunId(run.id);
      onExecutionStart?.(run.id);
      addLog(`Workflow-Run erstellt: ${run.id.slice(0, 8)}...`, 'info');

      // Start execution from trigger node
      const { error: execError } = await supabase.functions.invoke('execute-workflow-step', {
        body: {
          run_id: run.id,
          node_id: triggerNodeId,
          payload,
          is_test: true
        }
      });

      if (execError) throw execError;

      addLog('Ausführung gestartet', 'success');

    } catch (error: any) {
      addLog(`Fehler: ${error.message}`, 'error');
      setIsRunning(false);
      setRunStatus('failed');
    }
  };

  const resetTest = () => {
    setCurrentRunId(null);
    setExecutionLogs([]);
    setExecutionPath([]);
    setRunStatus(null);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'executing': return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'waiting': return <Clock className="h-3 w-3 text-amber-500" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Workflow testen
          {runStatus && (
            <Badge variant={runStatus === 'success' ? 'default' : runStatus === 'failed' ? 'destructive' : 'secondary'}>
              {runStatus === 'running' ? 'Läuft...' : runStatus === 'waiting' ? 'Wartet' : runStatus === 'success' ? 'Erfolgreich' : 'Fehlgeschlagen'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Payload */}
        <div className="space-y-2">
          <Label className="text-xs">Test-Daten (JSON)</Label>
          <Textarea
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            rows={6}
            className="font-mono text-xs"
            placeholder='{"gallery_id": "...", "client_emails": ["test@example.com"]}'
            disabled={isRunning}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={runTest} 
            disabled={isRunning || !triggerNodeId}
            size="sm"
            className="flex-1"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Läuft...' : 'Test starten'}
          </Button>
          <Button 
            onClick={resetTest} 
            variant="outline" 
            size="sm"
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Execution Path */}
        {executionPath.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Ausführungspfad</Label>
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
                  {getStatusIcon(step.status)}
                  <span className="font-medium">{step.node_type}</span>
                  {step.action_type && <span className="text-muted-foreground">({step.action_type})</span>}
                  {step.result !== undefined && (
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {step.result ? 'true' : 'false'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Logs */}
        {executionLogs.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Logs</Label>
            <ScrollArea className="h-[150px] border rounded p-2">
              {executionLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "text-xs py-0.5",
                    log.type === 'error' && "text-red-500",
                    log.type === 'success' && "text-green-500",
                    log.type === 'warning' && "text-amber-500"
                  )}
                >
                  <span className="text-muted-foreground">[{log.timestamp}]</span>{' '}
                  {log.message}
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function generateSamplePayload(triggerEvent: TriggerEvent): Record<string, any> {
  const trigger = getTriggerDefinition(triggerEvent);
  const payload: Record<string, any> = {};

  trigger?.availableData.forEach(field => {
    switch (field) {
      case 'gallery_id':
        payload.gallery_id = 'test-gallery-id';
        break;
      case 'gallery_name':
        payload.gallery_name = 'Test Galerie';
        break;
      case 'gallery_slug':
        payload.gallery_slug = 'test-galerie';
        break;
      case 'gallery_status':
        payload.gallery_status = 'Open';
        break;
      case 'client_emails':
        payload.client_emails = ['test@example.com'];
        break;
      case 'selected_count':
        payload.selected_count = 5;
        break;
      case 'total_photos':
        payload.total_photos = 20;
        break;
      case 'staging_count':
        payload.staging_count = 2;
        break;
      case 'blue_hour_count':
        payload.blue_hour_count = 1;
        break;
      case 'booking_id':
        payload.booking_id = 'test-booking-id';
        break;
      case 'contact_email':
        payload.contact_email = 'kunde@example.com';
        break;
      case 'contact_name':
        payload.contact_name = 'Max Mustermann';
        break;
      case 'address':
        payload.address = 'Musterstraße 123, 86150 Augsburg';
        break;
      case 'package_type':
        payload.package_type = 'Foto';
        break;
      case 'scheduled_date':
        payload.scheduled_date = new Date().toISOString().split('T')[0];
        break;
      case 'request_id':
        payload.request_id = 'test-request-id';
        break;
      case 'message':
        payload.message = 'Test-Nachricht';
        break;
      default:
        payload[field] = `test_${field}`;
    }
  });

  return payload;
}
