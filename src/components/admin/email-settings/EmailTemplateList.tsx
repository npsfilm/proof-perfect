import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Edit2, Trash2, Plus, Mail, Lock } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { EmailTemplate, CATEGORY_LABELS } from './types';
import { EmailTemplateEditor } from './EmailTemplateEditorModal';

interface EmailTemplateListProps {
  category: 'system' | 'customer' | 'newsletter';
}

export function EmailTemplateList({ category }: EmailTemplateListProps) {
  const { templates, isLoading, updateTemplate, deleteTemplate, createTemplate } = useEmailTemplates(category);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleToggleActive = (template: EmailTemplate) => {
    updateTemplate.mutate({
      id: template.id,
      updates: { is_active: !template.is_active },
    });
  };

  const handleDelete = (template: EmailTemplate) => {
    if (template.is_system_template) return;
    if (confirm(`Template "${template.name}" wirklich löschen?`)) {
      deleteTemplate.mutate(template.id);
    }
  };

  const handleSaveTemplate = (template: Partial<EmailTemplate>) => {
    if (editingTemplate) {
      updateTemplate.mutate({
        id: editingTemplate.id,
        updates: template,
      }, {
        onSuccess: () => setEditingTemplate(null),
      });
    }
  };

  const handleCreateTemplate = (template: Partial<EmailTemplate>) => {
    createTemplate.mutate({
      ...template,
      category,
      template_key: template.template_key || `custom_${Date.now()}`,
      is_system_template: false,
    } as any, {
      onSuccess: () => setIsCreating(false),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{CATEGORY_LABELS[category]}</h3>
          <p className="text-sm text-muted-foreground">
            {templates?.length || 0} Template{templates?.length !== 1 ? 's' : ''}
          </p>
        </div>
        {category === 'newsletter' && (
          <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Neues Template
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{template.name}</h4>
                    {template.is_system_template && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    )}
                    {!template.is_active && (
                      <Badge variant="outline" className="text-xs">
                        Deaktiviert
                      </Badge>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={template.is_active}
                  onCheckedChange={() => handleToggleActive(template)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingTemplate(template)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {!template.is_system_template && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(template)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!templates?.length && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Mail className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine Templates in dieser Kategorie</p>
              {category === 'newsletter' && (
                <Button onClick={() => setIsCreating(true)} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Template erstellen
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template bearbeiten: {editingTemplate?.name}</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <EmailTemplateEditor
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => setEditingTemplate(null)}
              isPending={updateTemplate.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreating} onOpenChange={() => setIsCreating(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neues Template erstellen</DialogTitle>
          </DialogHeader>
          <EmailTemplateEditor
            template={{
              id: '',
              template_key: '',
              category,
              name: '',
              description: '',
              subject_du: '',
              preheader_du: '',
              heading_du: '',
              body_du: '',
              cta_text_du: '',
              cta_url_placeholder: '',
              subject_sie: '',
              preheader_sie: '',
              heading_sie: '',
              body_sie: '',
              cta_text_sie: '',
              available_placeholders: [],
              is_active: true,
              is_system_template: false,
              content_type: 'simple',
              sections: [],
              html_content_du: null,
              html_content_sie: null,
              created_at: '',
              updated_at: '',
            }}
            onSave={handleCreateTemplate}
            onCancel={() => setIsCreating(false)}
            isPending={createTemplate.isPending}
            isNew
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
