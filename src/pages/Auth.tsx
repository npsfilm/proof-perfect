import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle2 } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<{ userId: string; email: string } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { signIn, signUp, resetPassword, resendVerificationEmail, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowVerificationMessage(false);
    setUnverifiedUser(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.code === 'email_not_verified') {
            setUnverifiedUser({ userId: error.userId, email: error.email });
            setShowVerificationMessage(false);
          } else {
            toast({
              title: 'Fehler',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Willkommen zurück!',
            description: 'Sie haben sich erfolgreich angemeldet.',
          });
        }
      } else {
        const { error, needsVerification } = await signUp(email, password);
        
        if (error) {
          toast({
            title: 'Fehler',
            description: error.message,
            variant: 'destructive',
          });
        } else if (needsVerification) {
          setShowVerificationMessage(true);
          setEmail('');
          setPassword('');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          title: 'Fehler',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'E-Mail gesendet',
          description: 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie einen Link zum Zurücksetzen.',
        });
        setIsForgotPassword(false);
        setEmail('');
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser || resendCooldown > 0) return;
    
    setResendLoading(true);
    try {
      await resendVerificationEmail(unverifiedUser.userId, unverifiedUser.email);
      // Start 60 second cooldown regardless of result
      setResendCooldown(60);
    } finally {
      setResendLoading(false);
    }
  };

  // Show verification success message after signup
  if (showVerificationMessage) {
    return (
      <>
        <SeoHead title="E-Mail bestätigen" />
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Bestätigen Sie Ihre E-Mail</CardTitle>
            <CardDescription>
              Wir haben Ihnen eine E-Mail mit einem Bestätigungslink gesendet. Bitte überprüfen Sie Ihr Postfach.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Der Link ist 24 Stunden gültig. Nach der Bestätigung können Sie sich anmelden.
              </AlertDescription>
            </Alert>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowVerificationMessage(false);
                setIsLogin(true);
              }}
            >
              Zurück zur Anmeldung
            </Button>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <>
        <SeoHead title="Passwort zurücksetzen" />
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Passwort zurücksetzen
            </CardTitle>
            <CardDescription>
              Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Lädt...' : 'Reset-Link senden'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setEmail('');
                }}
                className="text-primary hover:underline"
                disabled={loading}
              >
                Zurück zur Anmeldung
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
    );
  }

  // Login / Sign Up View
  return (
    <>
      <SeoHead title={isLogin ? 'Anmelden' : 'Registrieren'} />
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Anmelden' : 'Konto erstellen'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Geben Sie Ihre Zugangsdaten ein, um auf Ihr Konto zuzugreifen' 
              : 'Geben Sie Ihre Daten ein, um ein neues Konto zu erstellen'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unverifiedUser && (
            <Alert className="mb-4">
              <Mail className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                <span>Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.</span>
                <div className="space-y-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResendVerification}
                    disabled={resendLoading || resendCooldown > 0}
                  >
                    {resendLoading ? 'Wird gesendet...' : 'Bestätigungs-E-Mail erneut senden'}
                  </Button>
                  {resendCooldown > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Erneut senden in {resendCooldown}s
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-primary hover:underline"
                    disabled={loading}
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Geben Sie Ihr Passwort ein"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Lädt...' : (isLogin ? 'Anmelden' : 'Registrieren')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setUnverifiedUser(null);
              }}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isLogin ? "Noch kein Konto? Registrieren" : 'Bereits ein Konto? Anmelden'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
