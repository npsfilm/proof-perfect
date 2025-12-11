import { useState } from 'react';
import { ChevronDown, Image } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StagingReference } from '@/types/database';

interface CollapsibleReferencesCardProps {
  stagingReferences: StagingReference[];
}

export function CollapsibleReferencesCard({ stagingReferences }: CollapsibleReferencesCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!stagingReferences || stagingReferences.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Referenzbilder</span>
          <span className="text-xs text-muted-foreground">({stagingReferences.length})</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 pl-6">
          {stagingReferences.map((ref) => (
            <div key={ref.id} className="space-y-0.5">
              <div className="aspect-square rounded-md overflow-hidden border border-border">
                <img
                  src={ref.file_url}
                  alt="Staging Referenz"
                  className="w-full h-full object-cover"
                />
              </div>
              {ref.notes && (
                <p className="text-[9px] text-muted-foreground line-clamp-1">{ref.notes}</p>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
