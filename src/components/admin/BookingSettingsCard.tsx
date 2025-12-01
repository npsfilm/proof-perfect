import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

interface BookingSettings {
  calendar_id: string;
  calendar_name: string;
  updated_at: string;
}

export function BookingSettingsCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>('');

  useEffect(() => {
    fetchSettings();
    fetchGoogleClientId();
  }, []);

  const fetchGoogleClientId = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-booking/config');
      if (error) throw error;
      setGoogleClientId(data.clientId);
    } catch (error) {
      console.error('Error fetching Google Client ID:', error);
    }
  };

  useEffect(() => {
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'booking_settings') {
      handleOAuthCallback(code);
    }
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('booking_settings')
        .select('calendar_id, calendar_name, updated_at')
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching booking settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    if (!googleClientId) {
      toast.error('Google Client ID nicht konfiguriert');
      return;
    }
    
    const redirectUri = `${window.location.origin}/admin/settings`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(SCOPES)}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=booking_settings`;
    
    window.location.href = authUrl;
  };

  const handleOAuthCallback = async (code: string) => {
    try {
      setIsConnecting(true);
      const redirectUri = `${window.location.origin}/admin/settings`;

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('Nicht authentifiziert');
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-calendar-booking/connect', {
        body: { code, redirectUri },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (error) throw error;

      toast.success('Google-Kalender erfolgreich verbunden!');
      
      // Clean up URL
      window.history.replaceState({}, document.title, '/admin/settings');
      
      // Refresh settings
      await fetchSettings();
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error('Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { error } = await supabase
        .from('booking_settings')
        .delete()
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      setSettings(null);
      toast.success('Google-Kalender getrennt');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Trennung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isConnecting) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isConnecting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Buchungssystem - Google-Kalender
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verbindung wird hergestellt...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Buchungssystem - Google-Kalender
        </CardTitle>
        <CardDescription>
          Verbinden Sie Ihren Google-Kalender, damit Kunden über /buchung Termine buchen können.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Verbunden mit Google-Kalender</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Kalender: {settings.calendar_name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Zuletzt aktualisiert: {new Date(settings.updated_at).toLocaleString('de-DE')}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">Öffentliche Buchungsseite aktiv</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Kunden können jetzt über <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">/buchung</span> Termine buchen.
                    Die Termine werden automatisch in Ihrem Google-Kalender erstellt.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              Google-Kalender trennen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100">Noch nicht konfiguriert</p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    Verbinden Sie Ihren Google-Kalender, um das Buchungssystem zu aktivieren.
                    Termine werden automatisch in Ihrem Hauptkalender erstellt.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleConnect} className="w-full" size="lg">
              <Calendar className="h-5 w-5 mr-2" />
              Mit Google-Kalender verbinden
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
