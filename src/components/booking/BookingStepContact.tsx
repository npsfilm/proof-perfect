import React, { useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useBookingSubmit } from '@/contexts/hooks/useBookingSubmit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function BookingStepContact() {
  const { contact, setContact, prevStep, isSubmitting, setIsSubmitting, setBookingComplete, selectedSlots, properties } = useBooking();
  const submitBooking = useBookingSubmit();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasWeekendRequest = selectedSlots.some(s => s.isWeekendRequest);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!contact.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }
    
    if (!contact.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'Bitte akzeptieren Sie die AGB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const batchId = await submitBooking.mutateAsync({ properties, selectedSlots, contact });
      setBookingComplete(batchId);
      toast.success(
        hasWeekendRequest 
          ? 'Anfrage erfolgreich gesendet! Wir melden uns in Kürze.' 
          : 'Buchung erfolgreich! Sie erhalten eine Bestätigung per E-Mail.'
      );
    } catch (error) {
      console.error('Booking error:', error);
      setIsSubmitting(false);
      toast.error('Fehler bei der Buchung. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Kontaktdaten</h2>
        <p className="text-muted-foreground">
          Wie können wir Sie erreichen?
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="Max Mustermann"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail *</Label>
            <Input
              id="email"
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder="max@beispiel.de"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={contact.phone || ''}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="+49 123 456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Firma (optional)</Label>
            <Input
              id="company"
              value={contact.companyName || ''}
              onChange={(e) => setContact({ ...contact, companyName: e.target.value })}
              placeholder="Musterfirma GmbH"
            />
          </div>
        </div>

        <div className="pt-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-tight cursor-pointer"
            >
              Ich akzeptiere die{' '}
              <a href="/agb" className="text-primary hover:underline" target="_blank">
                Allgemeinen Geschäftsbedingungen
              </a>{' '}
              und{' '}
              <a href="/datenschutz" className="text-primary hover:underline" target="_blank">
                Datenschutzerklärung
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-destructive mt-1">{errors.terms}</p>
          )}
        </div>

        {hasWeekendRequest && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Hinweis:</strong> Ihre Auswahl enthält Wochenendtermine. 
              Diese werden als Anfrage gesendet und erfordern eine Bestätigung. 
              Es kann ein Wochenendzuschlag von 25-50% anfallen.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
          Zurück
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gesendet...
            </>
          ) : hasWeekendRequest ? (
            'Anfrage senden'
          ) : (
            'Termin reservieren'
          )}
        </Button>
      </div>
    </div>
  );
}
