import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Send, 
  Package, 
  MessageSquare, 
  Palette, 
  Unlock,
  MessageCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useRecentActivity, ActivityItem } from '@/hooks/useRecentActivity';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const activityConfig = {
  gallery_sent: {
    icon: Send,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  gallery_reviewed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  gallery_delivered: {
    icon: Package,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
  },
  staging_requested: {
    icon: Palette,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  reopen_requested: {
    icon: Unlock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  feedback_added: {
    icon: MessageCircle,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
  },
};

function ActivityItemComponent({ activity }: { activity: ActivityItem }) {
  const navigate = useNavigate();
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  const relativeTime = formatDistanceToNow(new Date(activity.timestamp), {
    addSuffix: true,
    locale: de,
  });

  const handleClick = () => {
    if (activity.galleryId) {
      navigate(`/admin/galleries/${activity.galleryId}`);
    }
  };

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl transition-all cursor-pointer hover:bg-muted/50 ${
        activity.status === 'failed' ? 'border-l-2 border-destructive' : ''
      }`}
      onClick={handleClick}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium truncate">{activity.title}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{relativeTime}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {activity.description}
          {activity.actorEmail && ` · ${activity.actorEmail.split('@')[0]}`}
        </p>
        {activity.status === 'failed' && (
          <p className="text-xs text-destructive mt-1">Fehlgeschlagen</p>
        )}
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const { data: activities, isLoading } = useRecentActivity();

  return (
    <Card className="shadow-neu-flat">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Aktivitäten
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState message="Lädt Aktivitäten..." />
        ) : !activities || activities.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Keine Aktivitäten"
            description="Sobald Galerien gesendet oder überprüft werden, erscheinen sie hier."
          />
        ) : (
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2">
            {activities.map((activity) => (
              <ActivityItemComponent key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
