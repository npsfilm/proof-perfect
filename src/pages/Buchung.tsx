import { BookingProvider } from '@/contexts/BookingContext';
import { BookingFunnel } from '@/components/booking/BookingFunnel';

export default function Buchung() {
  return (
    <BookingProvider>
      <BookingFunnel />
    </BookingProvider>
  );
}
