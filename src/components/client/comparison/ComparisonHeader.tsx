import { X, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComparisonHeaderProps } from './types';

export function ComparisonHeader({ 
  viewMode, 
  onViewModeChange, 
  onSwap, 
  onClose 
}: ComparisonHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/50">
      <h2 className="text-white text-lg font-medium">Fotovergleich</h2>
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
          <button 
            onClick={() => onViewModeChange('split')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              viewMode === 'split' ? 'bg-white text-black' : 'text-white hover:bg-white/20'
            }`}
          >
            Nebeneinander
          </button>
          <button 
            onClick={() => onViewModeChange('slider')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              viewMode === 'slider' ? 'bg-white text-black' : 'text-white hover:bg-white/20'
            }`}
          >
            Überblendung
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSwap}
          className="text-white hover:text-white hover:bg-white/20"
        >
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Tauschen
        </Button>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
