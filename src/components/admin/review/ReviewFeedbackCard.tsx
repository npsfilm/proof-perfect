import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FeedbackItem {
  id: string;
  message: string;
  created_at: string;
  profiles: { email: string };
}

interface ReviewFeedbackCardProps {
  feedback: FeedbackItem[];
}

export function ReviewFeedbackCard({ feedback }: ReviewFeedbackCardProps) {
  if (!feedback || feedback.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kunden-Feedback</CardTitle>
        <CardDescription>Allgemeine Kommentare vom Kunden</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {feedback.map((item) => (
          <div key={item.id} className="border-l-4 border-primary pl-4 py-2">
            <p className="text-sm">{item.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {item.profiles.email} • {new Date(item.created_at).toLocaleString('de-DE')}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
