import { useState } from 'react';
import { useWebhookLogs } from '@/hooks/useWebhookLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Webhook, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function WebhookLogs() {
  const { data: logs, isLoading } = useWebhookLogs();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = logs?.filter(log => {
    if (typeFilter !== 'all' && log.type !== typeFilter) return false;
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Erfolgreich
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Fehlgeschlagen
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Ausstehend
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'send':
        return <Badge variant="secondary">An Kunde senden</Badge>;
      case 'delivery':
        return <Badge variant="default">Lieferung</Badge>;
      case 'review':
        return <Badge variant="outline">Überprüfung</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Lade Webhook-Logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Webhook-Logs</h1>
        <p className="text-muted-foreground">
          Überwachen Sie alle Webhook-Ereignisse und deren Status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook-Ereignisse
          </CardTitle>
          <CardDescription>
            Historie aller gesendeten Webhook-Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Nach Typ filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="send">An Kunde senden</SelectItem>
                  <SelectItem value="delivery">Lieferung</SelectItem>
                  <SelectItem value="review">Überprüfung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Nach Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="success">Erfolgreich</SelectItem>
                  <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredLogs && filteredLogs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeitstempel</TableHead>
                    <TableHead>Galerie</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                      </TableCell>
                      <TableCell>
                        {log.galleries ? (
                          <div>
                            <div className="font-medium">{log.galleries.name}</div>
                            <div className="text-sm text-muted-foreground">{log.galleries.slug}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(log.type)}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Webhook-Details</DialogTitle>
                              <DialogDescription>
                                Event ID: {log.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Grundinformationen</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-muted-foreground">Typ:</div>
                                  <div>{getTypeBadge(log.type)}</div>
                                  <div className="text-muted-foreground">Status:</div>
                                  <div>{getStatusBadge(log.status)}</div>
                                  <div className="text-muted-foreground">Zeitstempel:</div>
                                  <div>{format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: de })}</div>
                                  {log.galleries && (
                                    <>
                                      <div className="text-muted-foreground">Galerie:</div>
                                      <div>{log.galleries.name}</div>
                                    </>
                                  )}
                                </div>
                              </div>
                              {log.response_body && (
                                <div>
                                  <h4 className="font-semibold mb-2">Response Body</h4>
                                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-64">
                                    {JSON.stringify(log.response_body, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Keine Webhook-Logs gefunden</p>
              {(typeFilter !== 'all' || statusFilter !== 'all') && (
                <p className="text-sm mt-2">Versuchen Sie, die Filter anzupassen</p>
              )}
            </div>
          )}

          {filteredLogs && filteredLogs.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'Ereignis' : 'Ereignisse'} gefunden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
