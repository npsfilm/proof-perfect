import { CalendarDays } from 'lucide-react';

export function SchedulerHeader() {
  return (
    <div className="text-center mb-8">
      <CalendarDays className="w-16 h-16 mx-auto text-primary mb-4" />
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
        Termin wählen
      </h2>
      <p className="text-muted-foreground">
        Wählen Sie einen passenden Termin für Ihr Shooting.
      </p>
    </div>
  );
}
