import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClientTags, useDeleteTag, ClientTag } from '@/hooks/useClientTags';
import { TagEditor } from './TagEditor';
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

export function TagList() {
  const { data: tags, isLoading } = useClientTags();
  const deleteTag = useDeleteTag();
  const [editingTag, setEditingTag] = useState<ClientTag | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingTag, setDeletingTag] = useState<ClientTag | null>(null);

  const handleDelete = async () => {
    if (deletingTag) {
      await deleteTag.mutateAsync(deletingTag.id);
      setDeletingTag(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Kunden-Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const manualTags = tags?.filter(t => t.tag_type === 'manual') || [];
  const autoTags = tags?.filter(t => t.tag_type === 'auto') || [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Kunden-Tags
            </CardTitle>
            <CardDescription>
              Segmentieren Sie Ihre Kunden mit manuellen oder automatischen Tags
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Tag
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Tags */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automatische Tags ({autoTags.length})
            </h3>
            <div className="space-y-2">
              {autoTags.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Keine automatischen Tags vorhanden
                </p>
              ) : (
                autoTags.map(tag => (
                  <TagItem
                    key={tag.id}
                    tag={tag}
                    onEdit={() => setEditingTag(tag)}
                    onDelete={() => setDeletingTag(tag)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Manual Tags */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manuelle Tags ({manualTags.length})
            </h3>
            <div className="space-y-2">
              {manualTags.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Keine manuellen Tags vorhanden
                </p>
              ) : (
                manualTags.map(tag => (
                  <TagItem
                    key={tag.id}
                    tag={tag}
                    onEdit={() => setEditingTag(tag)}
                    onDelete={() => setDeletingTag(tag)}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tag Editor Dialog */}
      <TagEditor
        open={isCreating || !!editingTag}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingTag(null);
          }
        }}
        tag={editingTag}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTag} onOpenChange={() => setDeletingTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Tag "{deletingTag?.name}" wird dauerhaft gelöscht. 
              {deletingTag?.assignment_count ? (
                <span className="block mt-2 text-destructive">
                  {deletingTag.assignment_count} Kunde(n) haben diesen Tag zugewiesen.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TagItem({
  tag,
  onEdit,
  onDelete,
}: {
  tag: ClientTag;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getConditionLabel = () => {
    if (tag.tag_type === 'manual' || !tag.auto_conditions?.field) {
      return null;
    }

    const fieldLabels: Record<string, string> = {
      booking_count: 'Buchungen',
      total_revenue_cents: 'Umsatz (€)',
      days_since_last_booking: 'Tage seit Buchung',
      staging_count: 'Staging-Anfragen',
      blue_hour_count: 'Blue Hour Bilder',
    };

    const operatorLabels: Record<string, string> = {
      eq: '=',
      gte: '≥',
      lte: '≤',
      gt: '>',
      lt: '<',
    };

    const field = fieldLabels[tag.auto_conditions.field] || tag.auto_conditions.field;
    const operator = operatorLabels[tag.auto_conditions.operator || 'eq'] || tag.auto_conditions.operator;
    let value = tag.auto_conditions.value || 0;

    // Convert cents to euros for display
    if (tag.auto_conditions.field === 'total_revenue_cents') {
      value = value / 100;
    }

    return `${field} ${operator} ${value}`;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{tag.name}</span>
            {tag.tag_type === 'auto' && (
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Auto
              </Badge>
            )}
            {!tag.is_active && (
              <Badge variant="outline" className="text-xs">
                Inaktiv
              </Badge>
            )}
          </div>
          {tag.description && (
            <p className="text-sm text-muted-foreground">{tag.description}</p>
          )}
          {getConditionLabel() && (
            <p className="text-xs text-muted-foreground mt-1">
              Bedingung: {getConditionLabel()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {tag.assignment_count || 0} Kunden
        </Badge>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
