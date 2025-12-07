import { Camera, Clock, Home, Sunset, Check, Sparkles, Upload } from 'lucide-react';
import { Photo } from '@/types/database';

interface FinalizeStepSummaryProps {
  selectedPhotos: Photo[];
  selectedServices: {
    expressDelivery: boolean;
    virtualStaging: boolean;
    blueHour: boolean;
  };
  stagingCount: number;
  blueHourCount: number;
  stagingStyle: string;
  feedback: string;
  referenceFile: File | undefined;
  stagingComment: string;
}

export function FinalizeStepSummary({
  selectedPhotos,
  selectedServices,
  stagingCount,
  blueHourCount,
  stagingStyle,
  feedback,
  referenceFile,
  stagingComment,
}: FinalizeStepSummaryProps) {
  const stagingDiscount = Math.floor(stagingCount / 6) * 89;
  const totalPrice = 
    (selectedServices.expressDelivery ? 99 : 0) + 
    (stagingCount * 89 - stagingDiscount) + 
    (blueHourCount * 49);

  return (
    <div className="py-6 space-y-6">
      {/* Selected Photos Count */}
      <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 shadow-neu-flat">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ausgewählte Fotos</p>
            <p className="text-2xl font-bold text-primary">{selectedPhotos.length} Fotos</p>
          </div>
        </div>
      </div>

      {/* Services Summary */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Gebuchte Zusatzleistungen</h3>
        
        {!selectedServices.expressDelivery && stagingCount === 0 && blueHourCount === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Keine Zusatzleistungen ausgewählt</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedServices.expressDelivery && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background shadow-neu-flat">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">24h Express-Lieferung</p>
                  <p className="text-sm text-muted-foreground">Ihre Fotos in 24 Stunden</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">+99€</p>
                </div>
              </div>
            )}

            {stagingCount > 0 && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background shadow-neu-flat">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Virtuelles Staging</p>
                  <p className="text-sm text-muted-foreground">
                    {stagingCount} {stagingCount === 1 ? 'Foto' : 'Fotos'} · Stil: {stagingStyle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    {stagingCount * 89 - stagingDiscount}€
                  </p>
                  {stagingDiscount > 0 && (
                    <p className="text-xs text-green-600">-{stagingDiscount}€ Rabatt</p>
                  )}
                </div>
              </div>
            )}

            {blueHourCount > 0 && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background shadow-neu-flat">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sunset className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Virtuelle Blaue Stunde</p>
                  <p className="text-sm text-muted-foreground">
                    {blueHourCount} {blueHourCount === 1 ? 'Foto' : 'Fotos'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{blueHourCount * 49}€</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback Preview */}
      {feedback && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Ihr Feedback</h3>
          <div className="p-4 rounded-xl bg-muted/50 shadow-neu-pressed">
            <p className="text-sm leading-relaxed">{feedback}</p>
          </div>
        </div>
      )}

      {/* Reference File Preview */}
      {referenceFile && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Referenzbild</h3>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-background shadow-neu-flat">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{referenceFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(referenceFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comments Preview */}
      {stagingComment && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Kommentare & Wünsche</h3>
          <div className="p-4 rounded-xl bg-muted/50 shadow-neu-pressed">
            <p className="text-sm leading-relaxed">{stagingComment}</p>
          </div>
        </div>
      )}

      {/* Final Price */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl p-6 shadow-neu-float">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Gesamtbetrag</p>
            <p className="text-4xl font-bold text-primary">{totalPrice}€</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        {stagingDiscount > 0 && (
          <div className="mt-4 pt-4 border-t border-primary/20">
            <p className="text-sm text-green-600 font-medium flex items-center gap-2">
              <Check className="h-4 w-4" />
              Sie sparen {stagingDiscount}€ mit dem 5+1 Gratis-Angebot!
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Message */}
      <div className="bg-muted/30 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          ✨ Fast geschafft! Mit einem Klick auf "Jetzt finalisieren" wird Ihre Auswahl an uns übermittelt.
        </p>
      </div>
    </div>
  );
}
