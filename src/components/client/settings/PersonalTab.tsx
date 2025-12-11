import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
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

  useEffect(() => {
    if (client?.ansprache) {
      setAnsprache(client.ansprache);
    }
  }, [client?.ansprache]);

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
      .update({ ansprache })
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
            disabled={isSaving || ansprache === client?.ansprache}
          >
            {isSaving ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
