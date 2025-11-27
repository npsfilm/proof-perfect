import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCompanyMembers, useRemoveCompanyMember } from '@/hooks/useCompanyMembers';
import { AddMemberDialog } from './AddMemberDialog';

interface CompanyMembersTableProps {
  companyId: string;
}

export function CompanyMembersTable({ companyId }: CompanyMembersTableProps) {
  const { data: members, isLoading } = useCompanyMembers(companyId);
  const removeMember = useRemoveCompanyMember();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string; email: string } | null>(null);

  const handleRemove = async () => {
    if (!selectedMember) return;
    
    try {
      await removeMember.mutateAsync({
        companyId,
        userId: selectedMember.id,
      });
      setRemoveDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <>
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Teammitglieder</h3>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Mitglied hinzufügen
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-Mail</TableHead>
                <TableHead className="hidden md:table-cell">Rolle</TableHead>
                <TableHead className="hidden md:table-cell">Hinzugefügt</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Noch keine Mitglieder. Fügen Sie eines hinzu, um loszulegen.
                  </TableCell>
                </TableRow>
              ) : (
                members?.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.profiles?.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">Kunde</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember({
                            id: member.user_id,
                            email: member.profiles?.email,
                          });
                          setRemoveDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AddMemberDialog
        companyId={companyId}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Teammitglied entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dies entfernt {selectedMember?.email} von diesem Unternehmen. Sie verlieren den Zugriff auf alle Unternehmensgalerien.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={removeMember.isPending}>
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
