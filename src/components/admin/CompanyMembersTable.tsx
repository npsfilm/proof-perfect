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
          <h3 className="font-semibold">Team Members</h3>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">Added</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No members yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                members?.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.profiles?.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">Client</Badge>
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
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {selectedMember?.email} from this company. They will lose access to all company galleries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={removeMember.isPending}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
