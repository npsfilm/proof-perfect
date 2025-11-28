import { useState, useMemo } from 'react';
import { Check, Search, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useClients } from '@/hooks/useClients';
import { Client } from '@/types/database';
import { AddClientDialog } from './AddClientDialog';
import { cn } from '@/lib/utils';

interface ClientPickerProps {
  selectedClients: Client[];
  onClientsChange: (clients: Client[]) => void;
  disabled?: boolean;
}

export const ClientPicker = ({ selectedClients, onClientsChange, disabled }: ClientPickerProps) => {
  const { data: allClients, isLoading } = useClients();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredClients = useMemo(() => {
    if (!allClients) return [];
    if (!searchQuery) return allClients;

    const query = searchQuery.toLowerCase();
    return allClients.filter((client: Client & { companies?: { name?: string } }) => {
      const fullName = `${client.vorname} ${client.nachname}`.toLowerCase();
      const email = client.email.toLowerCase();
      const company = client.companies?.name?.toLowerCase() || '';
      
      return fullName.includes(query) || email.includes(query) || company.includes(query);
    });
  }, [allClients, searchQuery]);

  const handleSelectClient = (client: Client) => {
    const validClients = selectedClients.filter(c => c && c.id);
    const isSelected = validClients.some(c => c.id === client.id);
    
    if (isSelected) {
      onClientsChange(validClients.filter(c => c.id !== client.id));
    } else {
      onClientsChange([...validClients, client]);
    }
  };

  const handleRemoveClient = (clientId: string) => {
    onClientsChange(selectedClients.filter(c => c && c.id && c.id !== clientId));
  };

  const handleClientCreated = (newClient: Client) => {
    onClientsChange([...selectedClients, newClient]);
  };

  return (
    <>
      <div className="space-y-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-auto py-4"
              disabled={disabled}
            >
              <span className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span className="text-base">Kunden suchen oder hinzufügen...</span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[500px] p-0" align="start">
            <Command>
              <div className="flex items-center border-b px-3">
                <Search className="h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Nach Name, E-Mail oder Unternehmen suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <CommandList>
                <CommandEmpty>
                  <div className="py-6 text-center text-sm">
                    <p className="mb-3">Kein Kunde gefunden</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        setShowAddDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Neuen Kunden erstellen
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {filteredClients.map((client: Client & { companies?: { name?: string } }) => {
                    const isSelected = selectedClients.filter(c => c && c.id).some(c => c.id === client.id);
                    const displayName = `${client.anrede ? client.anrede + ' ' : ''}${client.vorname} ${client.nachname}`;
                    
                    return (
                      <CommandItem
                        key={client.id}
                        onSelect={() => handleSelectClient(client)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{displayName}</span>
                            <Badge variant="outline" className="text-xs">
                              {client.ansprache}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{client.email}</span>
                          {client.companies?.name && (
                            <span className="text-xs text-muted-foreground">{client.companies.name}</span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
              <div className="border-t p-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    setShowAddDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Neuen Kunden erstellen
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedClients.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {selectedClients.filter(c => c && c.id).map((client) => {
                const displayName = `${client.anrede ? client.anrede + ' ' : ''}${client.vorname} ${client.nachname}`;
                
                return (
                  <Badge key={client.id} variant="secondary" className="gap-2 py-1.5 px-3">
                    <span className="font-medium">{displayName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveClient(client.id)}
                      disabled={disabled}
                      className="ml-1 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AddClientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onClientCreated={handleClientCreated}
      />
    </>
  );
};
