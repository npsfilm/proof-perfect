import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { useMapboxGeocoding } from '@/hooks/useMapboxGeocoding';
import { MapPin, Loader2, Search, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressInputProps {
  value: string;
  onSelect: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
}

export function AddressInput({ value, onSelect, placeholder = "Straße, PLZ, Stadt eingeben..." }: AddressInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { results, isLoading, search, query } = useMapboxGeocoding();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [results]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    search(newValue);
    setShowDropdown(true);
  };

  const handleSelect = useCallback((result: { address: string; lat: number; lng: number }) => {
    setInputValue(result.address);
    onSelect(result.address, result.lat, result.lng);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  }, [onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Highlight matching text in address
  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-primary/20 text-primary font-medium rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  const showNoResults = showDropdown && query.length >= 3 && !isLoading && results.length === 0;
  const showResults = showDropdown && results.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : inputValue ? (
            <Search className="h-4 w-4 text-muted-foreground" />
          ) : null}
        </div>
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-72 overflow-auto animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="py-1">
            {results.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm transition-colors flex items-start gap-3',
                  highlightedIndex === index 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-full shrink-0 mt-0.5',
                  highlightedIndex === index ? 'bg-primary/10' : 'bg-muted'
                )}>
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">
                    {highlightMatch(result.place_name || result.address.split(',')[0], query)}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {result.address}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          {/* Keyboard hint */}
          <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center gap-4 bg-muted/30">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
              Navigieren
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↵</kbd>
              Auswählen
            </span>
          </div>
        </div>
      )}

      {/* No results message */}
      {showNoResults && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="px-4 py-6 text-center">
            <Navigation className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Keine Adressen gefunden für "{query}"
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Versuchen Sie eine andere Schreibweise
            </p>
          </div>
        </div>
      )}

      {/* Loading state when typing */}
      {showDropdown && query.length >= 3 && isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="px-4 py-4 flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Suche Adressen...</span>
          </div>
        </div>
      )}
    </div>
  );
}
