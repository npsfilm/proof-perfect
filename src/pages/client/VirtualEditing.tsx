import { Moon, CloudSun, Check, Sofa, Bed, ChefHat, Bath, Briefcase, UtensilsCrossed, Upload, Palette, Send, ImageDown, ArrowRight, Gift, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  { icon: Upload, title: 'Fotos auswählen' },
  { icon: Palette, title: 'Stil wählen' },
  { icon: Send, title: 'Anfrage senden' },
  { icon: ImageDown, title: 'Ergebnis erhalten' },
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
    <div className="container max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-8">
      {/* Hero Section with CTA */}
      <div className="text-center mb-10 md:mb-14 animate-fade-in">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="h-3 w-3 mr-1" />
          Virtuelle Bearbeitung
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
          Verwandeln Sie Ihre Immobilienfotos
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto mb-6">
          Professionelle Bildbearbeitung für maximale Wirkung – 
          Blaue Stunde, virtuelles Staging und mehr.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/?tab=staging')} size="lg" className="gap-2">
            Jetzt Staging anfordern
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigate('#services')} variant="outline" size="lg">
            Preise ansehen
          </Button>
        </div>
      </div>

      {/* Blue Hour Demo */}
      <div className="mb-10 md:mb-14 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-info mb-2">
            <Moon className="h-5 w-5" />
            <span className="font-semibold">Virtuelle Blaue Stunde</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ziehen Sie den Regler, um den Unterschied zu sehen
          </p>
        </div>
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
        <div className="text-center mt-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/?tab=staging')} className="text-info hover:text-info">
            Blue Hour für meine Fotos anfordern →
          </Button>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="mb-10 md:mb-14 animate-fade-in scroll-mt-20">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Unsere Services</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Professionelle Bildbearbeitung für jede Anforderung
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {isLoading ? (
            [1, 2].map(i => (
              <Card key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-10 w-20" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
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
                  className="p-5 md:p-6 animate-fade-in hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className={`h-6 w-6 md:h-7 md:w-7 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">{service.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-2xl md:text-3xl font-bold text-foreground">{priceInEuros}€</span>
                      <span className="block text-xs text-muted-foreground">
                        {service.price_type === 'per_image' ? 'pro Bild' : 
                         service.price_type === 'per_room' ? 'pro Raum' : ''}
                      </span>
                    </div>
                  </div>
                  
                  {features.length > 0 && (
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
                      {features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-success flex-shrink-0" />
                          <span className="truncate">{String(feature)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/?tab=staging')}
                  >
                    Jetzt buchen
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Bulk Discount Banner */}
      {bulkDiscount && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-5 md:p-6 text-center mb-10 md:mb-14 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-xl md:text-2xl font-bold">Mengenrabatt: {bulkDiscount.buy_quantity}+{bulkDiscount.free_quantity}</span>
          </div>
          <p className="text-sm md:text-base opacity-90">
            Kaufen Sie {bulkDiscount.buy_quantity} Bilder und erhalten Sie {bulkDiscount.free_quantity} gratis!
          </p>
        </div>
      )}

      {/* Staging Options with Tabs */}
      <div className="mb-10 md:mb-14 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Staging-Optionen</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Wählen Sie aus verschiedenen Stilen und Raumtypen
          </p>
        </div>
        
        <Tabs defaultValue="styles" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="styles">Einrichtungsstile</TabsTrigger>
            <TabsTrigger value="rooms">Raumtypen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="styles">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
              {stylesLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))
              ) : (
                stagingStyles?.map((style) => (
                  <div key={style.id} className="group cursor-pointer">
                    {style.thumbnail_url ? (
                      <div className="aspect-square relative rounded-lg overflow-hidden">
                        <img 
                          src={style.thumbnail_url} 
                          alt={style.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 md:p-2">
                          <p className="font-medium text-white text-[9px] md:text-xs truncate text-center">{style.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center p-1">
                          <Palette className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                          <p className="font-medium text-[8px] md:text-[10px] truncate">{style.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="rooms">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
              {roomsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))
              ) : (
                roomTypes?.map((room) => {
                  const Icon = ROOM_TYPE_ICONS[room.slug] || Sofa;
                  return (
                    <Card key={room.id} className="p-3 md:p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <p className="text-xs md:text-sm font-medium text-foreground">{room.name}</p>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Horizontal Process Steps */}
      <div className="mb-10 md:mb-14 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">So funktioniert's</h2>
        </div>
        <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
          {PROCESS_STEPS.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <step.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <p className="font-medium text-xs md:text-sm text-foreground">{step.title}</p>
              </div>
              {index < PROCESS_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-primary/30 mx-2 md:mx-4 min-w-[20px] md:min-w-[40px]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/15 rounded-2xl p-6 md:p-10 text-center animate-fade-in">
        <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary mx-auto mb-4" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Bereit für beeindruckende Immobilienfotos?
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-lg mx-auto">
          Starten Sie jetzt mit der virtuellen Bearbeitung und überzeugen Sie Ihre Kunden mit professionellen Bildern.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/?tab=staging')} size="lg" className="gap-2 shadow-lg">
            Jetzt Staging anfordern
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" size="lg">
            Meine Galerien
          </Button>
        </div>
      </div>
    </div>
  );
}
