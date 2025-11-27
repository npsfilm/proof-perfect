import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, FileCheck, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Gallery } from '@/types/database';

interface AdminPreviewOverlayProps {
  gallery: Gallery;
  selectedCount: number;
  totalCount: number;
}

export function AdminPreviewOverlay({ gallery, selectedCount, totalCount }: AdminPreviewOverlayProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const minimized = sessionStorage.getItem('admin-overlay-minimized') === 'true';
    setIsMinimized(minimized);
  }, []);

  const handleMinimize = () => {
    setIsMinimized(true);
    sessionStorage.setItem('admin-overlay-minimized', 'true');
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    sessionStorage.setItem('admin-overlay-minimized', 'false');
  };

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('admin-overlay-closed', 'true');
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
        <Button
          onClick={handleMaximize}
          className="shadow-neu-float rounded-full h-14 w-14 bg-primary hover:bg-primary/90"
          title="Admin-Vorschau anzeigen"
        >
          <Eye className="h-5 w-5 text-primary-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="bg-primary/95 backdrop-blur-sm text-primary-foreground rounded-[2rem] shadow-neu-float p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Admin Badge & Info */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">
                🔒 ADMIN-VORSCHAU
              </Badge>
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <Badge variant="outline" className="bg-background/20 border-primary-foreground/30">
                  Status: {gallery.status}
                </Badge>
                <span className="text-primary-foreground/90">
                  {selectedCount} von {gallery.package_target_count} Fotos ausgewählt
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/admin/galleries')}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Admin
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/admin/galleries/${gallery.id}`)}
                className="rounded-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Galerie bearbeiten
              </Button>

              {(gallery.status === 'Reviewed' || gallery.status === 'Delivered') && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/admin/galleries/${gallery.id}/review`)}
                  className="rounded-full"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Überprüfung
                </Button>
              )}

              <div className="h-6 w-px bg-primary-foreground/20 mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="rounded-full hover:bg-primary-foreground/10"
                title="Minimieren"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Info Row */}
          <div className="sm:hidden mt-3 pt-3 border-t border-primary-foreground/20">
            <div className="flex items-center justify-between text-sm">
              <Badge variant="outline" className="bg-background/20 border-primary-foreground/30">
                {gallery.status}
              </Badge>
              <span className="text-primary-foreground/90">
                {selectedCount} / {gallery.package_target_count} Fotos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
