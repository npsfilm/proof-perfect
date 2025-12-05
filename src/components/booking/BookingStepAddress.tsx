import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/contexts/BookingContext';
import { useMapboxGeocoding } from '@/hooks/useMapboxGeocoding';
import { cn } from '@/lib/utils';

export function BookingStepAddress() {
  const { currentProperty, setAddress, nextStep, prevStep, bookingsCompleted } = useBooking();
  const { suggestions, isLoading, searchAddress, clearSuggestions } = useMapboxGeocoding();
  const [inputValue, setInputValue] = useState(currentProperty.address);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length >= 3) {
        searchAddress(inputValue);
        setShowSuggestions(true);
      } else {
        clearSuggestions();
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, searchAddress, clearSuggestions]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAddress = (suggestion: { place_name: string; center: [number, number] }) => {
    setInputValue(suggestion.place_name);
    setAddress(suggestion.place_name, {
      lat: suggestion.center[1],
      lng: suggestion.center[0],
    });
    setShowSuggestions(false);
    clearSuggestions();
  };

  const canProceed = currentProperty.address && currentProperty.coordinates;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div className="text-center mb-8">
        <MapPin className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {bookingsCompleted > 0 
            ? `Adresse für Objekt ${bookingsCompleted + 1}`
            : 'Wo ist die Immobilie?'
          }
        </h2>
        <p className="text-muted-foreground">
          Geben Sie die vollständige Adresse der Immobilie ein.
        </p>
      </div>

      <div className="w-full max-w-md relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="z.B. Maximilianstraße 1, 86150 Augsburg"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="pl-12 pr-10 h-14 text-lg"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSelectAddress(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm">{suggestion.place_name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected address confirmation */}
        {canProceed && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{currentProperty.address}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Koordinaten: {currentProperty.coordinates?.lat.toFixed(4)}, {currentProperty.coordinates?.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8 w-full max-w-md">
        <Button variant="outline" size="lg" className="flex-1" onClick={prevStep}>
          Zurück
        </Button>
        <Button size="lg" className="flex-1" onClick={nextStep} disabled={!canProceed}>
          Weiter
        </Button>
      </div>
    </div>
  );
}
