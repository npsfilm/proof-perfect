import { useGalleries } from '@/hooks/useGalleries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2 } from 'lucide-react';
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
  const { galleries, isLoading, deleteGallery } = useGalleries();
  const navigate = useNavigate();

  const statusColors = {
    Draft: 'bg-muted text-muted-foreground',
    Sent: 'bg-blue-100 text-blue-800',
    Reviewed: 'bg-yellow-100 text-yellow-800',
    Delivered: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Galleries</h1>
        <Button onClick={() => navigate('/admin/galleries/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Gallery
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading galleries...</p>
          </CardContent>
        </Card>
      ) : galleries && galleries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {galleries.map((gallery) => (
            <Card key={gallery.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{gallery.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{gallery.slug}</p>
                  </div>
                  <Badge className={statusColors[gallery.status]}>
                    {gallery.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Target: </span>
                    <span className="font-medium">{gallery.package_target_count} photos</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Salutation: </span>
                    <span className="font-medium">{gallery.salutation_type}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/admin/galleries/${gallery.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete gallery?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{gallery.name}" and all its photos.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteGallery.mutate(gallery.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No galleries yet</p>
              <Button onClick={() => navigate('/admin/galleries/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first gallery
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
