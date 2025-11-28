import { useNavigate } from 'react-router-dom';
import { AlertCircle, Package, Unlock, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { useActionRequiredItems } from '@/hooks/useActionRequiredItems';

export function ActionRequiredInbox() {
  const { data: items, isLoading } = useActionRequiredItems();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'delivery_pending':
        return <Package className="h-5 w-5" />;
      case 'reopen_pending':
        return <Unlock className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getVariant = (priority: string) => {
    return priority === 'high' ? 'destructive' : 'default';
  };

  const handleAction = (type: string) => {
    if (type === 'delivery_pending') {
      navigate('/admin/galerien?status=Closed');
    } else if (type === 'reopen_pending') {
      navigate('/admin/galerien');
    }
  };

  return (
    <Card className="shadow-neu-flat border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-primary" />
          Aktion erforderlich
        </CardTitle>
        <CardDescription>
          Galerien und Anfragen, die Ihre Aufmerksamkeit benötigen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState message="Lädt ausstehende Aktionen..." />
        ) : !items || items.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-sm">Keine ausstehenden Aktionen</p>
              <p className="text-xs text-muted-foreground">
                Alle Galerien sind auf dem neuesten Stand
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Alert 
                key={item.id} 
                variant={getVariant(item.priority)}
                className="shadow-neu-flat-sm"
              >
                <div className="flex items-start gap-3">
                  {getIcon(item.type)}
                  <div className="flex-1 space-y-1">
                    <AlertTitle className="text-base font-semibold">
                      {item.title}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {item.description}
                    </AlertDescription>
                  </div>
                  <Button
                    variant={item.priority === 'high' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAction(item.type)}
                    className="ml-auto"
                  >
                    {item.type === 'delivery_pending' ? 'Ausliefern' : 'Anfragen anzeigen'}
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
