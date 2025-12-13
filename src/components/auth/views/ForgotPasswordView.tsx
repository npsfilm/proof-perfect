import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SeoHead } from '@/components/SeoHead';
import { BenefitsCarousel } from '@/components/auth/BenefitsCarousel';
import { FloatingLabelInput } from '@/components/auth/FloatingLabelInput';

interface ForgotPasswordViewProps {
  email: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordView({
  email,
  loading,
  onEmailChange,
  onSubmit,
  onBackToLogin,
}: ForgotPasswordViewProps) {
  return (
    <>
      <SeoHead title="Passwort zurücksetzen" />
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-2/5">
          <BenefitsCarousel />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Passwort zurücksetzen</h1>
                <p className="text-muted-foreground">
                  Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link.
                </p>
              </div>
              
              <form onSubmit={onSubmit} className="space-y-4">
                <FloatingLabelInput
                  type="email"
                  label="E-Mail Adresse"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  required
                  disabled={loading}
                />
                
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium relative overflow-hidden group"
                    disabled={loading}
                  >
                    <span className="absolute inset-0 overflow-hidden rounded-md">
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                    </span>
                    {loading ? 'Lädt...' : 'Reset-Link senden'}
                  </Button>
                </motion.div>
              </form>
              
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-primary font-medium hover:underline text-sm"
                >
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
