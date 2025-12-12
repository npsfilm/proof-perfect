import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { RoleType } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: RoleType | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; needsVerification?: boolean; loggedIn?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper function to fetch user role from database
 */
const fetchUserRole = async (userId: string): Promise<RoleType> => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  return data?.role ?? 'client';
};

/**
 * Helper function to check if user email is verified
 */
const checkEmailVerified = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('profiles')
    .select('email_verified')
    .eq('id', userId)
    .single();
  
  return data?.email_verified ?? false;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<RoleType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Defer all Supabase calls with setTimeout to prevent auth deadlock
        if (session?.user) {
          setTimeout(async () => {
            // Check if email is verified BEFORE allowing login
            const isVerified = await checkEmailVerified(session.user.id);
            
            if (!isVerified) {
              // User hasn't verified email - don't allow login
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setRole(null);
              return;
            }
            
            // Only set user state if email is verified
            setSession(session);
            setUser(session.user);
            fetchUserRole(session.user.id).then(setRole);
          }, 0);
        } else {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Check email verification status
        const isVerified = await checkEmailVerified(session.user.id);
        
        if (!isVerified) {
          // User hasn't verified email - sign them out
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session.user);
        fetchUserRole(session.user.id).then((userRole) => {
          setRole(userRole);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Attempt login directly - Supabase handles the error messages
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    
    if (error) {
      return { error };
    }
    
    // After successful auth, check if email is verified via our custom system
    if (data.user) {
      const isVerified = await checkEmailVerified(data.user.id);
      
      if (!isVerified) {
        // Sign out immediately - they need to verify first
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihr Postfach.',
            code: 'email_not_verified',
            email: normalizedEmail
          } 
        };
      }
    }
    
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Attempt signup directly - Supabase will return error if user exists
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      // Handle "User already registered" error
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        // Try to sign in instead
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        
        if (loginError) {
          // Check if it's a verification issue by checking profiles (only works if user can read their own profile)
          // If login failed, could be wrong password or unverified email
          if (loginError.message?.includes('Invalid login credentials')) {
            return { 
              error: { 
                message: 'Ein Konto mit dieser E-Mail existiert bereits. Das Passwort ist nicht korrekt.',
                code: 'invalid_password',
              } 
            };
          }
          return { error: loginError };
        }
        
        // Login succeeded - but check if email is verified
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isVerified = await checkEmailVerified(session.user.id);
          if (!isVerified) {
            await supabase.auth.signOut();
            return { 
              error: { 
                message: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.',
                code: 'email_not_verified',
                email: normalizedEmail
              } 
            };
          }
        }
        
        // Successfully logged in with verified email
        return { error: null, loggedIn: true };
      }
      
      return { error };
    }

    // If signup successful, send verification email via our custom system
    if (data.user) {
      const { error: verificationError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          user_id: data.user.id,
          email: normalizedEmail,
        },
      });

      if (verificationError) {
        console.error('Failed to send verification email:', verificationError);
        // Don't fail the signup, just log the error
      }

      // Sign out the user immediately - they need to verify email first
      await supabase.auth.signOut();
      
      return { error: null, needsVerification: true };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  const resetPassword = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    const { data, error } = await supabase.functions.invoke('request-password-reset', {
      body: { email: normalizedEmail },
    });

    if (error) {
      return { error };
    }

    if (data?.error) {
      return { error: { message: data.error } };
    }

    return { error: null };
  };

  const resendVerificationEmail = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // We need the user ID to resend - try to look it up via edge function
    // Since we removed userId from the check endpoint for security,
    // the send-verification-email function needs to handle lookup by email
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: { email: normalizedEmail },
    });

    if (error) {
      return { error };
    }

    if (data?.error) {
      return { error: { message: data.error } };
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      role, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword,
      resendVerificationEmail 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
