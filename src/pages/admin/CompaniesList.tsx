import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCompanyGalleryStats } from '@/hooks/useCompanyStats';
import { CompanyForm } from '@/components/admin/CompanyForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';

export default function CompaniesList() {
  const navigate = useNavigate();
  const { data: companies, isLoading } = useCompanyGalleryStats();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'galleries_count'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'name' | 'galleries_count') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCompanies = companies?.slice().sort((a, b) => {
    const aVal = sortField === 'name' ? a.company_name : a.galleries_count;
    const bVal = sortField === 'name' ? b.company_name : b.galleries_count;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <PageContainer size="full">
      <div className="space-y-6">
        <PageHeader
          title="Unternehmen"
          description="Kundenunternehmen und ihre Teammitglieder verwalten"
          breadcrumbs={[{ label: 'Unternehmen' }]}
          actions={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Unternehmen hinzufügen
            </Button>
          }
        />

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Unternehmen
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Domain</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('galleries_count')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Galerien
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Fotos</TableHead>
                <TableHead className="hidden lg:table-cell">Ausgewählt</TableHead>
                <TableHead className="hidden xl:table-cell">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCompanies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Building2 className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>Noch keine Unternehmen. Erstellen Sie eines, um loszulegen.</p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedCompanies?.map((company) => (
                  <TableRow
                    key={company.company_id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/admin/companies/${company.company_id}`)}
                  >
                    <TableCell className="font-medium">{company.company_name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {company.domain ? (
                        <Badge variant="outline">{company.domain}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{company.galleries_count}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{company.photos_count}</TableCell>
                    <TableCell className="hidden lg:table-cell">{company.selected_count}</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex gap-2">
                        {company.reviewed_count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {company.reviewed_count} Überprüft
                          </Badge>
                        )}
                        {company.delivered_count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {company.delivered_count} Geliefert
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CompanyForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>
    </PageContainer>
  );
}
