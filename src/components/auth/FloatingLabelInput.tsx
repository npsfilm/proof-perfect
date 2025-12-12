import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, error, icon, rightIcon, className, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    React.useEffect(() => {
      setHasValue(!!value && String(value).length > 0);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const isFloating = isFocused || hasValue || !!value;

    return (
      <div className="relative">
        <div className={cn(
          "relative flex items-center rounded-lg border bg-background/50 backdrop-blur-sm transition-all duration-200",
          isFocused ? "border-primary ring-2 ring-primary/20" : "border-border",
          error && "border-destructive ring-2 ring-destructive/20",
          className
        )}>
          {icon && (
            <motion.div
              animate={{ color: isFocused ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
              transition={{ duration: 0.2 }}
              className="absolute left-3 pointer-events-none"
            >
              {icon}
            </motion.div>
          )}
          
          <input
            ref={ref}
            value={value}
            {...props}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "peer h-14 w-full bg-transparent px-3 pt-4 pb-1 text-base outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              rightIcon && "pr-10"
            )}
          />
          
          <motion.label
            animate={{
              top: isFloating ? '0.5rem' : '50%',
              fontSize: isFloating ? '0.75rem' : '1rem',
              y: isFloating ? 0 : '-50%',
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute pointer-events-none transition-colors origin-left",
              icon ? "left-10" : "left-3",
              isFocused ? "text-primary" : "text-muted-foreground"
            )}
          >
            {label}
          </motion.label>

          {rightIcon && (
            <div className="absolute right-3">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-destructive flex items-center gap-1"
          >
            <span className="inline-block">⚠</span>
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';
