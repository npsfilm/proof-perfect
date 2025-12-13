import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GalleryStatus, Gallery } from '@/types/database';

export function useGalleryFilters(galleries: Gallery[] | undefined) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filter state from URL
  const searchQuery = searchParams.get('search') || '';
  const selectedStatuses = useMemo(() => {
    const statusParam = searchParams.get('status');
    return statusParam ? new Set(statusParam.split(',') as GalleryStatus[]) : new Set<GalleryStatus>();
  }, [searchParams]);
  
  const selectedCompanyId = searchParams.get('company') || null;
  const dateFrom = searchParams.get('from') ? new Date(searchParams.get('from')!) : null;
  const dateTo = searchParams.get('to') ? new Date(searchParams.get('to')!) : null;

  // Update URL params
  const updateSearchParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const onSearchChange = (value: string) => {
    updateSearchParam('search', value || null);
  };

  const onStatusToggle = (status: GalleryStatus) => {
    const newStatuses = new Set(selectedStatuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }
    updateSearchParam('status', newStatuses.size > 0 ? Array.from(newStatuses).join(',') : null);
  };

  const onCompanyChange = (companyId: string | null) => {
    updateSearchParam('company', companyId);
  };

  const onDateFromChange = (date: Date | null) => {
    updateSearchParam('from', date ? date.toISOString().split('T')[0] : null);
  };

  const onDateToChange = (date: Date | null) => {
    updateSearchParam('to', date ? date.toISOString().split('T')[0] : null);
  };

  const onClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedStatuses.size > 0) count++;
    if (selectedCompanyId) count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  }, [searchQuery, selectedStatuses, selectedCompanyId, dateFrom, dateTo]);

  // Apply filters to galleries
  const filteredGalleries = useMemo(() => {
    if (!galleries) return [];

    return galleries.filter((gallery) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = gallery.name.toLowerCase().includes(query);
        const matchesSlug = gallery.slug.toLowerCase().includes(query);
        const matchesAddress = gallery.address?.toLowerCase().includes(query);
        if (!matchesName && !matchesSlug && !matchesAddress) return false;
      }

      // Status filter
      if (selectedStatuses.size > 0 && !selectedStatuses.has(gallery.status)) {
        return false;
      }

      // Company filter
      if (selectedCompanyId && gallery.company_id !== selectedCompanyId) {
        return false;
      }

      // Date range filter
      const createdDate = new Date(gallery.created_at);
      if (dateFrom && createdDate < dateFrom) {
        return false;
      }
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (createdDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [galleries, searchQuery, selectedStatuses, selectedCompanyId, dateFrom, dateTo]);

  return {
    // Filter state
    searchQuery,
    selectedStatuses,
    selectedCompanyId,
    dateFrom,
    dateTo,
    activeFilterCount,
    
    // Filter actions
    onSearchChange,
    onStatusToggle,
    onCompanyChange,
    onDateFromChange,
    onDateToChange,
    onClearAll,
    
    // Filtered data
    filteredGalleries,
  };
}
