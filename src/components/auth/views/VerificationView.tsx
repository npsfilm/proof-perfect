import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SeoHead } from '@/components/SeoHead';
import { BenefitsCarousel } from '@/components/auth/BenefitsCarousel';

interface VerificationViewProps {
  onBackToLogin: () => void;
}

export function VerificationView({ onBackToLogin }: VerificationViewProps) {
  return (
    <>
      <SeoHead title="E-Mail bestätigen" />
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
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Bestätigen Sie Ihre E-Mail</h1>
              <p className="text-muted-foreground mb-6">
                Wir haben Ihnen eine E-Mail mit einem Bestätigungslink gesendet.
              </p>
              <Button variant="outline" className="w-full" onClick={onBackToLogin}>
                Zurück zur Anmeldung
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
