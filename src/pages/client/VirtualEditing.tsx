import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientHeader } from '@/components/client/ClientHeader';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useAuth } from '@/contexts/AuthContext';
import { BlueHourSlider } from '@/components/client/BlueHourSlider';
import blueHourBefore1 from '@/assets/blue-hour-before-1.jpg';
import blueHourAfter1 from '@/assets/blue-hour-after-1.jpg';
import blueHourBefore2 from '@/assets/blue-hour-before-2.jpg';
import blueHourAfter2 from '@/assets/blue-hour-after-2.jpg';

const services = [
  {
    id: 'blue_hour',
    title: 'Virtuelle Blaue Stunde',
    icon: Moon,
    description: 'Verwandeln Sie Ihre Immobilienfotos in stimmungsvolle Dämmerungsaufnahmen mit warmem Innenlicht.',
    price: 29,
    priceUnit: 'pro Bild',
    features: [
      'Realistische Dämmerungsstimmung',
      'Warmes Innenlicht durch Fenster',
      'Dramatischer Himmel',
      'Professionelle Farbkorrektur',
    ],
    gradient: 'from-blue-600/20 via-orange-500/10 to-purple-600/20',
    iconColor: 'text-blue-500',
  },
  {
    id: 'summer_winter',
    title: 'Sommer-Winter Transformation',
    icon: Sun,
    description: 'Zeigen Sie Ihre Immobilie in der besten Jahreszeit – unabhängig davon, wann die Fotos aufgenommen wurden.',
    price: 39,
    priceUnit: 'pro Bild',
    features: [
      'Schnee zu grünem Rasen',
      'Kahle zu belaubten Bäumen',
      'Saisonale Anpassung',
      'Natürliche Ergebnisse',
    ],
    gradient: 'from-green-500/20 via-yellow-500/10 to-emerald-600/20',
    iconColor: 'text-green-500',
  },
  {
    id: 'sky_replacement',
    title: 'Himmel-Austausch',
    icon: Sparkles,
    description: 'Ersetzen Sie graue, bewölkte Himmel durch strahlend blaue Himmel mit weißen Wolken.',
    price: 19,
    priceUnit: 'pro Bild',
    features: [
      'Blauer Himmel mit Wolken',
      'Natürliche Reflexionen',
      'Passende Beleuchtung',
      'Schnelle Bearbeitung',
    ],
    gradient: 'from-sky-500/20 via-blue-400/10 to-cyan-500/20',
    iconColor: 'text-sky-500',
  },
];

export default function VirtualEditing() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: clientProfile } = useClientProfile(user?.email);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader 
        client={clientProfile || null}
        onSignOut={handleSignOut}
      />

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Virtuelle Bearbeitung
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Verwandeln Sie Ihre Immobilienfotos
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professionelle Bildbearbeitung für maximale Wirkung. 
            Blaue Stunde, Jahreszeiten-Transformation und mehr.
          </p>
        </div>

        {/* Blue Hour Demo */}
        <Card className="mb-12 overflow-hidden animate-fade-in">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2">
              <Moon className="h-5 w-5 text-blue-500" />
              Virtuelle Blaue Stunde – Vorher / Nachher
            </CardTitle>
            <CardDescription>
              Ziehen Sie den Regler, um den Unterschied zu sehen
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
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
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <Card 
              key={service.id} 
              className={`relative overflow-hidden animate-fade-in bg-gradient-to-br ${service.gradient}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-full bg-background/80 flex items-center justify-center mb-4`}>
                  <service.icon className={`h-6 w-6 ${service.iconColor}`} />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">{service.price}€</span>
                  <span className="text-muted-foreground ml-1">{service.priceUnit}</span>
                </div>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Info */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 animate-fade-in">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Mengenrabatt</h3>
            <p className="text-muted-foreground mb-4">
              Bei 5 oder mehr Bildern erhalten Sie <span className="font-semibold text-primary">1 Bild gratis</span>!
            </p>
            <Button onClick={() => navigate('/?tab=staging')} size="lg">
              Jetzt Staging anfordern
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
