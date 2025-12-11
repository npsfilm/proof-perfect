import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Loader2, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceStatus } from '@/types/company';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface InvoicesTabProps {
  companyId: string;
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Offen', icon: Clock, variant: 'secondary' },
  paid: { label: 'Bezahlt', icon: CheckCircle2, variant: 'default' },
  overdue: { label: 'Überfällig', icon: AlertCircle, variant: 'destructive' },
  cancelled: { label: 'Storniert', icon: XCircle, variant: 'outline' },
};

export function InvoicesTab({ companyId }: InvoicesTabProps) {
  const { data: invoices = [], isLoading } = useInvoices(companyId);

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const totalOpen = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount_cents, 0);

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount_cents, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-sm text-muted-foreground">Rechnungen gesamt</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{formatAmount(totalOpen)}</div>
            <p className="text-sm text-muted-foreground">Offener Betrag</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{formatAmount(totalPaid)}</div>
            <p className="text-sm text-muted-foreground">Bezahlt (gesamt)</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rechnungsübersicht
          </CardTitle>
          <CardDescription>
            Alle Rechnungen für Ihre Firma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Rechnungen vorhanden</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungsnr.</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="hidden sm:table-cell">Beschreibung</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const statusConfig = STATUS_CONFIG[invoice.status];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.invoice_date), 'dd.MM.yyyy', { locale: de })}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                          {invoice.description || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatAmount(invoice.amount_cents)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.pdf_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
