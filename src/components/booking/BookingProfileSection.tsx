import { Clock, MapPin, Calendar } from "lucide-react";

export function BookingProfileSection() {
  return (
    <div className="space-y-6">
      {/* Logo/Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-neu-flat-sm">
          <span className="text-primary-foreground font-bold text-xl">IP</span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">immoonpoint</p>
          <h2 className="text-xl font-semibold text-foreground">Beratungstermin</h2>
        </div>
      </div>

      {/* Duration & Location Badges */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="text-sm">30 Min</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <span className="text-sm">Online / Telefonat</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <span className="text-sm">Kostenlos</span>
        </div>
      </div>

      {/* Description */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Vereinbaren Sie einen kostenlosen Beratungstermin für Ihre 
          Immobilienfotografie. Wir besprechen Ihre Anforderungen und 
          erstellen ein individuelles Angebot.
        </p>
      </div>
    </div>
  );
}
