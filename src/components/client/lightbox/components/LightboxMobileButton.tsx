import { Menu } from 'lucide-react';

interface LightboxMobileButtonProps {
  onClick: () => void;
}

export function LightboxMobileButton({ onClick }: LightboxMobileButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-20 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
    >
      <Menu className="h-5 w-5" />
      <span>Aktionen</span>
    </button>
  );
}
