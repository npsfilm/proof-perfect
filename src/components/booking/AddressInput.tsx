import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useMapboxGeocoding } from '@/hooks/useMapboxGeocoding';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressInputProps {
  value: string;
  onSelect: (address: string, lat?: number, lng?: number) => void;
}

export function AddressInput({ value, onSelect }: AddressInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const { results, isLoading, search } = useMapboxGeocoding();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    search(newValue);
    setShowDropdown(true);
  };

  const handleSelect = (result: { address: string; lat: number; lng: number }) => {
    setInputValue(result.address);
    onSelect(result.address, result.lat, result.lng);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Straße, PLZ, Stadt eingeben..."
          className="pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className={cn(
                'w-full px-4 py-3 text-left text-sm hover:bg-accent transition-colors flex items-start gap-3',
                index !== results.length - 1 && 'border-b'
              )}
            >
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span className="line-clamp-2">{result.address}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
