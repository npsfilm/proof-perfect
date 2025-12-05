import { useState } from 'react';
import { User, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBooking } from '@/contexts/BookingContext';

export function BookingStepContact() {
  const { contactDetails, setContactDetails, completeCurrentBooking, prevStep, isLastProperty } = useBooking();
  const [formData, setFormData] = useState(contactDetails);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefonnummer ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setContactDetails(formData);
      completeCurrentBooking();
    }
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[400px] px-4 py-8">
      <div className="text-center mb-8">
        <User className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Ihre Kontaktdaten
        </h2>
        <p className="text-muted-foreground">
          Wie können wir Sie erreichen?
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Name *
          </Label>
          <Input
            id="name"
            placeholder="Max Mustermann"
            value={formData.name}
            onChange={handleChange('name')}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            E-Mail *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="max@beispiel.de"
            value={formData.email}
            onChange={handleChange('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Telefon *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+49 123 456789"
            value={formData.phone}
            onChange={handleChange('phone')}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>

        {/* Company (optional) */}
        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Unternehmen (optional)
          </Label>
          <Input
            id="company"
            placeholder="Musterfirma GmbH"
            value={formData.company || ''}
            onChange={handleChange('company')}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-8 w-full max-w-md">
        <Button variant="outline" size="lg" className="flex-1" onClick={prevStep}>
          Zurück
        </Button>
        <Button size="lg" className="flex-1" onClick={handleSubmit}>
          {isLastProperty() ? 'Buchung abschließen' : 'Weiter zum nächsten Objekt'}
        </Button>
      </div>
    </div>
  );
}
