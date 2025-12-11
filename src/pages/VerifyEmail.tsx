import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { supportEmail } = useBranding();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Kein Bestätigungstoken gefunden');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-email', {
          body: { token },
        });

        if (error) {
          setStatus('error');
          setErrorMessage(error.message || 'Fehler bei der Bestätigung');
          return;
        }

        if (data?.error) {
          setStatus('error');
          setErrorMessage(data.error);
          return;
        }

        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Ein unerwarteter Fehler ist aufgetreten');
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">E-Mail wird bestätigt...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Bestätigung fehlgeschlagen</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => navigate('/auth')} className="w-full">
              Zur Anmeldung
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Falls Sie Probleme haben, kontaktieren Sie uns unter {supportEmail}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">E-Mail bestätigt!</CardTitle>
          <CardDescription>
            Ihre E-Mail-Adresse wurde erfolgreich bestätigt. Sie können sich jetzt anmelden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/auth')} className="w-full">
            Jetzt anmelden
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
