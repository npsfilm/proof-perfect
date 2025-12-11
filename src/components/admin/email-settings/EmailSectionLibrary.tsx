import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GripVertical, Star } from 'lucide-react';
import { useEmailSections } from '@/hooks/useEmailSections';
import { EmailSection, SECTION_TYPE_LABELS, SECTION_TYPE_ICONS } from './types';

interface EmailSectionLibraryProps {
  onAddSection: (section: EmailSection) => void;
}

export function EmailSectionLibrary({ onAddSection }: EmailSectionLibraryProps) {
  const { presetSections, customSections, isLoading } = useEmailSections();

  const handleDragStart = (e: React.DragEvent, section: EmailSection) => {
    e.dataTransfer.setData('application/json', JSON.stringify(section));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const SectionItem = ({ section }: { section: EmailSection }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, section)}
      onClick={() => onAddSection(section)}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-grab active:cursor-grabbing transition-colors border border-transparent hover:border-border"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-lg flex-shrink-0">
        {SECTION_TYPE_ICONS[section.section_type]}
      </span>
      <span className="text-sm truncate flex-1">{section.name}</span>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm">Bausteine</CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 pr-2">
            {/* Preset Sections */}
            <div className="px-2 py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Vorlagen
              </span>
            </div>
            {presetSections.map((section) => (
              <SectionItem key={section.id} section={section} />
            ))}

            {customSections.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="px-2 py-1 flex items-center gap-1">
                  <Star className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Gespeichert
                  </span>
                </div>
                {customSections.map((section) => (
                  <SectionItem key={section.id} section={section} />
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
