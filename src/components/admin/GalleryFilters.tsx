import { useState } from 'react';
import { Search, X, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { GalleryStatus } from '@/types/database';
import { useCompanies } from '@/hooks/useCompanies';
import { cn } from '@/lib/utils';

const GALLERY_STATUSES: GalleryStatus[] = ['Draft', 'Sent', 'Reviewed', 'Delivered'];

const STATUS_LABELS: Record<GalleryStatus, string> = {
  Draft: 'Entwurf',
  Sent: 'Gesendet',
  Reviewed: 'Überprüft',
  Delivered: 'Geliefert',
};

interface GalleryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatuses: Set<GalleryStatus>;
  onStatusToggle: (status: GalleryStatus) => void;
  selectedCompanyId: string | null;
  onCompanyChange: (companyId: string | null) => void;
  dateFrom: Date | null;
  onDateFromChange: (date: Date | null) => void;
  dateTo: Date | null;
  onDateToChange: (date: Date | null) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

export function GalleryFilters({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusToggle,
  selectedCompanyId,
  onCompanyChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearAll,
  activeFilterCount,
}: GalleryFiltersProps) {
  const { data: companies } = useCompanies();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Quick Actions Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Name, Slug oder Adresse..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-background"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => onSearchChange('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="shrink-0"
                >
                  Alle löschen
                </Button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="space-y-4 pt-2 border-t border-border">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <div className="flex flex-wrap gap-2">
                  {GALLERY_STATUSES.map((status) => (
                    <Badge
                      key={status}
                      variant={selectedStatuses.has(status) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all',
                        selectedStatuses.has(status)
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-background hover:bg-accent'
                      )}
                      onClick={() => onStatusToggle(status)}
                    >
                      {STATUS_LABELS[status]}
                      {selectedStatuses.has(status) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Company Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Unternehmen</label>
                <Select
                  value={selectedCompanyId || 'all'}
                  onValueChange={(value) => onCompanyChange(value === 'all' ? null : value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Alle Unternehmen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Unternehmen</SelectItem>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Von Datum</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-background',
                          !dateFrom && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, 'PPP', { locale: de }) : 'Datum wählen'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom || undefined}
                        onSelect={(date) => onDateFromChange(date || null)}
                        initialFocus
                        locale={de}
                        className="pointer-events-auto"
                      />
                      {dateFrom && (
                        <div className="p-3 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDateFromChange(null)}
                            className="w-full"
                          >
                            Datum löschen
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Bis Datum</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-background',
                          !dateTo && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, 'PPP', { locale: de }) : 'Datum wählen'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo || undefined}
                        onSelect={(date) => onDateToChange(date || null)}
                        initialFocus
                        locale={de}
                        className="pointer-events-auto"
                      />
                      {dateTo && (
                        <div className="p-3 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDateToChange(null)}
                            className="w-full"
                          >
                            Datum löschen
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
