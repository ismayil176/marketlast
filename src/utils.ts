import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = 'AZN') {
  return new Intl.NumberFormat('az-AZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function getProxyImageUrl(url: string) {
  if (!url) return 'https://picsum.photos/seed/placeholder/400/400';
  return `/api/images/proxy?url=${encodeURIComponent(url)}`;
}
