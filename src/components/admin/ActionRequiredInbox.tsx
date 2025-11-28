import { useNavigate } from 'react-router-dom';
import { AlertCircle, Package, Unlock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useActionRequiredItems } from '@/hooks/useActionRequiredItems';

export function ActionRequiredInbox() {
  const { data: items, isLoading } = useActionRequiredItems();
  const navigate = useNavigate();

  if (isLoading || !items || items.length === 0) {
    return null;
  }

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
    <div className="space-y-3">
      {items.map((item) => (
        <Alert 
          key={item.id} 
          variant={getVariant(item.priority)}
          className="shadow-neu-flat"
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
  );
}
