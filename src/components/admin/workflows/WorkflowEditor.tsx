import { useState, useEffect } from 'react';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useWorkflow,
  useCreateWorkflow,
  useUpdateWorkflow,
  useCreateWorkflowAction,
  useUpdateWorkflowAction,
  useDeleteWorkflowAction,
} from '@/hooks/useWorkflows';
import {
  TRIGGER_DEFINITIONS,
  ACTION_DEFINITIONS,
  getTriggerDefinition,
  type TriggerEvent,
  type ActionType,
  type WorkflowAction,
} from '@/types/workflows';
import { ActionConfigForm } from './ActionConfigForm';

interface WorkflowEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string | null;
}

interface LocalAction {
  id?: string;
  action_type: ActionType;
  action_config: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
}

export function WorkflowEditor({ open, onOpenChange, workflowId }: WorkflowEditorProps) {
  const { data: existingWorkflow } = useWorkflow(workflowId || undefined);
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow();
  const createAction = useCreateWorkflowAction();
  const updateAction = useUpdateWorkflowAction();
  const deleteAction = useDeleteWorkflowAction();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEvent, setTriggerEvent] = useState<TriggerEvent>('gallery_created');
  const [actions, setActions] = useState<LocalAction[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when opening/closing
  useEffect(() => {
    if (open && existingWorkflow) {
      setName(existingWorkflow.name);
      setDescription(existingWorkflow.description || '');
      setTriggerEvent(existingWorkflow.trigger_event);
      setActions(
        existingWorkflow.workflow_actions?.map((a) => ({
          id: a.id,
          action_type: a.action_type,
          action_config: a.action_config,
          sort_order: a.sort_order,
          is_active: a.is_active,
        })) || []
      );
    } else if (open && !workflowId) {
      setName('');
      setDescription('');
      setTriggerEvent('gallery_created');
      setActions([]);
    }
  }, [open, existingWorkflow, workflowId]);

  const selectedTrigger = getTriggerDefinition(triggerEvent);

  const handleAddAction = () => {
    setActions([
      ...actions,
      {
        action_type: 'send_email',
        action_config: {},
        sort_order: actions.length,
        is_active: true,
      },
    ]);
  };

  const handleRemoveAction = (index: number) => {
    const action = actions[index];
    if (action.id) {
      deleteAction.mutate(action.id);
    }
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleActionTypeChange = (index: number, type: ActionType) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], action_type: type, action_config: {} };
    setActions(newActions);
  };

  const handleActionConfigChange = (index: number, config: Record<string, unknown>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], action_config: config };
    setActions(newActions);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      let workflowIdToUse = workflowId;

      if (workflowId) {
        // Update existing workflow
        await updateWorkflow.mutateAsync({
          id: workflowId,
          name,
          description: description || null,
          trigger_event: triggerEvent,
        });
      } else {
        // Create new workflow
        const newWorkflow = await createWorkflow.mutateAsync({
          name,
          description: description || null,
          trigger_event: triggerEvent,
          is_active: true,
          conditions: {},
        });
        workflowIdToUse = newWorkflow.id;
      }

      // Handle actions
      for (const action of actions) {
        if (action.id) {
          // Update existing action
          await updateAction.mutateAsync({
            id: action.id,
            action_type: action.action_type,
            action_config: action.action_config,
            sort_order: action.sort_order,
            is_active: action.is_active,
          });
        } else if (workflowIdToUse) {
          // Create new action
          await createAction.mutateAsync({
            workflow_id: workflowIdToUse,
            action_type: action.action_type,
            action_config: action.action_config,
            sort_order: action.sort_order,
            is_active: action.is_active,
          });
        }
      }

      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workflowId ? 'Workflow bearbeiten' : 'Neuer Workflow'}
          </DialogTitle>
          <DialogDescription>
            Definiere einen Trigger und die auszuführenden Aktionen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name & Beschreibung */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Galerie-Begrüßung senden"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Was macht dieser Workflow?"
                rows={2}
              />
            </div>
          </div>

          {/* Trigger */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Trigger (Auslöser)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={triggerEvent} onValueChange={(v) => setTriggerEvent(v as TriggerEvent)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_DEFINITIONS.map((trigger) => (
                    <SelectItem key={trigger.key} value={trigger.key}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTrigger && (
                <div className="text-sm text-muted-foreground">
                  <p>{selectedTrigger.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs">Verfügbare Daten:</span>
                    {selectedTrigger.availableData.map((d) => (
                      <Badge key={d} variant="secondary" className="text-xs">
                        {'{' + d + '}'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aktionen */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Aktionen</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddAction}>
                <Plus className="mr-1 h-4 w-4" />
                Aktion hinzufügen
              </Button>
            </div>

            {actions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Noch keine Aktionen definiert
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddAction}
                    className="mt-2"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Erste Aktion hinzufügen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <span className="text-sm font-medium">Aktion {index + 1}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAction(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select
                        value={action.action_type}
                        onValueChange={(v) => handleActionTypeChange(index, v as ActionType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_DEFINITIONS.map((actionDef) => (
                            <SelectItem key={actionDef.key} value={actionDef.key}>
                              {actionDef.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <ActionConfigForm
                        actionType={action.action_type}
                        config={action.action_config}
                        onChange={(config) => handleActionConfigChange(index, config)}
                        triggerEvent={triggerEvent}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
