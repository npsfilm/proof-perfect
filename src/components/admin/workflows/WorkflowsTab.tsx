import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap, MoreVertical, Pencil, Trash2, Play, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWorkflows, useDeleteWorkflow, useToggleWorkflow, useCreateWorkflow } from '@/hooks/useWorkflows';
import { getTriggerDefinition, getActionDefinition } from '@/types/workflows';
import { WorkflowRunsDialog } from './WorkflowRunsDialog';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';

export function WorkflowsTab() {
  const navigate = useNavigate();
  const { data: workflows, isLoading } = useWorkflows();
  const deleteWorkflow = useDeleteWorkflow();
  const toggleWorkflow = useToggleWorkflow();
  const createWorkflow = useCreateWorkflow();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const [runsDialogOpen, setRunsDialogOpen] = useState(false);
  const [runsWorkflowId, setRunsWorkflowId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    navigate(`/admin/workflows/${id}`);
  };

  const handleCreate = async () => {
    const result = await createWorkflow.mutateAsync({
      name: 'Neuer Workflow',
      description: null,
      trigger_event: 'gallery_created',
      is_active: false,
      conditions: {},
    });
    navigate(`/admin/workflows/${result.id}`);
  };

  const handleDelete = (id: string) => {
    setWorkflowToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (workflowToDelete) {
      deleteWorkflow.mutate(workflowToDelete);
      setDeleteDialogOpen(false);
      setWorkflowToDelete(null);
    }
  };

  const handleViewRuns = (id: string) => {
    setRunsWorkflowId(id);
    setRunsDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingState message="Workflows werden geladen..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Workflow-Automatisierungen</h3>
          <p className="text-sm text-muted-foreground">
            Automatisiere Aktionen basierend auf Ereignissen
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Workflow
        </Button>
      </div>

      {workflows?.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="Keine Workflows konfiguriert"
          description="Erstelle deinen ersten Workflow, um Aktionen zu automatisieren"
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Workflow erstellen
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {workflows?.map((workflow) => {
            const trigger = getTriggerDefinition(workflow.trigger_event);
            const actionCount = workflow.workflow_actions?.length || 0;

            return (
              <Card key={workflow.id} className={!workflow.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                        {workflow.description && (
                          <CardDescription className="mt-0.5">
                            {workflow.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={(checked) =>
                          toggleWorkflow.mutate({ id: workflow.id, is_active: checked })
                        }
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(workflow.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewRuns(workflow.id)}>
                            <History className="mr-2 h-4 w-4" />
                            Ausführungen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(workflow.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Play className="h-3 w-3" />
                      {trigger?.label || workflow.trigger_event}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="outline">
                      {actionCount} {actionCount === 1 ? 'Aktion' : 'Aktionen'}
                    </Badge>
                    {workflow.workflow_actions?.map((action) => {
                      const actionDef = getActionDefinition(action.action_type);
                      return (
                        <Badge key={action.id} variant="outline" className="text-xs">
                          {actionDef?.label || action.action_type}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <WorkflowRunsDialog
        open={runsDialogOpen}
        onOpenChange={setRunsDialogOpen}
        workflowId={runsWorkflowId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Workflow löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Workflow und alle
              zugehörigen Aktionen werden permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
