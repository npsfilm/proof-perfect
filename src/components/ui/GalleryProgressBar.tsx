import { GALLERY_STATUSES, GALLERY_STATUS_ORDER, GalleryStatus } from '@/constants/gallery-status';
import { Calendar, Eye, Lock, Settings, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_ICONS = {
  Planning: Calendar,
  Open: Eye,
  Closed: Lock,
  Processing: Settings,
  Delivered: CheckCircle,
};

interface GalleryProgressBarProps {
  currentStatus: GalleryStatus;
  onStatusClick?: (status: GalleryStatus) => void;
  className?: string;
  compact?: boolean;
}

export function GalleryProgressBar({ 
  currentStatus, 
  onStatusClick, 
  className,
  compact = false 
}: GalleryProgressBarProps) {
  const currentIndex = GALLERY_STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-2">
        {GALLERY_STATUS_ORDER.map((status, index) => {
          const isActive = status === currentStatus;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;
          const statusInfo = GALLERY_STATUSES[status];
          const isClickable = onStatusClick && !compact;

          return (
            <div key={status} className="flex items-center flex-1 min-w-0">
              {/* Step indicator */}
              <button
                onClick={() => isClickable && onStatusClick(status)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 flex-1 min-w-0 transition-all",
                  isClickable && "hover:scale-105 cursor-pointer",
                  !isClickable && "cursor-default"
                )}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center transition-all duration-300",
                    compact ? "w-6 h-6" : "w-10 h-10",
                    isActive && "bg-primary text-primary-foreground scale-110",
                    isCompleted && "bg-primary/20 text-primary",
                    isPending && "bg-muted text-muted-foreground"
                  )}
                >
                  {(() => {
                    const StatusIcon = STATUS_ICONS[status];
                    return <StatusIcon className={cn(compact ? "w-3 h-3" : "w-5 h-5")} />;
                  })()}
                </div>

                {/* Label */}
                {!compact && (
                  <span
                    className={cn(
                      "text-xs font-medium text-center transition-colors line-clamp-2",
                      isActive && "text-foreground",
                      isCompleted && "text-muted-foreground",
                      isPending && "text-muted-foreground/60"
                    )}
                  >
                    {statusInfo.shortLabel}
                  </span>
                )}
              </button>

              {/* Connector line */}
              {index < GALLERY_STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-all duration-300",
                    compact ? "mx-1" : "mx-2",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
