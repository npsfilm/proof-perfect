import { Home, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Photo } from '@/types/database';
import { STAGING_STYLES } from '@/constants/staging';
import { FinalizePricingSummary } from './FinalizePricingSummary';
import { cn } from '@/lib/utils';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface FinalizeStepStagingProps {
  selectedPhotos: Photo[];
  signedUrls: Record<string, string>;
  photoNumberMap: Record<string, number>;
  stagingSelections: Record<string, boolean>;
  stagingStyle: string;
  stagingComment: string;
  referenceFile: File | undefined;
  expressDelivery: boolean;
  blueHourCount: number;
  onStagingToggle: (photoId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onStyleChange: (style: string) => void;
  onCommentChange: (comment: string) => void;
  onFileChange: (file: File | undefined) => void;
  isMobile: boolean;
}

export function FinalizeStepStaging({
  selectedPhotos,
  signedUrls,
  photoNumberMap,
  stagingSelections,
  stagingStyle,
  stagingComment,
  referenceFile,
  expressDelivery,
  blueHourCount,
  onStagingToggle,
  onSelectAll,
  onDeselectAll,
  onStyleChange,
  onCommentChange,
  onFileChange,
  isMobile,
}: FinalizeStepStagingProps) {
  const { t } = useAnsprache();
  const stagingCount = Object.values(stagingSelections).filter(v => v).length;
  const hasStagingRequests = stagingCount > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onFileChange(file);
  };

  return (
    <>
      <div className="py-6 space-y-6">
        {/* Virtual Staging Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Fotos auswählen</h3>
                <p className="text-sm text-muted-foreground">
                  {stagingCount} von {selectedPhotos.length} Fotos ausgewählt
                </p>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "sm"}
                onClick={onSelectAll}
                className={cn("rounded-full", isMobile ? "min-h-10 text-sm" : "text-xs")}
              >
                Alle auswählen
              </Button>
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "sm"}
                onClick={onDeselectAll}
                className={cn("rounded-full", isMobile ? "min-h-10 text-sm" : "text-xs")}
              >
                Alle abwählen
              </Button>
            </div>
          </div>
          
          {/* Photo Grid */}
          <div className={cn(
            "grid gap-3 max-h-64 overflow-y-auto p-4 bg-background shadow-neu-pressed rounded-xl",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            {selectedPhotos.map((photo) => (
              <div 
                key={photo.id}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all group",
                  stagingSelections[photo.id] && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => onStagingToggle(photo.id, !stagingSelections[photo.id])}
              >
                <img
                  src={signedUrls[photo.id] || photo.storage_url}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-neu-flat-sm">
                  <span className="text-xs font-bold text-foreground">{photoNumberMap[photo.id]}</span>
                </div>
                <div className={cn(
                  "absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all",
                  stagingSelections[photo.id] 
                    ? "bg-primary shadow-lg animate-scale-in" 
                    : "bg-background/80 group-hover:bg-background shadow-neu-flat-sm"
                )}>
                  {stagingSelections[photo.id] && (
                    <Check className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasStagingRequests && (
            <div className="space-y-3">
              <Label htmlFor="staging-style" className="text-base font-semibold">Staging-Stil</Label>
              <Select value={stagingStyle} onValueChange={onStyleChange}>
                <SelectTrigger id="staging-style" className="shadow-neu-pressed rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGING_STYLES.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Shared fields */}
          {hasStagingRequests && (
            <>
              <div className="space-y-3">
                <Label htmlFor="staging-comment" className="text-base font-semibold">
                  Kommentare & Wünsche <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="staging-comment"
                  value={stagingComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder={t('Beschreibe deine Vorstellungen oder besondere Wünsche...', 'Beschreiben Sie Ihre Vorstellungen oder besondere Wünsche...')}
                  rows={3}
                  className="resize-none shadow-neu-pressed rounded-2xl"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="reference-file" className="text-base font-semibold">
                  Referenzbild hochladen <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className={cn(
                  "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group shadow-neu-pressed",
                  "hover:border-primary/50 hover:bg-primary/5",
                  referenceFile && "border-primary bg-primary/5"
                )}>
                  <input
                    id="reference-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="reference-file" className="cursor-pointer block">
                    {referenceFile ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Check className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-primary">{referenceFile.name}</p>
                        <p className="text-xs text-muted-foreground">{t('Klicken zum Ändern', 'Klicken zum Ändern')}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                          <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm font-medium">{t('Klicken zum Hochladen', 'Klicken zum Hochladen')}</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG bis zu 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <FinalizePricingSummary 
        expressDelivery={expressDelivery}
        stagingCount={stagingCount}
        blueHourCount={blueHourCount}
      />
    </>
  );
}
