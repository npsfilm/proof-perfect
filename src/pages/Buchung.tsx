import { BookingProvider } from '@/contexts/BookingContext';
import { BookingFunnel } from '@/components/booking/BookingFunnel';

export default function Buchung() {
  return (
    <div className="min-h-full">
      <BookingProvider>
        <BookingFunnel />
      </BookingProvider>
    </div>
  );
}
