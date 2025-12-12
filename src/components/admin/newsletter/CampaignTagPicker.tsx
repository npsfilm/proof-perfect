import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface CampaignTagPickerProps {
  tags: Tag[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function CampaignTagPicker({ tags, selectedTags, onChange }: CampaignTagPickerProps) {
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  if (tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Keine Tags vorhanden
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);

        return (
          <label
            key={tag.id}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors',
              isSelected
                ? 'bg-primary/10 border-primary'
                : 'bg-background border-border hover:border-primary/50'
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleTag(tag.id)}
              className="h-4 w-4"
            />
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tag.color || '#6366f1' }}
            />
            <span className="text-sm">{tag.name}</span>
          </label>
        );
      })}
    </div>
  );
}
