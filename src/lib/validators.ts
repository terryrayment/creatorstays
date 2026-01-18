import { z } from 'zod';

// ============================================================================
// Auth & User Validators
// ============================================================================

export const emailSchema = z.string().email('Please enter a valid email address');

export const signUpSchema = z.object({
  email: emailSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const roleSelectSchema = z.object({
  role: z.enum(['HOST', 'CREATOR'], {
    required_error: 'Please select a role',
  }),
});

// ============================================================================
// Host Profile Validators
// ============================================================================

export const hostProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100),
  companyName: z.string().max(100).optional(),
  bio: z.string().max(1000, 'Bio must be 1000 characters or less').optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

// ============================================================================
// Creator Profile Validators
// ============================================================================

export const creatorProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100),
  bio: z.string().max(1000, 'Bio must be 1000 characters or less').optional(),
  niches: z.array(z.string()).min(1, 'Select at least one niche').max(5, 'Select up to 5 niches'),
  instagramHandle: z
    .string()
    .regex(/^[a-zA-Z0-9._]*$/, 'Invalid Instagram handle')
    .max(30)
    .optional()
    .or(z.literal('')),
  tiktokHandle: z
    .string()
    .regex(/^[a-zA-Z0-9._]*$/, 'Invalid TikTok handle')
    .max(24)
    .optional()
    .or(z.literal('')),
  youtubeHandle: z.string().max(100).optional().or(z.literal('')),
  audienceSize: z.coerce.number().int().min(0).optional(),
  mediaKitUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  preferredDealTypes: z.array(z.enum(['PERCENT_COMMISSION', 'FLAT_FEE', 'POST_FOR_STAY', 'HYBRID'])),
  preferredRateType: z.enum(['PER_BOOKING', 'PER_NIGHT', 'PER_POST', 'NEGOTIABLE']).optional(),
  preferredRateValue: z.coerce.number().min(0).optional(),
});

// ============================================================================
// Property Validators
// ============================================================================

export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(5000).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().max(100).optional(),
  country: z.string().min(2, 'Country is required').max(100),
  airbnbUrl: z
    .string()
    .url('Please enter a valid Airbnb URL')
    .refine((url) => url.includes('airbnb.com'), 'Must be an Airbnb URL'),
  vrboUrl: z.string().url('Please enter a valid VRBO URL').optional().or(z.literal('')),
  directUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  heroImageUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  gallery: z.array(z.string().url()).max(20).optional(),
  maxGuests: z.coerce.number().int().min(1).max(50).optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().min(0).max(20).optional(),
  amenities: z.array(z.string()).optional(),
});

// ============================================================================
// Offer Validators
// ============================================================================

export const offerSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().max(2000).optional(),
    offerType: z.enum(['PERCENT', 'FLAT', 'POST_FOR_STAY', 'HYBRID']),
    currency: z.string().default('USD'),
    percentRate: z.coerce.number().min(0.01).max(1).optional(),
    flatAmount: z.coerce.number().min(1).optional(),
    freeNights: z.coerce.number().int().min(1).max(30).optional(),
    minBookingValue: z.coerce.number().min(0).optional(),
    maxPayout: z.coerce.number().min(0).optional(),
    attributionWindowDays: z.coerce.number().int().min(1).max(90).default(30),
    cookieRequired: z.boolean().default(true),
    requiresApproval: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.offerType === 'PERCENT' || data.offerType === 'HYBRID') {
        return data.percentRate !== undefined && data.percentRate > 0;
      }
      return true;
    },
    { message: 'Percent rate is required for percentage-based offers', path: ['percentRate'] }
  )
  .refine(
    (data) => {
      if (data.offerType === 'FLAT' || data.offerType === 'HYBRID') {
        return data.flatAmount !== undefined && data.flatAmount > 0;
      }
      return true;
    },
    { message: 'Flat amount is required for flat-fee offers', path: ['flatAmount'] }
  )
  .refine(
    (data) => {
      if (data.offerType === 'POST_FOR_STAY') {
        return data.freeNights !== undefined && data.freeNights > 0;
      }
      return true;
    },
    { message: 'Number of free nights is required for stay-based offers', path: ['freeNights'] }
  );

// ============================================================================
// Deal Validators
// ============================================================================

export const dealApplicationSchema = z.object({
  offerId: z.string().cuid(),
  notes: z.string().max(1000).optional(),
  hasAgreedToDisclose: z.boolean().refine((val) => val === true, {
    message: 'You must agree to disclose this partnership in your content (FTC requirement)',
  }),
});

export const dealApprovalSchema = z.object({
  dealId: z.string().cuid(),
  approved: z.boolean(),
  notes: z.string().max(1000).optional(),
  agreedPercent: z.coerce.number().min(0).max(1).optional(),
  agreedFlat: z.coerce.number().min(0).optional(),
});

// ============================================================================
// Booking Claim Validators
// ============================================================================

export const bookingClaimSchema = z.object({
  dealId: z.string().cuid(),
  guestFirstName: z.string().max(100).optional(),
  guestEmail: z.string().email().optional().or(z.literal('')),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  bookingAmount: z.coerce.number().min(0).optional(),
  currency: z.string().default('USD'),
  proofUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  proofNotes: z.string().max(1000).optional(),
}).refine(
  (data) => data.checkOutDate > data.checkInDate,
  { message: 'Check-out date must be after check-in date', path: ['checkOutDate'] }
);

export const bookingClaimReviewSchema = z.object({
  claimId: z.string().cuid(),
  status: z.enum(['APPROVED', 'REJECTED', 'NEEDS_INFO']),
  rejectionReason: z.string().max(1000).optional(),
});

// ============================================================================
// Type exports
// ============================================================================

export type EmailInput = z.infer<typeof emailSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type RoleSelectInput = z.infer<typeof roleSelectSchema>;
export type HostProfileInput = z.infer<typeof hostProfileSchema>;
export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type DealApplicationInput = z.infer<typeof dealApplicationSchema>;
export type DealApprovalInput = z.infer<typeof dealApprovalSchema>;
export type BookingClaimInput = z.infer<typeof bookingClaimSchema>;
export type BookingClaimReviewInput = z.infer<typeof bookingClaimReviewSchema>;
