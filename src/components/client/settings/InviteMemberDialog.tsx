import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useCreateInvitation } from '@/hooks/useTeamInvitations';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_ROLE_LABELS, CompanyRoleType } from '@/types/company';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function InviteMemberDialog({ open, onOpenChange, companyId }: InviteMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CompanyRoleType>('employee');
  const { user } = useAuth();
  const createInvitation = useCreateInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !email.trim()) return;

    try {
      await createInvitation.mutateAsync({
        companyId,
        email: email.trim(),
        role,
        invitedBy: user.id,
      });
      
      toast({
        title: 'Einladung gesendet',
        description: `Eine Einladung wurde an ${email} gesendet.`,
      });
      
      setEmail('');
      setRole('employee');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error?.message || 'Die Einladung konnte nicht gesendet werden.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neues Teammitglied einladen</DialogTitle>
          <DialogDescription>
            Senden Sie eine Einladung per E-Mail. Der Eingeladene hat 7 Tage Zeit, die Einladung anzunehmen.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mitarbeiter@firma.de"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rolle</Label>
            <Select value={role} onValueChange={(v) => setRole(v as CompanyRoleType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company_admin">
                  {COMPANY_ROLE_LABELS.company_admin}
                  <span className="block text-xs text-muted-foreground">
                    Kann Firma und Team verwalten
                  </span>
                </SelectItem>
                <SelectItem value="employee">
                  {COMPANY_ROLE_LABELS.employee}
                  <span className="block text-xs text-muted-foreground">
                    Grundzugriff mit konfigurierbaren Rechten
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createInvitation.isPending || !email.trim()}>
              {createInvitation.isPending ? 'Wird gesendet...' : 'Einladung senden'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
