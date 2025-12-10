import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Client } from '@/types/database';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ClientSettingsTabProps {
  client: Client | null;
  userEmail: string;
}

export function ClientSettingsTab({ client, userEmail }: ClientSettingsTabProps) {
  const [ansprache, setAnsprache] = useState(client?.ansprache || 'Sie');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!client) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('clients')
      .update({ ansprache })
      .eq('id', client.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Einstellungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Gespeichert',
        description: 'Ihre Einstellungen wurden aktualisiert.',
      });
      queryClient.invalidateQueries({ queryKey: ['client-profile'] });
    }
  };

  return (
    <div className="container mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-8 max-w-4xl space-y-4 md:space-y-6">
      <Card className="shadow-neu-flat">
        <CardHeader>
          <CardTitle>Persönliche Daten</CardTitle>
          <CardDescription>
            Ihre Kontaktinformationen
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
        </CardContent>
      </Card>

      <Card className="shadow-neu-flat">
        <CardHeader>
          <CardTitle>Ansprache</CardTitle>
          <CardDescription>
            Wählen Sie, wie wir Sie ansprechen sollen
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
