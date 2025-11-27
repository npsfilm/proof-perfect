import { useState, useEffect } from 'react';
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
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies';
import { Company } from '@/types/database';

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
}

export function CompanyForm({ open, onOpenChange, company }: CompanyFormProps) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  useEffect(() => {
    if (company) {
      setName(company.name);
      setDomain(company.domain || '');
    } else {
      setName('');
      setDomain('');
    }
  }, [company, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (company) {
        await updateCompany.mutateAsync({
          id: company.id,
          name,
          domain: domain || null,
        });
      } else {
        await createCompany.mutateAsync({
          name,
          domain: domain || undefined,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const slugPreview = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{company ? 'Unternehmen bearbeiten' : 'Unternehmen erstellen'}</DialogTitle>
          <DialogDescription>
            {company ? 'Unternehmensdaten aktualisieren.' : 'Neues Kundenunternehmen hinzufügen.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Unternehmensname *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Immobilien"
                required
              />
              {slugPreview && (
                <p className="text-xs text-muted-foreground">
                  Slug-Vorschau: {slugPreview}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="acmeimmobilien.com"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Hilft bei Gruppierung und Suche
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={!name || createCompany.isPending || updateCompany.isPending}
            >
              {company ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
