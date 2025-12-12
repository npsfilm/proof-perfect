import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Mail, 
  Clock, 
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Users,
  ArrowRight
} from 'lucide-react';
import { 
  EmailSequence, 
  useSequenceSteps, 
  useSequenceEnrollments,
  useDeleteSequenceStep,
  useUpdateEnrollmentStatus
} from '@/hooks/useEmailSequences';
import { SequenceStepEditor } from './SequenceStepEditor';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SequenceStepListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequence: EmailSequence | null;
}

const formatDelay = (minutes: number): string => {
  if (minutes === 0) return 'Sofort';
  if (minutes < 60) return `${minutes} Min.`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} Std.`;
  return `${Math.round(minutes / 1440)} Tage`;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktiv', color: 'bg-green-500/10 text-green-600' },
  completed: { label: 'Abgeschlossen', color: 'bg-blue-500/10 text-blue-600' },
  paused: { label: 'Pausiert', color: 'bg-yellow-500/10 text-yellow-600' },
  cancelled: { label: 'Abgebrochen', color: 'bg-red-500/10 text-red-600' },
};

export function SequenceStepList({ open, onOpenChange, sequence }: SequenceStepListProps) {
  const { data: steps, isLoading: stepsLoading } = useSequenceSteps(sequence?.id || null);
  const { data: enrollments, isLoading: enrollmentsLoading } = useSequenceEnrollments(sequence?.id || null);
  const deleteStep = useDeleteSequenceStep();
  const updateStatus = useUpdateEnrollmentStatus();
  
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);

  if (!sequence) return null;

  const handleDeleteStep = (stepId: string) => {
    deleteStep.mutate({ id: stepId, sequence_id: sequence.id });
  };

  const handleUpdateStatus = (enrollmentId: string, status: string) => {
    updateStatus.mutate({ id: enrollmentId, status, sequence_id: sequence.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {sequence.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="steps" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="steps" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Schritte ({steps?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="enrollments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Empfänger ({enrollments?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsAddingStep(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Schritt hinzufügen
                </Button>
              </div>

              {stepsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : steps?.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Mail className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Noch keine Schritte definiert
                    </p>
                    <Button onClick={() => setIsAddingStep(true)} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Ersten Schritt hinzufügen
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-4">
                    {steps?.map((step, index) => (
                      <div key={step.id} className="relative flex gap-4">
                        {/* Timeline node */}
                        <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        
                        <Card className="flex-1">
                          <CardContent className="py-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium truncate">
                                    {step.template?.name || 'Template nicht gefunden'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {index === 0 ? 'Nach Trigger' : 'Nach vorherigem Schritt'}:
                                    {' '}{formatDelay(step.delay_from_previous_minutes)}
                                  </span>
                                  
                                  {step.subject_override && (
                                    <Badge variant="outline" className="text-xs">
                                      Betreff überschrieben
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setEditingStep(step.id)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteStep(step.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="enrollments" className="flex-1 overflow-y-auto mt-4">
            {enrollmentsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : enrollments?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Noch keine Empfänger eingeschrieben
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {enrollments?.map(enrollment => {
                  const status = STATUS_LABELS[enrollment.status];
                  return (
                    <Card key={enrollment.id}>
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">
                                {enrollment.client?.vorname} {enrollment.client?.nachname}
                              </span>
                              <Badge variant="outline" className={status?.color}>
                                {status?.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{enrollment.client?.email}</span>
                              <span className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                Schritt {enrollment.current_step + 1}
                              </span>
                              {enrollment.next_send_at && enrollment.status === 'active' && (
                                <span>
                                  Nächste E-Mail: {new Date(enrollment.next_send_at).toLocaleString('de-DE')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {enrollment.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(enrollment.id, 'paused')}>
                                  Pausieren
                                </DropdownMenuItem>
                              )}
                              {enrollment.status === 'paused' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(enrollment.id, 'active')}>
                                  Fortsetzen
                                </DropdownMenuItem>
                              )}
                              {enrollment.status !== 'cancelled' && enrollment.status !== 'completed' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(enrollment.id, 'cancelled')}>
                                  Abbrechen
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Step Dialog */}
        <SequenceStepEditor
          open={isAddingStep}
          onOpenChange={setIsAddingStep}
          sequenceId={sequence.id}
          step={null}
          nextOrder={(steps?.length || 0) + 1}
        />

        {/* Edit Step Dialog */}
        {editingStep && (
          <SequenceStepEditor
            open={!!editingStep}
            onOpenChange={() => setEditingStep(null)}
            sequenceId={sequence.id}
            step={steps?.find(s => s.id === editingStep) || null}
            nextOrder={0}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
