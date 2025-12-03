import { useState } from "react";
import { ArrowLeft, Loader2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

interface TimeSlot {
  date: string;
  time: string;
}

interface BookingContactFormProps {
  selectedSlot: TimeSlot;
  onBack: () => void;
  onSubmit: (data: { name: string; email: string; phone: string; message: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function BookingContactForm({
  selectedSlot,
  onBack,
  onSubmit,
  isSubmitting,
}: BookingContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedDate = new Date(selectedSlot.date);
  const formattedDate = format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Zeitauswahl
      </button>

      {/* Selected Slot Summary */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="capitalize">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span>{selectedSlot.time} Uhr</span>
        </div>
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ihr vollständiger Name"
            className="rounded-xl"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ihre@email.de"
            className="rounded-xl"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon (optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+49 123 456789"
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Nachricht (optional)</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Beschreiben Sie kurz Ihr Anliegen..."
            className="rounded-xl min-h-[100px]"
          />
        </div>

        <Button
          type="submit"
          className="w-full rounded-full h-12"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Wird gebucht...
            </>
          ) : (
            "Termin buchen"
          )}
        </Button>
      </form>
    </div>
  );
}
