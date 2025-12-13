import { useBooking } from '@/contexts/BookingContext';
import { useBookingPackages } from '@/hooks/useBookingPackages';

export function useBookingPrice() {
  const { properties } = useBooking();
  const { data: packages, isLoading } = useBookingPackages();

  const getPackagePrice = (packageType: string, photoCount: number): number => {
    if (!packages) return 0;
    const pkg = packages.find(
      p => p.package_type === packageType && p.photo_count === photoCount
    );
    return pkg?.price_cents || 0;
  };

  const getPackageDuration = (packageType: string, photoCount: number): number => {
    if (!packages) return 0;
    const pkg = packages.find(
      p => p.package_type === packageType && p.photo_count === photoCount
    );
    return pkg?.duration_minutes || 0;
  };

  const totalPrice = properties.reduce((sum, p) => {
    return sum + getPackagePrice(p.packageType, p.photoCount);
  }, 0);

  const totalDuration = properties.reduce((sum, p) => {
    return sum + (p.durationMinutes || 0);
  }, 0);

  return {
    totalPrice,
    totalDuration,
    getPackagePrice,
    getPackageDuration,
    isLoading,
  };
}
