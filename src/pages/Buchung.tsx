import { BookingFunnel } from '@/components/booking/BookingFunnel';
import { Helmet } from 'react-helmet-async';

export default function Buchung() {
  return (
    <>
      <Helmet>
        <title>Shooting buchen | ImmoOnPoint</title>
        <meta name="description" content="Buchen Sie Ihr professionelles Immobilienshooting online. Foto, Drohne oder Kombi-Pakete verfügbar." />
      </Helmet>
      <BookingFunnel />
    </>
  );
}
