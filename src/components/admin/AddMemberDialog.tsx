import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAddCompanyMember } from '@/hooks/useCompanyMembers';

interface AddMemberDialogProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({ companyId, open, onOpenChange }: AddMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const addMember = useAddCompanyMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Look up user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (profileError || !profile) {
        setError('Kein Benutzer mit dieser E-Mail-Adresse gefunden');
        return;
      }

      await addMember.mutateAsync({
        companyId,
        userId: profile.id,
      });

      setEmail('');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error adding member:', err);
      if (err.message?.includes('duplicate')) {
        setError('Dieser Benutzer ist bereits Mitglied dieses Unternehmens');
      } else {
        setError('Fehler beim Hinzufügen des Mitglieds. Bitte versuchen Sie es erneut.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Teammitglied hinzufügen</DialogTitle>
          <DialogDescription>
            Fügen Sie einen bestehenden Benutzer über seine E-Mail-Adresse zu diesem Unternehmen hinzu.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="benutzer@beispiel.de"
                required
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setEmail('');
                setError('');
              }}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={!email || addMember.isPending}>
              Mitglied hinzufügen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
