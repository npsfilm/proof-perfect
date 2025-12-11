import { Button } from '@/components/ui/button';
import { ComparisonModeInstructionsProps, Orientation } from './types';
import { useAnsprache } from '@/contexts/AnspracheContext';

export function ComparisonModeInstructions({
  comparisonPhotos,
  firstComparisonOrientation,
  onStartComparison,
  onCancel,
}: ComparisonModeInstructionsProps) {
  const { t } = useAnsprache();
  
  const getOrientationLabel = () => {
    switch (firstComparisonOrientation) {
      case 'portrait':
        return 'Hochformat';
      case 'landscape':
        return 'Querformat';
      case 'square':
        return 'quadratisches';
      default:
        return '';
    }
  };

  const getInstructionText = () => {
    if (comparisonPhotos.length === 0) {
      return t('Wähle das erste Foto zum Vergleichen', 'Wählen Sie das erste Foto zum Vergleichen');
    }
    if (comparisonPhotos.length === 1) {
      return t(`Wähle ein weiteres ${getOrientationLabel()}-Foto`, `Wählen Sie ein weiteres ${getOrientationLabel()}-Foto`);
    }
    return 'Bereit zum Vergleichen!';
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 shadow-neu-flat-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-neu-flat-sm">
            {comparisonPhotos.length}/2
          </div>
          <div>
            <p className="font-semibold text-primary">Vergleichsmodus aktiv</p>
            <p className="text-sm text-muted-foreground">{getInstructionText()}</p>
            {firstComparisonOrientation && comparisonPhotos.length === 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                Nur Fotos mit gleichem Format können verglichen werden
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {comparisonPhotos.length === 2 && (
            <Button onClick={onStartComparison}>
              Bilder vergleichen
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  );
}
