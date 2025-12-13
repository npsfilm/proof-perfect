import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AuthFormState {
  isLogin: boolean;
  isForgotPassword: boolean;
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  showVerificationMessage: boolean;
  unverifiedEmail: string | null;
  resendLoading: boolean;
  resendCooldown: number;
  showPasswordRequirements: boolean;
}

export function useAuthForm() {
  const [state, setState] = useState<AuthFormState>({
    isLogin: true,
    isForgotPassword: false,
    email: '',
    password: '',
    showPassword: false,
    loading: false,
    showVerificationMessage: false,
    unverifiedEmail: null,
    resendLoading: false,
    resendCooldown: 0,
    showPasswordRequirements: false,
  });

  const { signIn, signUp, resetPassword, resendVerificationEmail, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (state.resendCooldown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, resendCooldown: prev.resendCooldown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.resendCooldown]);

  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email }));
  }, []);

  const setPassword = useCallback((password: string) => {
    setState(prev => ({ ...prev, password }));
  }, []);

  const setShowPassword = useCallback((showPassword: boolean) => {
    setState(prev => ({ ...prev, showPassword }));
  }, []);

  const setShowPasswordRequirements = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showPasswordRequirements: show }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true, unverifiedEmail: null }));

    try {
      if (state.isLogin) {
        const { error } = await signIn(state.email, state.password);
        if (error) {
          if (error.code === 'email_not_verified') {
            setState(prev => ({ ...prev, unverifiedEmail: error.email }));
          } else {
            toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Willkommen zurück!', description: 'Sie haben sich erfolgreich angemeldet.' });
        }
      } else {
        const { error, needsVerification, loggedIn } = await signUp(state.email, state.password);
        if (error) {
          if (error.code === 'invalid_password') {
            toast({ title: 'Passwort falsch', description: 'Das eingegebene Passwort ist nicht korrekt.', variant: 'destructive' });
            setState(prev => ({ ...prev, isLogin: true }));
          } else if (error.code === 'email_not_verified') {
            setState(prev => ({ ...prev, unverifiedEmail: error.email }));
          } else {
            toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
          }
        } else if (loggedIn) {
          toast({ title: 'Willkommen zurück!', description: 'Sie wurden erfolgreich angemeldet.' });
        } else if (needsVerification) {
          setState(prev => ({ ...prev, showVerificationMessage: true, email: '', password: '' }));
        }
      }
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.isLogin, state.email, state.password, signIn, signUp, toast]);

  const handlePasswordReset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await resetPassword(state.email);
      if (error) {
        toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'E-Mail gesendet', description: 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie einen Link zum Zurücksetzen.' });
        setState(prev => ({ ...prev, isForgotPassword: false, email: '' }));
      }
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.email, resetPassword, toast]);

  const handleResendVerification = useCallback(async () => {
    if (!state.unverifiedEmail || state.resendCooldown > 0) return;
    setState(prev => ({ ...prev, resendLoading: true }));
    
    try {
      await resendVerificationEmail(state.unverifiedEmail);
      setState(prev => ({ ...prev, resendCooldown: 60 }));
    } finally {
      setState(prev => ({ ...prev, resendLoading: false }));
    }
  }, [state.unverifiedEmail, state.resendCooldown, resendVerificationEmail]);

  const handleModeSwitch = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLogin: !prev.isLogin,
      unverifiedEmail: null,
      password: '',
      showPasswordRequirements: false,
    }));
  }, []);

  const setIsForgotPassword = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, isForgotPassword: value, email: value ? prev.email : '' }));
  }, []);

  const resetToLogin = useCallback(() => {
    setState(prev => ({ ...prev, showVerificationMessage: false, isLogin: true }));
  }, []);

  return {
    state,
    setEmail,
    setPassword,
    setShowPassword,
    setShowPasswordRequirements,
    setIsForgotPassword,
    handleSubmit,
    handlePasswordReset,
    handleResendVerification,
    handleModeSwitch,
    resetToLogin,
  };
}
