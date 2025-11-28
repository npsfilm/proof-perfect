import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export function StagingRequestTab() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
      <Card className="shadow-neu-flat">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Nachträgliches Staging anfordern
          </CardTitle>
          <CardDescription>
            Fordern Sie virtuelles Staging für bereits gelieferte Galerien an.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Diese Funktion wird in Kürze verfügbar sein.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
