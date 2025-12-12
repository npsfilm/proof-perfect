import { motion } from 'framer-motion';
import { getPasswordScore } from './PasswordRequirements';

interface PasswordStrengthBarProps {
  password: string;
  show: boolean;
}

const strengthLabels = ['', 'Schwach', 'Mittel', 'Gut', 'Stark', 'Sehr stark'];
const strengthColors = ['', '#ef4444', '#eab308', '#3b82f6', '#22c55e', '#22c55e'];

export function PasswordStrengthBar({ password, show }: PasswordStrengthBarProps) {
  const score = getPasswordScore(password);
  
  if (!show || password.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 space-y-2"
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <motion.div
            key={level}
            className="h-1 flex-1 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: 1,
              backgroundColor: level <= score ? strengthColors[score] : 'hsl(var(--muted))'
            }}
            transition={{ delay: level * 0.05, duration: 0.2 }}
            style={{ originX: 0 }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Passwortstärke</span>
        <span style={{ color: strengthColors[score] }}>{strengthLabels[score]}</span>
      </div>
    </motion.div>
  );
}
