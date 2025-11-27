import { useState, useEffect, useRef } from 'react';
import { X, Heart, ChevronLeft, ChevronRight, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Photo } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhotoLightboxProps {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  galleryId: string;
}

export function PhotoLightbox({ photo, photos, onClose, onNavigate, galleryId }: PhotoLightboxProps) {
  const [comment, setComment] = useState(photo.client_comment || '');
  const [stagingRequested, setStagingRequested] = useState(photo.staging_requested);
  const [stagingStyle, setStagingStyle] = useState(photo.staging_style || 'Modern');
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentIndex = photos.findIndex(p => p.id === photo.id);

  // Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && currentIndex < photos.length - 1) {
        // Swiped left - go to next
        onNavigate('next');
      } else if (diff < 0 && currentIndex > 0) {
        // Swiped right - go to previous
        onNavigate('prev');
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Toggle keyboard hints with '?' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setShowKeyboardHints(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const updatePhoto = useMutation({
    mutationFn: async (updates: Partial<Photo>) => {
      const { error } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', photo.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos', galleryId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleSelection = () => {
    updatePhoto.mutate({ is_selected: !photo.is_selected });
  };

  const handleCommentBlur = () => {
    if (comment !== photo.client_comment) {
      updatePhoto.mutate({ client_comment: comment || null });
    }
  };

  const handleStagingToggle = (checked: boolean) => {
    setStagingRequested(checked);
    updatePhoto.mutate({ 
      staging_requested: checked,
      staging_style: checked ? stagingStyle : null,
    });
  };

  const handleStagingStyleChange = (style: string) => {
    setStagingStyle(style);
    if (stagingRequested) {
      updatePhoto.mutate({ staging_style: style });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate('prev');
    if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) onNavigate('next');
    if (e.key === ' ') {
      e.preventDefault();
      toggleSelection();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown as any}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Keyboard Hints Toggle */}
      <button
        onClick={() => setShowKeyboardHints(!showKeyboardHints)}
        className="absolute top-4 left-4 text-white/60 hover:text-white z-10"
        title="Tastaturkürzel anzeigen"
      >
        <Keyboard className="h-6 w-6" />
      </button>

      {/* Keyboard Shortcuts Overlay */}
      {showKeyboardHints && (
        <div className="absolute top-16 left-4 bg-black/80 text-white rounded-lg p-4 z-10 backdrop-blur-sm">
          <h3 className="font-medium mb-3 text-sm">Tastaturkürzel</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">←</kbd>
              <span>Vorheriges Foto</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">→</kbd>
              <span>Nächstes Foto</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">Leertaste</kbd>
              <span>Foto auswählen</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd>
              <span>Schließen</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">?</kbd>
              <span>Diese Hilfe ein/ausblenden</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('prev');
          }}
          className="absolute left-4 text-white hover:text-gray-300 z-10"
        >
          <ChevronLeft className="h-12 w-12" />
        </button>
      )}
      
      {currentIndex < photos.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('next');
          }}
          className="absolute right-4 text-white hover:text-gray-300 z-10"
        >
          <ChevronRight className="h-12 w-12" />
        </button>
      )}

      {/* Content */}
      <div 
        className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 lg:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={photo.storage_url}
            alt={photo.filename}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Controls */}
        <div className="w-full lg:w-80 bg-background rounded-lg p-6 space-y-6 overflow-y-auto">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Foto {currentIndex + 1} von {photos.length}
            </p>
            <p className="text-xs text-muted-foreground">{photo.filename}</p>
          </div>

          {/* Select button */}
          <Button
            onClick={toggleSelection}
            variant={photo.is_selected ? 'default' : 'outline'}
            className="w-full"
            size="lg"
          >
            <Heart 
              className={`h-5 w-5 mr-2 ${photo.is_selected ? 'fill-current' : ''}`} 
            />
            {photo.is_selected ? 'Ausgewählt' : 'Foto auswählen'}
          </Button>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Kommentar (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Notizen oder Feedback zu diesem Foto hinzufügen..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={handleCommentBlur}
              rows={4}
            />
          </div>

          {/* Virtual Staging */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="staging" className="text-base">Virtuelles Staging</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Möbel digital hinzufügen
                </p>
              </div>
              <Switch
                id="staging"
                checked={stagingRequested}
                onCheckedChange={handleStagingToggle}
              />
            </div>

            {stagingRequested && (
              <div className="space-y-2">
                <Label htmlFor="staging-style">Stil</Label>
                <Select value={stagingStyle} onValueChange={handleStagingStyleChange}>
                  <SelectTrigger id="staging-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Scandinavian">Skandinavisch</SelectItem>
                    <SelectItem value="Industrial">Industriell</SelectItem>
                    <SelectItem value="Minimalist">Minimalistisch</SelectItem>
                    <SelectItem value="Traditional">Traditionell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}