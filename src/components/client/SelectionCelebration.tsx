import { useEffect, useState } from 'react';

interface SelectionCelebrationProps {
  show: boolean;
}

export function SelectionCelebration({ show }: SelectionCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Confetti animation */}
      <div className="animate-scale-in">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-primary rounded-full animate-fade-out"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 12}deg) translateY(-100px)`,
              animationDelay: `${i * 0.05}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Celebration message */}
      <div className="bg-card border-2 border-primary rounded-lg px-8 py-6 shadow-2xl animate-scale-in">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-2xl font-bold text-primary">
            Perfekt!
          </h3>
          <p className="text-muted-foreground">
            Sie haben Ihr Paket vollständig ausgefüllt!
          </p>
        </div>
      </div>
    </div>
  );
}
