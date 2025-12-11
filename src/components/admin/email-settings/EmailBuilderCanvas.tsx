import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Settings, Trash2, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { EmailTemplateSectionInstance, EmailSection, SECTION_TYPE_LABELS, SECTION_TYPE_ICONS, SalutationType } from './types';
import { EmailSectionEditor } from './EmailSectionEditor';
import { SaveSectionDialog } from './SaveSectionDialog';

interface EmailBuilderCanvasProps {
  sections: EmailTemplateSectionInstance[];
  onSectionsChange: (sections: EmailTemplateSectionInstance[]) => void;
  salutation: SalutationType;
}

export function EmailBuilderCanvas({ 
  sections, 
  onSectionsChange,
  salutation 
}: EmailBuilderCanvasProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [savingSection, setSavingSection] = useState<EmailTemplateSectionInstance | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const section: EmailSection = JSON.parse(data);
      const newInstance: EmailTemplateSectionInstance = {
        id: crypto.randomUUID(),
        section_type: section.section_type,
        content_du: section.content_du || '',
        content_sie: section.content_sie || '',
        settings: section.settings,
      };
      onSectionsChange([...sections, newInstance]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const removeSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    onSectionsChange(newSections);
    if (editingIndex === index) setEditingIndex(null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;
    
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    onSectionsChange(newSections);
  };

  const updateSection = (index: number, updates: Partial<EmailTemplateSectionInstance>) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    onSectionsChange(newSections);
  };

  const getContentPreview = (section: EmailTemplateSectionInstance) => {
    const content = salutation === 'du' ? section.content_du : section.content_sie;
    if (!content) return '';
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardContent 
          className="p-4 flex-1 overflow-auto"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {sections.length === 0 ? (
            <div className="h-full min-h-[200px] flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Ziehe Bausteine hierher</p>
                <p className="text-xs mt-1">oder klicke auf einen Baustein</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex items-start gap-2 p-3 rounded-lg border transition-colors ${
                    editingIndex === index ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <GripVertical className="h-4 w-4 text-muted-foreground mx-auto" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">
                        {SECTION_TYPE_ICONS[section.section_type]}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {SECTION_TYPE_LABELS[section.section_type]}
                      </Badge>
                    </div>
                    {getContentPreview(section) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {getContentPreview(section)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSavingSection(section)}
                    >
                      <Save className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeSection(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingIndex !== null && sections[editingIndex] && (
        <EmailSectionEditor
          section={sections[editingIndex]}
          salutation={salutation}
          onUpdate={(updates) => updateSection(editingIndex, updates)}
          onClose={() => setEditingIndex(null)}
        />
      )}

      {savingSection && (
        <SaveSectionDialog
          section={savingSection}
          open={!!savingSection}
          onOpenChange={(open) => !open && setSavingSection(null)}
        />
      )}
    </>
  );
}
