import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Users, 
  Clock, 
  Play,
  UserPlus,
  Calendar,
  Package,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useEmailSequences, useUpdateSequence, useDeleteSequence, useSequenceStats } from '@/hooks/useEmailSequences';
import { SequenceEditor } from './SequenceEditor';
import { SequenceStepList } from './SequenceStepList';
import { Skeleton } from '@/components/ui/skeleton';
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

const TRIGGER_EVENTS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  client_created: { label: 'Neuer Kunde', icon: <UserPlus className="h-3 w-3" />, color: 'bg-green-500/10 text-green-600' },
  booking_completed: { label: 'Buchung abgeschlossen', icon: <Calendar className="h-3 w-3" />, color: 'bg-blue-500/10 text-blue-600' },
  gallery_delivered: { label: 'Galerie ausgeliefert', icon: <Package className="h-3 w-3" />, color: 'bg-purple-500/10 text-purple-600' },
  inactivity_30d: { label: '30 Tage inaktiv', icon: <AlertCircle className="h-3 w-3" />, color: 'bg-orange-500/10 text-orange-600' },
  inactivity_90d: { label: '90 Tage inaktiv', icon: <AlertCircle className="h-3 w-3" />, color: 'bg-red-500/10 text-red-600' },
  manual: { label: 'Manuell', icon: <Zap className="h-3 w-3" />, color: 'bg-gray-500/10 text-gray-600' },
};

function SequenceStats({ sequenceId }: { sequenceId: string }) {
  const { data: stats } = useSequenceStats(sequenceId);
  
  if (!stats) return null;
  
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Mail className="h-3 w-3" />
        {stats.stepCount} Schritte
      </span>
      <span className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {stats.activeEnrollments} aktiv
      </span>
      {stats.completedEnrollments > 0 && (
        <span className="flex items-center gap-1">
          <Play className="h-3 w-3" />
          {stats.completedEnrollments} abgeschlossen
        </span>
      )}
    </div>
  );
}

export function SequenceList() {
  const { data: sequences, isLoading } = useEmailSequences();
  const updateSequence = useUpdateSequence();
  const deleteSequence = useDeleteSequence();
  
  const [editingSequence, setEditingSequence] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingSteps, setViewingSteps] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateSequence.mutate({ id, is_active: !isActive });
  };

  const handleDelete = (id: string) => {
    deleteSequence.mutate(id);
    setDeleteConfirm(null);
  };

  const formatDelay = (minutes: number): string => {
    if (minutes === 0) return 'Sofort';
    if (minutes < 60) return `${minutes} Min.`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} Std.`;
    return `${Math.round(minutes / 1440)} Tage`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">E-Mail-Sequenzen</h3>
          <p className="text-sm text-muted-foreground">
            Automatisierte E-Mail-Abfolgen basierend auf Ereignissen
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Sequenz
        </Button>
      </div>

      {sequences?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h4 className="font-medium mb-2">Keine Sequenzen vorhanden</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Erstellen Sie Ihre erste E-Mail-Sequenz, um automatisierte Kampagnen zu starten.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Sequenz erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sequences?.map(sequence => {
            const trigger = TRIGGER_EVENTS[sequence.trigger_event];
            
            return (
              <Card 
                key={sequence.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setViewingSteps(sequence.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{sequence.name}</h4>
                        <Badge variant={sequence.is_active ? 'default' : 'secondary'}>
                          {sequence.is_active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                      
                      {sequence.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {sequence.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 flex-wrap">
                        {trigger && (
                          <Badge variant="outline" className={trigger.color}>
                            {trigger.icon}
                            <span className="ml-1">{trigger.label}</span>
                          </Badge>
                        )}
                        
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Start: {formatDelay(sequence.delay_after_trigger_minutes)}
                        </span>
                        
                        <SequenceStats sequenceId={sequence.id} />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Switch
                        checked={sequence.is_active}
                        onCheckedChange={() => handleToggleActive(sequence.id, sequence.is_active)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingSequence(sequence.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteConfirm(sequence.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <SequenceEditor
        open={isCreating}
        onOpenChange={setIsCreating}
        sequence={null}
      />

      {/* Edit Dialog */}
      {editingSequence && (
        <SequenceEditor
          open={!!editingSequence}
          onOpenChange={() => setEditingSequence(null)}
          sequence={sequences?.find(s => s.id === editingSequence) || null}
        />
      )}

      {/* Steps Dialog */}
      {viewingSteps && (
        <SequenceStepList
          open={!!viewingSteps}
          onOpenChange={() => setViewingSteps(null)}
          sequence={sequences?.find(s => s.id === viewingSteps) || null}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sequenz löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Schritte und laufenden Enrollments werden gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
