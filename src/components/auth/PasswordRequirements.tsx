import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  password: string;
  show: boolean;
}

const requirements = [
  { label: 'Mindestens 6 Zeichen', test: (p: string) => p.length >= 6 },
  { label: 'Ein Großbuchstabe', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Ein Kleinbuchstabe', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Eine Zahl', test: (p: string) => /[0-9]/.test(p) },
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
          <p className="text-xs text-muted-foreground mb-2">Passwort sollte enthalten:</p>
          <div className="space-y-1.5">
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
                  <motion.div
                    animate={{
                      backgroundColor: isMet ? 'hsl(var(--primary))' : 'transparent',
                      borderColor: isMet ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                    }}
                    className="w-4 h-4 rounded-full border flex items-center justify-center"
                  >
                    {isMet ? (
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    ) : (
                      <X className="w-2.5 h-2.5 text-muted-foreground" />
                    )}
                  </motion.div>
                  <span className={isMet ? 'text-foreground' : 'text-muted-foreground'}>
                    {req.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
