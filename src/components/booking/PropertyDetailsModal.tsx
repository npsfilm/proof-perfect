import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Home, Sofa, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (propertyType: 'bewohnt' | 'unbewohnt' | 'gestaged', squareMeters: number) => void;
}

export function PropertyDetailsModal({ open, onClose, onSubmit }: PropertyDetailsModalProps) {
  const [propertyType, setPropertyType] = useState<'bewohnt' | 'unbewohnt' | 'gestaged' | ''>('');
  const [squareMeters, setSquareMeters] = useState('');

  const handleSubmit = () => {
    if (propertyType && squareMeters) {
      onSubmit(propertyType, parseInt(squareMeters, 10));
      setPropertyType('');
      setSquareMeters('');
    }
  };

  const propertyTypes = [
    { value: 'bewohnt', label: 'Bewohnt', icon: Home, description: 'Mit Möbeln und persönlichen Gegenständen' },
    { value: 'unbewohnt', label: 'Unbewohnt', icon: Sofa, description: 'Leer oder nur mit Grundmöbeln' },
    { value: 'gestaged', label: 'Gestaged', icon: Sparkles, description: 'Professionell eingerichtet für Verkauf' },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zusätzliche Informationen</DialogTitle>
          <DialogDescription>
            Bei größeren Paketen benötigen wir einige Details zur besseren Zeitplanung.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Property type */}
          <div className="space-y-3">
            <Label>Art der Immobilie</Label>
            <RadioGroup
              value={propertyType}
              onValueChange={(value) => setPropertyType(value as typeof propertyType)}
            >
              <div className="grid gap-3">
                {propertyTypes.map(({ value, label, icon: Icon, description }) => (
                  <label
                    key={value}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                      propertyType === value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <RadioGroupItem value={value} className="mt-0.5" />
                    <Icon className={cn(
                      'h-5 w-5 mt-0.5',
                      propertyType === value ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Square meters */}
          <div className="space-y-2">
            <Label htmlFor="squareMeters">Quadratmeter (ca.)</Label>
            <Input
              id="squareMeters"
              type="number"
              placeholder="z.B. 120"
              value={squareMeters}
              onChange={(e) => setSquareMeters(e.target.value)}
              min={1}
              max={10000}
            />
            <p className="text-xs text-muted-foreground">
              Eine grobe Schätzung reicht aus.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Überspringen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!propertyType || !squareMeters}
          >
            Bestätigen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
