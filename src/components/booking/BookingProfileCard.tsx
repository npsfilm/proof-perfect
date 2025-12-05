import { Clock, Video, MapPin, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface EventType {
  name: string;
  description_plain: string | null;
  duration: number;
  color: string;
}

interface CalendlyUser {
  name: string;
  avatar_url: string | null;
  timezone: string;
}

interface BookingProfileCardProps {
  user: CalendlyUser | undefined;
  eventType: EventType | null;
  isLoading?: boolean;
}

export function BookingProfileCard({
  user,
  eventType,
  isLoading,
}: BookingProfileCardProps) {
  if (isLoading) {
    return (
      <div className="bg-background rounded-3xl shadow-neu-flat p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  
  return (
    <div className="bg-background rounded-3xl shadow-neu-flat p-6 space-y-5">
      {/* User Info */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16 shadow-neu-flat-sm">
          <AvatarImage src={user?.avatar_url || undefined} alt={user?.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg">{user?.name || 'immoonpoint'}</p>
          <p className="text-sm text-muted-foreground">Fotograf</p>
        </div>
      </div>
      
      {/* Event Type Info */}
      {eventType && (
        <>
          <div className="border-t border-border/50 pt-4">
            <h2 className="text-xl font-bold text-foreground">
              {eventType.name}
            </h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span>{eventType.duration} Minuten</span>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground">
              <Video className="w-5 h-5" />
              <span>Online-Meeting</span>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span>Berlin, Deutschland</span>
            </div>
          </div>
          
          {eventType.description_plain && (
            <div className="border-t border-border/50 pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {eventType.description_plain}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
