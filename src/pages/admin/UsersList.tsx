import { useState } from 'react';
import { format } from 'date-fns';
import { Users, Edit, Key, ArrowUpDown } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { useUserActivity } from '@/hooks/useCompanyStats';
import { EditUserRoleDialog } from '@/components/admin/EditUserRoleDialog';
import { ManageUserAccessDialog } from '@/components/admin/ManageUserAccessDialog';
import { UserActivity } from '@/types/database';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';

export default function UsersList() {
  const { data: users, isLoading } = useUserActivity();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'client'>('all');
  const [sortField, setSortField] = useState<'email' | 'last_sign_in_at'>('email');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editRoleUser, setEditRoleUser] = useState<UserActivity | null>(null);
  const [manageAccessUser, setManageAccessUser] = useState<UserActivity | null>(null);

  const handleSort = (field: 'email' | 'last_sign_in_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users
    ?.filter((user) => {
      const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    ?.slice()
    .sort((a, b) => {
      if (sortField === 'email') {
        return sortDirection === 'asc'
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      } else {
        const aDate = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
        const bDate = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
    });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <PageContainer size="full">
      <div className="space-y-6">
        <PageHeader
          title="Benutzer"
          description="Benutzerrollen und Galeriezugriff verwalten"
          breadcrumbs={[{ label: 'Benutzer' }]}
        />

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Nach E-Mail suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            variant={roleFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('all')}
          >
            Alle
          </Button>
          <Button
            variant={roleFilter === 'admin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('admin')}
          >
            Admins
          </Button>
          <Button
            variant={roleFilter === 'client' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('client')}
          >
            Kunden
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Email
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className="hidden md:table-cell">
                  <button
                    onClick={() => handleSort('last_sign_in_at')}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Letzte Anmeldung
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Galerien</TableHead>
                <TableHead className="hidden lg:table-cell">Auswahl</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>Keine Benutzer gefunden</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role || 'client'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.last_sign_in_at ? (
                        format(new Date(user.last_sign_in_at), 'dd.MM.yyyy HH:mm')
                      ) : (
                        <span className="text-muted-foreground">Nie</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.galleries_assigned}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.selections_made}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditRoleUser(user)}
                          title="Rolle bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setManageAccessUser(user)}
                          title="Galeriezugriff verwalten"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {editRoleUser && (
        <EditUserRoleDialog
          user={editRoleUser}
          open={!!editRoleUser}
          onOpenChange={(open) => !open && setEditRoleUser(null)}
        />
      )}

      {manageAccessUser && (
        <ManageUserAccessDialog
          user={manageAccessUser}
          open={!!manageAccessUser}
          onOpenChange={(open) => !open && setManageAccessUser(null)}
        />
      )}
      </div>
    </PageContainer>
  );
}
