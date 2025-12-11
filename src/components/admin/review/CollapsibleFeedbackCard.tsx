import { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FeedbackItem {
  id: string;
  message: string;
  created_at: string;
  profiles: { email: string };
}

interface CollapsibleFeedbackCardProps {
  feedback: FeedbackItem[];
}

export function CollapsibleFeedbackCard({ feedback }: CollapsibleFeedbackCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!feedback || feedback.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Kunden-Feedback</span>
          <span className="text-xs text-muted-foreground">({feedback.length})</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="space-y-2 pl-6">
          {feedback.map((item) => (
            <div key={item.id} className="border-l-2 border-primary/30 pl-3 py-1.5">
              <p className="text-sm">{item.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.profiles.email} • {new Date(item.created_at).toLocaleString('de-DE')}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
