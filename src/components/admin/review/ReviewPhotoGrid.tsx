import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare, Wand2, MapPin, Sunrise } from 'lucide-react';
import { Photo } from '@/types/database';

interface ReviewPhotoGridProps {
  selectedPhotos: Photo[];
  allAnnotations: any[];
  signedUrls: Record<string, string>;
}

export function ReviewPhotoGrid({ selectedPhotos, allAnnotations, signedUrls }: ReviewPhotoGridProps) {
  if (!selectedPhotos || selectedPhotos.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ausgewählte Fotos ({selectedPhotos.length})</CardTitle>
        <CardDescription className="text-xs">Vom Kunden gewählte Fotos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {selectedPhotos.map((photo) => {
            const photoAnnotations = allAnnotations?.filter(a => a.photo_id === photo.id) || [];
            
            let borderClass = 'border border-muted';
            if (photo.staging_requested) {
              borderClass = 'border-2 border-primary';
            } else if (photo.blue_hour_requested) {
              borderClass = 'border-2 border-transparent bg-gradient-to-br from-blue-500 to-orange-500 p-0.5';
            }
            
            return (
              <div key={photo.id} className="relative group">
                <div className={`aspect-[4/3] rounded-md overflow-hidden relative ${borderClass}`}>
                  <div className={photo.blue_hour_requested ? 'w-full h-full rounded-sm overflow-hidden' : ''}>
                    <img
                      src={signedUrls[photo.id] || photo.storage_url}
                      alt={photo.filename}
                      className="w-full h-full object-contain bg-muted"
                    />
                  </div>
                  
                  {photoAnnotations.length > 0 && (
                    <TooltipProvider>
                      <div className="absolute inset-0 pointer-events-none">
                        {photoAnnotations.map((annotation, idx) => (
                          <Tooltip key={annotation.id} delayDuration={0}>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute pointer-events-auto cursor-help"
                                style={{
                                  left: `${annotation.x_position}%`,
                                  top: `${annotation.y_position}%`,
                                  transform: 'translate(-50%, -50%)',
                                }}
                              >
                                <div className="relative">
                                  <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold shadow-md border border-background hover:scale-110 transition-transform">
                                    {idx + 1}
                                  </div>
                                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-primary"></div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs" sideOffset={8}>
                              <p className="text-xs font-medium mb-1">Anmerkung {idx + 1}</p>
                              <p className="text-[10px]">{annotation.comment}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                      
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md">
                        {photoAnnotations.length}
                      </div>
                    </TooltipProvider>
                  )}
                </div>
                
                <div className="mt-1 space-y-0.5">
                  <p className="text-[10px] font-mono truncate">{photo.filename}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {photo.staging_requested && (
                      <Badge className="bg-primary/10 text-primary text-[9px] px-1 py-0">
                        <Wand2 className="h-2 w-2 mr-0.5" />
                        {photo.staging_style || 'Modern'}
                      </Badge>
                    )}
                    
                    {photo.blue_hour_requested && (
                      <Badge className="bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 text-[9px] px-1 py-0">
                        <Sunrise className="h-2 w-2 mr-0.5" />
                        Blaue Stunde
                      </Badge>
                    )}
                  </div>
                  
                  {photo.client_comment && (
                    <div className="flex items-start gap-1 text-[10px] text-muted-foreground">
                      <MessageSquare className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{photo.client_comment}</span>
                    </div>
                  )}

                  {photoAnnotations.length > 0 && (
                    <div className="space-y-1 mt-2 pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs font-medium text-primary">
                        <MapPin className="h-3 w-3" />
                        <span>{photoAnnotations.length} Markierung(en)</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        Hover über die Marker im Bild für Details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
