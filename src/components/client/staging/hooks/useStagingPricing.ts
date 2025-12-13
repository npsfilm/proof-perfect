import { useServices } from '@/hooks/useServices';
import { useDiscounts } from '@/hooks/useDiscounts';

interface UseStagingPricingReturn {
  basePrice: number;
  totalPrice: number;
  buyQuantity: number;
  freeQuantity: number;
  freePhotos: number;
}

export function useStagingPricing(photoCount: number): UseStagingPricingReturn {
  const { data: services } = useServices({ showIn: 'finalize' });
  const { data: discounts } = useDiscounts();

  // Get staging service price from DB
  const stagingService = services?.find(s => 
    s.slug === 'virtuelles-staging' || s.slug === 'virtual-staging'
  );
  const basePrice = stagingService ? stagingService.price_cents / 100 : 89;

  // Get discount info
  const stagingDiscount = discounts?.find(d => 
    d.discount_type === 'buy_x_get_y' && d.is_active
  );
  const buyQuantity = stagingDiscount?.buy_quantity || 5;
  const freeQuantity = stagingDiscount?.free_quantity || 1;

  // Calculate pricing with dynamic discount
  const discountThreshold = buyQuantity + freeQuantity;
  const discountSets = Math.floor(photoCount / discountThreshold);
  const remainingPhotos = photoCount % discountThreshold;
  const freePhotos = discountSets * freeQuantity + 
    (remainingPhotos > buyQuantity ? remainingPhotos - buyQuantity : 0);
  const totalPrice = (photoCount - freePhotos) * basePrice;

  return { basePrice, totalPrice, buyQuantity, freeQuantity, freePhotos };
}
