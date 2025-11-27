import { useState } from 'react';
import { X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const currentIndex = photos.findIndex(p => p.id === photo.id);

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
        title: 'Error',
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
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown as any}
      tabIndex={0}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X className="h-8 w-8" />
      </button>

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
              Photo {currentIndex + 1} of {photos.length}
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
            {photo.is_selected ? 'Selected' : 'Select Photo'}
          </Button>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add notes or feedback about this photo..."
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
                <Label htmlFor="staging" className="text-base">Virtual Staging</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Add furniture digitally
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
                <Label htmlFor="staging-style">Style</Label>
                <Select value={stagingStyle} onValueChange={handleStagingStyleChange}>
                  <SelectTrigger id="staging-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Scandinavian">Scandinavian</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Minimalist">Minimalist</SelectItem>
                    <SelectItem value="Traditional">Traditional</SelectItem>
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
