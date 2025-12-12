import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Mail, Bell, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface PersonalTabProps {
  userEmail: string;
  companyName: string | null;
}

export function PersonalTab({ userEmail, companyName }: PersonalTabProps) {
  const { t } = useAnsprache();
  const { data: client } = useClientProfile(userEmail);
  const [ansprache, setAnsprache] = useState(client?.ansprache || 'Sie');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Email preferences state
  const [emailPrefs, setEmailPrefs] = useState({
    newsletter_company: true,
    newsletter_marketing: true,
    order_notifications: true,
    general_info: true,
  });

  useEffect(() => {
    if (client?.ansprache) {
      setAnsprache(client.ansprache);
    }
  }, [client?.ansprache]);

  useEffect(() => {
    if (client) {
      setEmailPrefs({
        newsletter_company: client.email_newsletter_company ?? true,
        newsletter_marketing: client.email_newsletter_marketing ?? true,
        order_notifications: client.email_order_notifications ?? true,
        general_info: client.email_general_info ?? true,
      });
    }
  }, [client]);

  const handleSave = async () => {
    if (!client) {
      toast({
        title: 'Fehler',
        description: 'Kein Client-Profil gefunden.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    const { error } = await supabase
      .from('clients')
      .update({ 
        ansprache,
        email_newsletter_company: emailPrefs.newsletter_company,
        email_newsletter_marketing: emailPrefs.newsletter_marketing,
        email_order_notifications: emailPrefs.order_notifications,
        email_general_info: emailPrefs.general_info,
      })
      .eq('email', userEmail);

    setIsSaving(false);

    if (error) {
      console.error('Save error:', error);
      toast({
        title: 'Fehler',
        description: 'Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Gespeichert',
        description: t('Deine Einstellungen wurden aktualisiert.', 'Ihre Einstellungen wurden aktualisiert.'),
      });
      queryClient.invalidateQueries({ queryKey: ['client-profile'] });
    }
  };

  const handleEmailPrefChange = (key: keyof typeof emailPrefs, checked: boolean) => {
    setEmailPrefs(prev => ({ ...prev, [key]: checked }));
  };

  const hasUnsavedChanges = 
    ansprache !== client?.ansprache ||
    emailPrefs.newsletter_company !== (client?.email_newsletter_company ?? true) ||
    emailPrefs.newsletter_marketing !== (client?.email_newsletter_marketing ?? true) ||
    emailPrefs.order_notifications !== (client?.email_order_notifications ?? true) ||
    emailPrefs.general_info !== (client?.email_general_info ?? true);

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Persönliche Daten</CardTitle>
          <CardDescription>
            {t('Deine Kontaktinformationen', 'Ihre Kontaktinformationen')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vorname</Label>
              <Input value={client?.vorname || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Nachname</Label>
              <Input value={client?.nachname || ''} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label>E-Mail</Label>
            <Input value={userEmail} disabled />
          </div>
          
          {companyName && (
            <div className="pt-2">
              <Label className="text-muted-foreground text-sm">Firmenzugehörigkeit</Label>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary">{companyName}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Ansprache</CardTitle>
          <CardDescription>
            {t('Wähle, wie wir dich ansprechen sollen', 'Wählen Sie, wie wir Sie ansprechen sollen')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            value={ansprache} 
            onValueChange={(value) => setAnsprache(value as 'Du' | 'Sie')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Du" id="du" />
              <Label htmlFor="du" className="cursor-pointer">
                Du (informell)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Sie" id="sie" />
              <Label htmlFor="sie" className="cursor-pointer">
                Sie (formell)
              </Label>
            </div>
          </RadioGroup>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </Button>
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Mail-Benachrichtigungen
          </CardTitle>
          <CardDescription>
            {t('Wähle aus, welche E-Mails du erhalten möchtest', 'Wählen Sie aus, welche E-Mails Sie erhalten möchten')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Newsletter Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Newsletter
            </h4>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter_company"
                  checked={emailPrefs.newsletter_company}
                  onCheckedChange={(checked) => handleEmailPrefChange('newsletter_company', !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="newsletter_company" className="cursor-pointer font-medium">
                    Firmenrelevante Themen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Neuigkeiten und Updates zur Plattform
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter_marketing"
                  checked={emailPrefs.newsletter_marketing}
                  onCheckedChange={(checked) => handleEmailPrefChange('newsletter_marketing', !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="newsletter_marketing" className="cursor-pointer font-medium">
                    Marketing & Tipps
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Tipps für bessere Immobilien-Fotografie
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notifications Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Auftragsbenachrichtigungen
            </h4>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="order_notifications"
                  checked={emailPrefs.order_notifications}
                  onCheckedChange={(checked) => handleEmailPrefChange('order_notifications', !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="order_notifications" className="cursor-pointer font-medium">
                    Bestellbenachrichtigungen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Bestätigungen für neue Aufträge
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 opacity-60">
                <Checkbox
                  id="order_updates"
                  checked={true}
                  disabled
                />
                <div className="space-y-1">
                  <Label htmlFor="order_updates" className="cursor-not-allowed font-medium flex items-center gap-2">
                    Bestellupdates
                    <Lock className="h-3 w-3" />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Statusänderungen {t('zu deinen', 'zu Ihren')} Aufträgen
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Diese Benachrichtigungen können nicht deaktiviert werden
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* General Info Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Sonstiges
            </h4>
            
            <div className="space-y-3 pl-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="general_info"
                  checked={emailPrefs.general_info}
                  onCheckedChange={(checked) => handleEmailPrefChange('general_info', !!checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="general_info" className="cursor-pointer font-medium">
                    Allgemeine Informationen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Wichtige Mitteilungen und Ankündigungen
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
