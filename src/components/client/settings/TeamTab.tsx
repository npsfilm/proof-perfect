import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserPlus, Mail, Trash2, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useCompanyTeam, useUpdateMemberRole, useRemoveTeamMember } from '@/hooks/useCompanyTeam';
import { useTeamInvitations, useRevokeInvitation } from '@/hooks/useTeamInvitations';
import { COMPANY_ROLE_LABELS, CompanyRoleType, CompanyMemberExtended } from '@/types/company';
import { InviteMemberDialog } from './InviteMemberDialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAnsprache } from '@/contexts/AnspracheContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface TeamTabProps {
  companyId: string;
}

export function TeamTab({ companyId }: TeamTabProps) {
  const { t } = useAnsprache();
  const isMobile = useIsMobile();
  const { data: team = [], isLoading: teamLoading } = useCompanyTeam(companyId);
  const { data: invitations = [], isLoading: invitationsLoading } = useTeamInvitations(companyId);
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveTeamMember();
  const revokeInvitation = useRevokeInvitation();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMemberExtended | null>(null);

  const handleRoleChange = async (memberId: string, role: CompanyRoleType) => {
    try {
      await updateRole.mutateAsync({ memberId, role, companyId });
      toast({
        title: 'Rolle geändert',
        description: 'Die Rolle wurde erfolgreich aktualisiert.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Die Rolle konnte nicht geändert werden.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    
    try {
      await removeMember.mutateAsync({ memberId: selectedMember.id, companyId });
      toast({
        title: 'Mitglied entfernt',
        description: 'Das Teammitglied wurde erfolgreich entfernt.',
      });
      setRemoveDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Das Mitglied konnte nicht entfernt werden.',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await revokeInvitation.mutateAsync({ invitationId, companyId });
      toast({
        title: 'Einladung zurückgezogen',
        description: 'Die Einladung wurde erfolgreich widerrufen.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Die Einladung konnte nicht widerrufen werden.',
        variant: 'destructive',
      });
    }
  };

  if (teamLoading || invitationsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Team Members */}
      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Teammitglieder</CardTitle>
            <CardDescription>
              {team.length} {team.length === 1 ? 'Mitglied' : 'Mitglieder'} {t('in deinem Team', 'in Ihrem Team')}
            </CardDescription>
          </div>
          <Button onClick={() => setInviteOpen(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Einladen
          </Button>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            // Mobile: Card-based layout
            <div className="space-y-3">
              {team.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{member.profiles?.email}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Seit {format(new Date(member.created_at), 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 -mr-2"
                        onClick={() => {
                          setSelectedMember(member);
                          setRemoveDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value as CompanyRoleType)}
                    disabled={member.role === 'owner' || updateRole.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner" disabled>
                        {COMPANY_ROLE_LABELS.owner}
                      </SelectItem>
                      <SelectItem value="company_admin">
                        {COMPANY_ROLE_LABELS.company_admin}
                      </SelectItem>
                      <SelectItem value="employee">
                        {COMPANY_ROLE_LABELS.employee}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          ) : (
            // Desktop: Table layout
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Beigetreten</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.profiles?.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleRoleChange(member.id, value as CompanyRoleType)}
                          disabled={member.role === 'owner' || updateRole.isPending}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner" disabled>
                              {COMPANY_ROLE_LABELS.owner}
                            </SelectItem>
                            <SelectItem value="company_admin">
                              {COMPANY_ROLE_LABELS.company_admin}
                            </SelectItem>
                            <SelectItem value="employee">
                              {COMPANY_ROLE_LABELS.employee}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(member.created_at), 'dd.MM.yyyy', { locale: de })}
                      </TableCell>
                      <TableCell>
                        {member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedMember(member);
                              setRemoveDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Offene Einladungen
            </CardTitle>
            <CardDescription>
              Diese Einladungen warten noch auf Annahme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        als {COMPANY_ROLE_LABELS[invitation.role]} eingeladen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Läuft ab: {format(new Date(invitation.expires_at), 'dd.MM.', { locale: de })}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeInvitation(invitation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        companyId={companyId}
      />

      {/* Remove Member Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitglied entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `Möchtest du ${selectedMember?.profiles?.email} wirklich aus dem Team entfernen? Diese Person verliert den Zugriff auf alle Firmendaten.`,
                `Möchten Sie ${selectedMember?.profiles?.email} wirklich aus dem Team entfernen? Diese Person verliert den Zugriff auf alle Firmendaten.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
