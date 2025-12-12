import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { SeoHead } from '@/components/SeoHead';
import { BenefitsCarousel } from '@/components/auth/BenefitsCarousel';
import { FloatingLabelInput } from '@/components/auth/FloatingLabelInput';
import { PasswordRequirements } from '@/components/auth/PasswordRequirements';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const { signIn, signUp, resetPassword, resendVerificationEmail, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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
    setUnverifiedEmail(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.code === 'email_not_verified') {
            setUnverifiedEmail(error.email);
          } else {
            toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Willkommen zurück!', description: 'Sie haben sich erfolgreich angemeldet.' });
        }
      } else {
        const { error, needsVerification, loggedIn } = await signUp(email, password);
        if (error) {
          if (error.code === 'invalid_password') {
            toast({ title: 'Passwort falsch', description: 'Das eingegebene Passwort ist nicht korrekt.', variant: 'destructive' });
            setIsLogin(true);
          } else if (error.code === 'email_not_verified') {
            setUnverifiedEmail(error.email);
          } else {
            toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
          }
        } else if (loggedIn) {
          toast({ title: 'Willkommen zurück!', description: 'Sie wurden erfolgreich angemeldet.' });
        } else if (needsVerification) {
          setShowVerificationMessage(true);
          setEmail('');
          setPassword('');
        }
      }
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
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
        toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'E-Mail gesendet', description: 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie einen Link zum Zurücksetzen.' });
        setIsForgotPassword(false);
        setEmail('');
      }
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      await resendVerificationEmail(unverifiedEmail);
      setResendCooldown(60);
    } finally {
      setResendLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setUnverifiedEmail(null);
    setPassword('');
    setShowPasswordRequirements(false);
  };

  // Verification Message View
  if (showVerificationMessage) {
    return (
      <>
        <SeoHead title="E-Mail bestätigen" />
        <div className="min-h-screen flex">
          <div className="hidden lg:flex lg:w-2/5"><BenefitsCarousel /></div>
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/30">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
              <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Bestätigen Sie Ihre E-Mail</h1>
                <p className="text-muted-foreground mb-6">Wir haben Ihnen eine E-Mail mit einem Bestätigungslink gesendet.</p>
                <Button variant="outline" className="w-full" onClick={() => { setShowVerificationMessage(false); setIsLogin(true); }}>
                  Zurück zur Anmeldung
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <>
        <SeoHead title="Passwort zurücksetzen" />
        <div className="min-h-screen flex">
          <div className="hidden lg:flex lg:w-2/5"><BenefitsCarousel /></div>
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/30">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
              <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl p-8">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Passwort zurücksetzen</h1>
                  <p className="text-muted-foreground">Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link.</p>
                </div>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <FloatingLabelInput type="email" label="E-Mail Adresse" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-5 h-5" />} required disabled={loading} />
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button type="submit" className="w-full h-12 text-base font-medium relative overflow-hidden group" disabled={loading}>
                      <span className="absolute inset-0 overflow-hidden rounded-md"><span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" /></span>
                      {loading ? 'Lädt...' : 'Reset-Link senden'}
                    </Button>
                  </motion.div>
                </form>
                <div className="mt-6 text-center">
                  <button type="button" onClick={() => { setIsForgotPassword(false); setEmail(''); }} className="text-primary font-medium hover:underline text-sm">
                    Zurück zur Anmeldung
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // Main Login/Signup View
  return (
    <>
      <SeoHead title={isLogin ? 'Anmelden' : 'Registrieren'} />
      <div className="min-h-screen flex">
        {/* Left Side - Benefits Carousel */}
        <div className="hidden lg:flex lg:w-2/5">
          <BenefitsCarousel />
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#1a2d4d] via-[#233c63] to-[#2d4a7d] lg:from-background lg:via-background lg:to-muted/30 relative overflow-hidden">
          {/* Mobile: Plus-sign pattern overlay */}
          <div className="absolute inset-0 lg:hidden opacity-[0.03]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="mobile-plus-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 8v24M8 20h24" stroke="white" strokeWidth="1" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mobile-plus-pattern)" />
            </svg>
          </div>

          {/* Mobile: Logo above form */}
          <div className="lg:hidden mb-6 relative z-10">
            <img 
              src="https://ttepglsqnbevhtxrqayq.supabase.co/storage/v1/object/public/branding/logo-dark-1765489216433.png" 
              alt="ImmoOnPoint" 
              className="h-8 w-auto"
            />
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md relative z-10">
            <div className="bg-card/95 lg:bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl p-8">
              {/* Header */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={isLogin ? 'login' : 'signup'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {isLogin ? 'Willkommen zurück' : 'Starten Sie jetzt'}
                  </h1>
                  <p className="text-muted-foreground">
                    {isLogin ? 'Melden Sie sich an, um fortzufahren' : 'Erstellen Sie Ihr kostenloses Konto'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Unverified User Alert */}
              {unverifiedEmail && (
                <Alert className="mb-4">
                  <Mail className="h-4 w-4" />
                  <AlertDescription className="flex flex-col gap-2">
                    <span>Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.</span>
                    <div className="space-y-1">
                      <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={resendLoading || resendCooldown > 0}>
                        {resendLoading ? 'Wird gesendet...' : 'Bestätigungs-E-Mail erneut senden'}
                      </Button>
                      {resendCooldown > 0 && <p className="text-xs text-muted-foreground">Erneut senden in {resendCooldown}s</p>}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <FloatingLabelInput type="email" label="E-Mail Adresse" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-5 h-5" />} autoComplete="email" required disabled={loading} />

                <div>
                  <FloatingLabelInput
                    type={showPassword ? 'text' : 'password'}
                    label="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => !isLogin && setShowPasswordRequirements(true)}
                    icon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  {!isLogin && (
                    <>
                      <PasswordStrengthBar password={password} show={showPasswordRequirements} />
                      <PasswordRequirements password={password} show={showPasswordRequirements} />
                    </>
                  )}
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-sm text-primary hover:text-primary/80 transition-colors" disabled={loading}>
                      Passwort vergessen?
                    </button>
                  </div>
                )}

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button type="submit" className="w-full h-12 text-base font-medium relative overflow-hidden group" disabled={loading}>
                    <span className="absolute inset-0 overflow-hidden rounded-md">
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                    </span>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                        Wird geladen...
                      </span>
                    ) : (
                      isLogin ? 'Anmelden' : 'Registrieren'
                    )}
                  </Button>
                </motion.div>

                {/* Trust Indicator - Signup only */}
                {!isLogin && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span>Ihre Daten sind sicher verschlüsselt</span>
                  </div>
                )}
              </form>

              {/* Mode Switch */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? 'Noch kein Konto?' : 'Bereits registriert?'}{' '}
                  <button type="button" onClick={handleModeSwitch} className="text-primary font-semibold hover:text-primary/80 transition-colors" disabled={loading}>
                    {isLogin ? 'Jetzt registrieren' : 'Anmelden'}
                  </button>
                </p>
              </div>

              {/* Legal Links - Signup only */}
              {!isLogin && (
                <div className="mt-6 text-center text-xs text-muted-foreground">
                  Mit der Registrierung stimmen Sie unseren{' '}
                  <a href="https://www.immoonpoint.de/agb/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AGB</a>
                  {' '}und der{' '}
                  <a href="https://www.immoonpoint.de/datenschutz/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Datenschutzerklärung</a>
                  {' '}zu.
                </div>
              )}
            </div>
          </motion.div>

          {/* Mobile: Trust Badges below form */}
          <div className="lg:hidden mt-6 flex items-center justify-center gap-3 text-white/80 text-xs relative z-10">
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">★</span> 5,0 bei Google
            </span>
            <span className="text-white/40">•</span>
            <span>1.700+ Shootings</span>
          </div>
        </div>
      </div>
    </>
  );
}
