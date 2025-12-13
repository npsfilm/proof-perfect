import { useState } from 'react';
import { useGalleries, useDeleteGallery, useGalleryFilters } from '@/hooks/galleries';
import { useBatchGalleryOperations } from '@/hooks/useBatchGalleryOperations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { BatchActionsBar } from '@/components/admin/BatchActionsBar';
import { GalleryFilters } from '@/components/admin/GalleryFilters';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, ExternalLink } from 'lucide-react';
import { GalleryStatus } from '@/types/database';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { GalleryCardSkeletonGrid } from '@/components/admin/skeletons/GalleryCardSkeleton';
import { TimeElapsed } from '@/components/admin/TimeElapsed';
import { GalleryProgressBar } from '@/components/ui/GalleryProgressBar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function GalleriesList() {
  const { data: galleries, isLoading } = useGalleries();
  const deleteGalleryMutation = useDeleteGallery();
  const { duplicateGalleries, bulkStatusUpdate, bulkDelete } = useBatchGalleryOperations();
  const navigate = useNavigate();
  const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set());

  // Use the filtering hook
  const {
    searchQuery,
    selectedStatuses,
    selectedCompanyId,
    dateFrom,
    dateTo,
    activeFilterCount,
    onSearchChange,
    onStatusToggle,
    onCompanyChange,
    onDateFromChange,
    onDateToChange,
    onClearAll,
    filteredGalleries,
  } = useGalleryFilters(galleries);

  const toggleGallerySelection = (galleryId: string) => {
    const newSelection = new Set(selectedGalleries);
    if (newSelection.has(galleryId)) {
      newSelection.delete(galleryId);
    } else {
      newSelection.add(galleryId);
    }
    setSelectedGalleries(newSelection);
  };

  const toggleSelectAll = () => {
    if (filteredGalleries.length === 0) return;
    if (selectedGalleries.size === filteredGalleries.length) {
      setSelectedGalleries(new Set());
    } else {
      setSelectedGalleries(new Set(filteredGalleries.map(g => g.id)));
    }
  };

  const handleDuplicate = async () => {
    await duplicateGalleries.mutateAsync(Array.from(selectedGalleries));
    setSelectedGalleries(new Set());
  };

  const handleBulkStatusUpdate = async (status: GalleryStatus) => {
    await bulkStatusUpdate.mutateAsync({
      galleryIds: Array.from(selectedGalleries),
      status,
    });
    setSelectedGalleries(new Set());
  };

  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(Array.from(selectedGalleries));
    setSelectedGalleries(new Set());
  };

  const isAllSelected = filteredGalleries.length > 0 && selectedGalleries.size === filteredGalleries.length;

  return (
    <PageContainer size="full">
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Galerien"
          description="Alle Galerien verwalten und organisieren"
          breadcrumbs={[{ label: 'Galerien' }]}
          actions={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {filteredGalleries.length > 0 && (
                <div className="flex items-center gap-2 order-2 sm:order-1">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer whitespace-nowrap"
                  >
                    Alle auswählen
                  </label>
                </div>
              )}
              <Button onClick={() => navigate('/admin/galleries/new')} className="order-1 sm:order-2 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Neue Galerie
              </Button>
            </div>
          }
        />

        <GalleryFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedStatuses={selectedStatuses}
          onStatusToggle={onStatusToggle}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={onCompanyChange}
          dateFrom={dateFrom}
          onDateFromChange={onDateFromChange}
          dateTo={dateTo}
          onDateToChange={onDateToChange}
          onClearAll={onClearAll}
          activeFilterCount={activeFilterCount}
        />

        {isLoading ? (
          <GalleryCardSkeletonGrid count={6} />
        ) : filteredGalleries.length > 0 ? (
          <>
            {activeFilterCount > 0 && (
              <div className="text-sm text-muted-foreground">
                {filteredGalleries.length} {filteredGalleries.length === 1 ? 'Galerie' : 'Galerien'} gefunden
                {galleries && galleries.length > filteredGalleries.length && (
                  <span> von {galleries.length} gesamt</span>
                )}
              </div>
            )}
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGalleries.map((gallery) => (
                <Card
                  key={gallery.id}
                  className={`transition-all duration-300 hover:border-primary/50 ${
                    selectedGalleries.has(gallery.id) ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardHeader className="pb-2">
                    {/* Header: Checkbox + Name + Badges */}
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`gallery-${gallery.id}`}
                        checked={selectedGalleries.has(gallery.id)}
                        onCheckedChange={() => toggleGallerySelection(gallery.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`gallery-${gallery.id}`}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base">{gallery.name}</CardTitle>
                            {gallery.express_delivery_requested && (
                              <Badge variant="destructive" className="animate-pulse text-xs">
                                24H
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">
                            {gallery.address || gallery.slug}
                          </p>
                        </label>
                      </div>
                      {/* Status Badge */}
                      <Badge 
                        variant="outline" 
                        className="shrink-0 text-xs"
                      >
                        {gallery.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Progress Bar - eigene Zeile */}
                    <div className="py-2 px-1 bg-muted/30 rounded-lg">
                      <GalleryProgressBar currentStatus={gallery.status} compact />
                    </div>

                    {/* Meta Info als Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">
                        🎯 {gallery.package_target_count} Fotos
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-normal">
                        👤 {gallery.salutation_type}
                      </Badge>
                      {gallery.status === 'Closed' && gallery.reviewed_at && (
                        <TimeElapsed 
                          startTime={gallery.reviewed_at}
                          variant="secondary"
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/admin/galleries/${gallery.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        Öffnen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/gallery/${gallery.slug}`, '_blank');
                        }}
                        title="Kunden-Ansicht öffnen"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Galerie löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Dies wird "{gallery.name}" und alle zugehörigen Fotos dauerhaft löschen.
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteGalleryMutation.mutate(gallery.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : galleries && galleries.length > 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Keine Galerien entsprechen den Filterkriterien
                </p>
                <Button onClick={onClearAll} variant="outline">
                  Filter zurücksetzen
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Noch keine Galerien</p>
                <Button onClick={() => navigate('/admin/galleries/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Galerie erstellen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <BatchActionsBar
          selectedCount={selectedGalleries.size}
          onDuplicate={handleDuplicate}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedGalleries(new Set())}
        />
      </div>
    </PageContainer>
  );
}
