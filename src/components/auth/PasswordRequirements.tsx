import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  password: string;
  show: boolean;
}

const requirements = [
  { label: 'Mindestens 8 Zeichen', test: (p: string) => p.length >= 8 },
  { label: 'Ein Großbuchstabe', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Ein Kleinbuchstabe', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Eine Zahl', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Ein Sonderzeichen', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function PasswordRequirements({ password, show }: PasswordRequirementsProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 overflow-hidden"
        >
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground">Passwort-Anforderungen:</p>
            <div className="space-y-1.5 mt-2">
              {requirements.map((req, index) => {
                const isMet = req.test(password);
                return (
                  <motion.div
                    key={req.label}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    {isMet ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={isMet ? 'text-foreground' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function getPasswordScore(password: string): number {
  return requirements.filter(req => req.test(password)).length;
}
