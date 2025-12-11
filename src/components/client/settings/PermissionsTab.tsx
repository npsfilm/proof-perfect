import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Receipt, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCompanyTeam, useUpdateMemberPermissions } from '@/hooks/useCompanyTeam';
import { COMPANY_ROLE_LABELS } from '@/types/company';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface PermissionsTabProps {
  companyId: string;
}

export function PermissionsTab({ companyId }: PermissionsTabProps) {
  const { t } = useAnsprache();
  const { data: team = [], isLoading } = useCompanyTeam(companyId);
  const updatePermissions = useUpdateMemberPermissions();

  // Only show employees (owners and admins have all permissions by default)
  const employees = team.filter((m) => m.role === 'employee');

  const handleToggle = async (memberId: string, field: 'can_view_invoices' | 'can_view_prices' | 'can_manage_team', value: boolean) => {
    try {
      await updatePermissions.mutateAsync({
        memberId,
        permissions: { [field]: value },
        companyId,
      });
      toast({
        title: 'Berechtigung aktualisiert',
        description: 'Die Änderung wurde gespeichert.',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Die Berechtigung konnte nicht geändert werden.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Mitarbeiter-Berechtigungen</CardTitle>
          <CardDescription>
            {t(
              'Lege fest, welche Mitarbeiter auf sensible Daten zugreifen dürfen. Geschäftsführer und Administratoren haben automatisch vollen Zugriff.',
              'Legen Sie fest, welche Mitarbeiter auf sensible Daten zugreifen dürfen. Geschäftsführer und Administratoren haben automatisch vollen Zugriff.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Mitarbeiter zum Verwalten</p>
              <p className="text-sm">{t('Lade Mitarbeiter im Team-Tab ein', 'Laden Sie Mitarbeiter im Team-Tab ein')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {employees.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.profiles?.email}</p>
                      <Badge variant="secondary" className="mt-1">
                        {COMPANY_ROLE_LABELS[member.role]}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={`invoices-${member.id}`} className="text-sm">
                          Rechnungen einsehen
                        </Label>
                      </div>
                      <Switch
                        id={`invoices-${member.id}`}
                        checked={member.can_view_invoices}
                        onCheckedChange={(checked) => handleToggle(member.id, 'can_view_invoices', checked)}
                        disabled={updatePermissions.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={`prices-${member.id}`} className="text-sm">
                          Preise sehen
                        </Label>
                      </div>
                      <Switch
                        id={`prices-${member.id}`}
                        checked={member.can_view_prices}
                        onCheckedChange={(checked) => handleToggle(member.id, 'can_view_prices', checked)}
                        disabled={updatePermissions.isPending}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor={`team-${member.id}`} className="text-sm">
                          Team verwalten
                        </Label>
                      </div>
                      <Switch
                        id={`team-${member.id}`}
                        checked={member.can_manage_team}
                        onCheckedChange={(checked) => handleToggle(member.id, 'can_manage_team', checked)}
                        disabled={updatePermissions.isPending}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="shadow-soft border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Berechtigungsübersicht</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong>Rechnungen einsehen:</strong> Zugriff auf das Rechnungs-Dashboard</li>
            <li><strong>Preise sehen:</strong> Zeigt Preise bei Shootings und Services an</li>
            <li><strong>Team verwalten:</strong> Kann Einladungen senden und Mitglieder verwalten</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
