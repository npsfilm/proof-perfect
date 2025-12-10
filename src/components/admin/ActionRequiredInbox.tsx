import { useNavigate } from 'react-router-dom';
import { AlertCircle, Package, Unlock } from 'lucide-react';
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

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-6">
          <LoadingState message="Lädt ausstehende Aktionen..." />
        </CardContent>
      </Card>
    );
  }

  // Hide the entire section when there are no pending actions
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2 md:pb-3 px-3 md:px-6 pt-3 md:pt-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Aktion erforderlich
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Galerien und Anfragen, die Ihre Aufmerksamkeit benötigen
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
        <div className="space-y-2 md:space-y-3">
          {items.map((item) => (
            <Alert 
              key={item.id} 
              variant={getVariant(item.priority)}
              className="shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0 mt-0.5">{getIcon(item.type)}</span>
                  <div className="flex-1 space-y-0.5 md:space-y-1 min-w-0">
                    <AlertTitle className="text-sm md:text-base font-semibold">
                      {item.title}
                    </AlertTitle>
                    <AlertDescription className="text-xs md:text-sm">
                      {item.description}
                    </AlertDescription>
                  </div>
                </div>
                <Button
                  variant={item.priority === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAction(item.type)}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  {item.type === 'delivery_pending' ? 'Ausliefern' : 'Anfragen anzeigen'}
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
