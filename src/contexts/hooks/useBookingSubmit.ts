import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PropertyBooking, SlotSelection, ContactDetails } from '@/contexts/BookingContext';

interface SubmitBookingParams {
  properties: PropertyBooking[];
  selectedSlots: SlotSelection[];
  contact: ContactDetails;
}

export function useBookingSubmit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ properties, selectedSlots, contact }: SubmitBookingParams) => {
      const batchId = crypto.randomUUID();

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        const slot = selectedSlots[i] || selectedSlots[0];

        const { error } = await supabase.from('bookings').insert({
          batch_id: batchId,
          property_index: i + 1,
          contact_name: contact.name,
          contact_email: contact.email,
          contact_phone: contact.phone,
          company_name: contact.companyName,
          address: property.address,
          latitude: property.lat,
          longitude: property.lng,
          package_type: property.packageType,
          photo_count: property.photoCount,
          property_type: property.propertyType,
          square_meters: property.squareMeters,
          scheduled_date: slot.date,
          scheduled_start: slot.start,
          scheduled_end: slot.end,
          estimated_duration_minutes: property.durationMinutes,
          status: slot.isWeekendRequest ? 'request' : 'confirmed',
          is_weekend_request: slot.isWeekendRequest,
          source: 'web',
        });

        if (error) throw error;
      }

      return batchId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      console.error('Booking submission error:', error);
    },
  });
}
