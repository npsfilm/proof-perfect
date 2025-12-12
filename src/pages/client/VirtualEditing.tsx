import { Moon, CloudSun, Check, Sofa, Bed, ChefHat, Bath, Briefcase, UtensilsCrossed, Upload, Palette, Send, ImageDown, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BlueHourSlider } from '@/components/client/BlueHourSlider';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useDiscounts } from '@/hooks/useDiscounts';
import { useStagingStyles } from '@/hooks/useStagingStyles';
import { useRoomTypes } from '@/hooks/useRoomTypes';
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
  'virtuelles-staging': 'text-primary',
};

// Room type icons
const ROOM_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'wohnzimmer': Sofa,
  'schlafzimmer': Bed,
  'kueche': ChefHat,
  'bad': Bath,
  'home-office': Briefcase,
  'esszimmer': UtensilsCrossed,
};

// Process steps
const PROCESS_STEPS = [
  { icon: Upload, title: 'Fotos auswählen', description: 'Wählen Sie die Bilder aus Ihrer Galerie' },
  { icon: Palette, title: 'Stil wählen', description: 'Bestimmen Sie Raumtyp und Einrichtungsstil' },
  { icon: Send, title: 'Anfrage senden', description: 'Wir bearbeiten Ihre Bestellung' },
  { icon: ImageDown, title: 'Ergebnis erhalten', description: 'Fertige Bilder in 24-48h' },
];

export default function VirtualEditing() {
  const navigate = useNavigate();
  const { data: services, isLoading } = useServices({ showIn: 'virtual_editing' });
  const { data: discounts } = useDiscounts();
  const { data: stagingStyles, isLoading: stylesLoading } = useStagingStyles();
  const { data: roomTypes, isLoading: roomsLoading } = useRoomTypes();

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

            return (
              <Card 
                key={service.id} 
                className="relative overflow-hidden animate-fade-in bg-card hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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

      {/* Staging Styles Section */}
      <div className="mb-8 md:mb-12 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Unsere Staging-Stile</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Von Modern bis Farmhouse – für jeden Geschmack der richtige Look
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {stylesLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))
          ) : (
            stagingStyles?.map((style) => (
              <Card key={style.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                {style.thumbnail_url ? (
                  <div className="aspect-[4/3] relative">
                    <img 
                      src={style.thumbnail_url} 
                      alt={style.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="font-medium text-white text-sm">{style.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                    <div className="text-center p-4">
                      <Palette className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="font-medium text-sm">{style.name}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Room Types Section */}
      <div className="mb-8 md:mb-12 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Unterstützte Raumtypen</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Virtuelles Staging für alle Räume Ihrer Immobilie
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
          {roomsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))
          ) : (
            roomTypes?.map((room) => {
              const Icon = ROOM_TYPE_ICONS[room.slug] || Sofa;
              return (
                <Card key={room.id} className="p-3 md:p-4 text-center hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <p className="text-xs md:text-sm font-medium text-foreground">{room.name}</p>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Process Section */}
      <Card className="mb-8 md:mb-12 animate-fade-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl md:text-2xl">So funktioniert's</CardTitle>
          <CardDescription>In 4 einfachen Schritten zu Ihren virtuell eingerichteten Bildern</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <step.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <div className="text-xs md:text-sm font-semibold text-primary mb-1">Schritt {index + 1}</div>
                <h4 className="text-sm md:text-base font-medium text-foreground mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Info */}
      {bulkDiscount && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 animate-fade-in mb-8 md:mb-12">
          <CardContent className="p-4 md:p-8 text-center">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Mengenrabatt</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              Bei {bulkDiscount.buy_quantity} oder mehr Bildern erhalten Sie{' '}
              <span className="font-semibold text-primary">{bulkDiscount.free_quantity} Bild gratis</span>!
            </p>
          </CardContent>
        </Card>
      )}

      {/* CTA Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 animate-fade-in">
        <CardContent className="p-6 md:p-10 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Bereit für beeindruckende Immobilienfotos?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6">
            Starten Sie jetzt mit der virtuellen Bearbeitung Ihrer Bilder
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/?tab=staging')} size="lg" className="gap-2">
              Jetzt Staging anfordern
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" size="lg">
              Meine Galerien
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
