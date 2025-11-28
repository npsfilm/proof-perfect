import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      } else {
        toast({
          title: 'Ungültiger Link',
          description: 'Der Passwort-Reset-Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/auth'), 2000);
      }
    });
  }, [navigate, toast]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    if (pwd.length > 72) {
      return 'Passwort darf maximal 72 Zeichen lang sein';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: 'Fehler',
        description: passwordError,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast({
        title: 'Fehler',
        description: 'Passwörter stimmen nicht überein',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast({
          title: 'Fehler',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Passwort erfolgreich geändert',
          description: 'Ihr Passwort wurde erfolgreich aktualisiert. Sie werden zur Anmeldeseite weitergeleitet.',
        });
        
        // Sign out and redirect to login
        await supabase.auth.signOut();
        setTimeout(() => navigate('/auth'), 2000);
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

  // Show loading state while validating session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Überprüfe Link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordStrength = password.length === 0 ? '' : 
    password.length < 6 ? 'schwach' :
    password.length < 10 ? 'mittel' : 'stark';

  const strengthColor = 
    passwordStrength === 'schwach' ? 'text-destructive' :
    passwordStrength === 'mittel' ? 'text-yellow-500' :
    passwordStrength === 'stark' ? 'text-green-500' : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Neues Passwort setzen
          </CardTitle>
          <CardDescription>
            Geben Sie Ihr neues Passwort ein, um Ihren Zugang wiederherzustellen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mindestens 6 Zeichen"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  maxLength={72}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <p className={`text-xs ${strengthColor}`}>
                  Passwortstärke: {passwordStrength}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Passwort erneut eingeben"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  maxLength={72}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && password === confirmPassword && (
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Passwörter stimmen überein</span>
                </div>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium">Passwort-Anforderungen:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1">
                  {password.length >= 6 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                  )}
                  Mindestens 6 Zeichen
                </li>
                <li className="flex items-center gap-1">
                  {password === confirmPassword && password.length > 0 ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-muted-foreground" />
                  )}
                  Passwörter müssen übereinstimmen
                </li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading || password.length < 6 || password !== confirmPassword}>
              {loading ? 'Lädt...' : 'Passwort ändern'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline"
              disabled={loading}
            >
              Zurück zur Anmeldung
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
