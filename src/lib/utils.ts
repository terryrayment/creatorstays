import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    ...options,
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(d);
}

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length - 3) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function parseAirbnbUrl(url: string): { listingId: string | null } {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/rooms\/(\d+)/);
    return { listingId: match ? match[1] : null };
  } catch {
    return { listingId: null };
  }
}

export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function calculatePayout(
  bookingAmount: number,
  percentRate: number | null,
  flatAmount: number | null,
  maxPayout?: number | null
): { creatorPayout: number; platformFeeHost: number; platformFeeCreator: number; hostTotal: number } {
  const PLATFORM_FEE_RATE = 0.15;

  let basePayout = 0;
  if (percentRate !== null) {
    basePayout = bookingAmount * percentRate;
  } else if (flatAmount !== null) {
    basePayout = flatAmount;
  }

  // Apply max payout cap if set
  if (maxPayout !== null && maxPayout !== undefined && basePayout > maxPayout) {
    basePayout = maxPayout;
  }

  // Platform fees: 15% from each side
  const platformFeeHost = basePayout * PLATFORM_FEE_RATE;
  const platformFeeCreator = basePayout * PLATFORM_FEE_RATE;

  // Host pays: payout + 15% platform fee
  const hostTotal = basePayout + platformFeeHost;

  // Creator receives: payout - 15% platform fee
  const creatorPayout = basePayout - platformFeeCreator;

  return {
    creatorPayout: Math.round(creatorPayout * 100) / 100,
    platformFeeHost: Math.round(platformFeeHost * 100) / 100,
    platformFeeCreator: Math.round(platformFeeCreator * 100) / 100,
    hostTotal: Math.round(hostTotal * 100) / 100,
  };
}

export function getAttributionWindowEnd(clickDate: Date, windowDays: number): Date {
  const end = new Date(clickDate);
  end.setDate(end.getDate() + windowDays);
  return end;
}

export function isWithinAttributionWindow(clickDate: Date, windowDays: number): boolean {
  const windowEnd = getAttributionWindowEnd(clickDate, windowDays);
  return new Date() <= windowEnd;
}

export const NICHES = [
  'Travel',
  'Lifestyle',
  'Luxury',
  'Family',
  'Adventure',
  'Wellness',
  'Food & Dining',
  'Photography',
  'Budget Travel',
  'Solo Travel',
  'Couples',
  'Digital Nomad',
  'Outdoor',
  'Beach',
  'Mountain',
  'Urban',
  'Rural',
  'Eco-Tourism',
] as const;

export const AMENITIES = [
  'WiFi',
  'Parking',
  'Pool',
  'Hot Tub',
  'Kitchen',
  'Washer/Dryer',
  'Air Conditioning',
  'Heating',
  'Pet Friendly',
  'Ocean View',
  'Mountain View',
  'City View',
  'Beach Access',
  'Gym',
  'Workspace',
  'Smart TV',
  'Fireplace',
  'BBQ Grill',
  'Outdoor Space',
  'EV Charger',
] as const;
