import { Moon, Sun, CloudSun, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BlueHourSlider } from '@/components/client/BlueHourSlider';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useDiscounts } from '@/hooks/useDiscounts';
import blueHourBefore1 from '@/assets/blue-hour-before-1.jpg';
import blueHourAfter1 from '@/assets/blue-hour-after-1.jpg';
import blueHourBefore2 from '@/assets/blue-hour-before-2.jpg';
import blueHourAfter2 from '@/assets/blue-hour-after-2.jpg';

// Get icon component from name
function getIconComponent(iconName: string | null): React.ComponentType<{ className?: string }> {
  if (!iconName) return CloudSun;
  const Icon = (LucideIcons as any)[iconName];
  return Icon || CloudSun;
}

// Map service slugs to icon colors
const ICON_COLORS: Record<string, string> = {
  'virtuelle-blaue-stunde': 'text-info',
  'blue-hour': 'text-info',
  'sommer-winter': 'text-success',
  'summer-winter': 'text-success',
  'regen-sonne': 'text-warning',
  'rain-sun': 'text-warning',
};

export default function VirtualEditing() {
  const navigate = useNavigate();
  const { data: services, isLoading } = useServices({ showIn: 'virtual_editing' });
  const { data: discounts } = useDiscounts();

  // Find buy X get Y discount
  const bulkDiscount = discounts?.find(d => 
    d.discount_type === 'buy_x_get_y' && d.is_active
  );

  return (
    <div className="container max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-8">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12 animate-fade-in">
        <Badge variant="secondary" className="mb-3 md:mb-4">
          <CloudSun className="h-3 w-3 mr-1" />
          Virtuelle Bearbeitung
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
          Verwandeln Sie Ihre Immobilienfotos
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
          Professionelle Bildbearbeitung für maximale Wirkung. 
          Blaue Stunde, Jahreszeiten-Transformation und mehr.
        </p>
      </div>

      {/* Blue Hour Demo */}
      <Card className="mb-8 md:mb-12 overflow-hidden animate-fade-in">
        <CardHeader className="text-center pb-2 px-4 md:px-6">
          <CardTitle className="flex items-center justify-center gap-2 text-base md:text-lg">
            <Moon className="h-4 w-4 md:h-5 md:w-5 text-info" />
            Virtuelle Blaue Stunde – Vorher / Nachher
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Ziehen Sie den Regler, um den Unterschied zu sehen
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <BlueHourSlider
              beforeImage={blueHourBefore1}
              afterImage={blueHourAfter1}
            />
            <BlueHourSlider
              beforeImage={blueHourBefore2}
              afterImage={blueHourAfter2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        {isLoading ? (
          // Loading skeletons
          [1, 2, 3].map(i => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader>
                <Skeleton className="w-12 h-12 rounded-full mb-4" />
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          services?.map((service, index) => {
            const Icon = getIconComponent(service.icon_name);
            const iconColor = ICON_COLORS[service.slug] || 'text-primary';
            const priceInEuros = service.price_cents / 100;
            const features = Array.isArray(service.features) ? service.features : [];
            const gradientClass = service.gradient_class || 'from-primary/20 via-primary/10 to-secondary/20';

            return (
              <Card 
                key={service.id} 
                className={`relative overflow-hidden animate-fade-in bg-gradient-to-br ${gradientClass}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center mb-4">
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">{priceInEuros}€</span>
                    <span className="text-muted-foreground ml-1">
                      {service.price_type === 'per_image' ? 'pro Bild' : 
                       service.price_type === 'per_room' ? 'pro Raum' : ''}
                    </span>
                  </div>
                  {features.length > 0 && (
                    <ul className="space-y-2">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-success flex-shrink-0" />
                          {String(feature)}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pricing Info */}
      {bulkDiscount && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 animate-fade-in">
          <CardContent className="p-4 md:p-8 text-center">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Mengenrabatt</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              Bei {bulkDiscount.buy_quantity} oder mehr Bildern erhalten Sie{' '}
              <span className="font-semibold text-primary">{bulkDiscount.free_quantity} Bild gratis</span>!
            </p>
            <Button onClick={() => navigate('/?tab=staging')} size="default" className="w-full sm:w-auto">
              Jetzt Staging anfordern
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
