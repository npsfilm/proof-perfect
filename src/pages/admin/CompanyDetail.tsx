import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Users, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompany } from '@/hooks/useCompanies';
import { useCompanyMembers } from '@/hooks/useCompanyMembers';
import { useCompanyGalleryList } from '@/hooks/useCompanyStats';
import { CompanyForm } from '@/components/admin/CompanyForm';
import { CompanyMembersTable } from '@/components/admin/CompanyMembersTable';
import { GalleryStatus } from '@/types/database';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<GalleryStatus | 'all'>('all');

  const { data: company, isLoading: companyLoading } = useCompany(id!);
  const { data: members, isLoading: membersLoading } = useCompanyMembers(id!);
  const { data: galleries, isLoading: galleriesLoading } = useCompanyGalleryList(id!);

  const filteredGalleries = galleries?.filter(
    (g) => statusFilter === 'all' || g.status === statusFilter
  );

  if (companyLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!company) {
    return <div className="p-8">Company not found</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/companies')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          {company.domain && (
            <p className="text-muted-foreground">{company.domain}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setIsEditOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Bearbeiten
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Galerien gesamt</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{galleries?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teammitglieder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hochgeladene Fotos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {galleries?.reduce((sum, g) => sum + g.photos_count, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausgewählt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {galleries?.reduce((sum, g) => sum + g.selected_count, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="galleries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="galleries">Galerien</TabsTrigger>
          <TabsTrigger value="members">Teammitglieder</TabsTrigger>
        </TabsList>

        <TabsContent value="galleries" className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Alle
            </Button>
            <Button
              variant={statusFilter === 'Draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('Draft')}
            >
              Entwurf
            </Button>
            <Button
              variant={statusFilter === 'Sent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('Sent')}
            >
              Gesendet
            </Button>
            <Button
              variant={statusFilter === 'Reviewed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('Reviewed')}
            >
              Überprüft
            </Button>
            <Button
              variant={statusFilter === 'Delivered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('Delivered')}
            >
              Geliefert
            </Button>
          </div>

          {galleriesLoading ? (
            <div>Galerien werden geladen...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGalleries?.map((gallery) => (
                <Card
                  key={gallery.gallery_id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => navigate(`/admin/galleries/${gallery.gallery_id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{gallery.name}</CardTitle>
                      <Badge variant="outline">{gallery.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{gallery.photos_count} Fotos</p>
                      <p>{gallery.selected_count} ausgewählt</p>
                      {gallery.staging_count > 0 && (
                        <p>{gallery.staging_count} Staging-Anfragen</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredGalleries?.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Keine Galerien gefunden
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members">
          <CompanyMembersTable companyId={id!} />
        </TabsContent>
      </Tabs>

      <CompanyForm open={isEditOpen} onOpenChange={setIsEditOpen} company={company} />
    </div>
  );
}
