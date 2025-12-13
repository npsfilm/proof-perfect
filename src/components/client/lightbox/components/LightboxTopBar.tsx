import { X } from 'lucide-react';
import { LightboxTopBarProps } from '../types';

export function LightboxTopBar({ isFullscreen, onToggleFullscreen, onClose }: LightboxTopBarProps) {
  return (
    <div className="lg:hidden absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent z-10 p-4 flex items-center justify-between">
      <button
        onClick={onToggleFullscreen}
        className="text-white/80 hover:text-white text-sm"
      >
        {isFullscreen ? 'Normal' : 'Vollbild'}
      </button>
      <button
        onClick={onClose}
        className="text-white hover:text-white/80"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}
