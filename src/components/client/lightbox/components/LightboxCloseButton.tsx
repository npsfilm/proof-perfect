import { X } from 'lucide-react';

interface LightboxCloseButtonProps {
  onClose: () => void;
}

export function LightboxCloseButton({ onClose }: LightboxCloseButtonProps) {
  return (
    <button
      onClick={onClose}
      className="hidden lg:block absolute top-4 right-4 text-white hover:text-gray-300 z-10"
    >
      <X className="h-8 w-8" />
    </button>
  );
}
