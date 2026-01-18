# CreatorStays

A marketplace connecting content creators with short-term rental hosts for affiliate marketing partnerships.

## Overview

CreatorStays enables:
- **Hosts** to list vacation rental properties and create commission-based offers for creators
- **Creators** to browse properties, apply to offers, and earn commissions on bookings they drive
- **Attribution tracking** via first-party cookies and click tracking
- **Payouts** via Stripe Connect

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5 (Auth.js) with Email Magic Link + Google OAuth
- **Payments**: Stripe (Checkout, Connect, Webhooks)
- **Email**: Resend (transactional) + MailerLite (marketing)
- **Logging**: Pino

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Google OAuth credentials (optional)
- Resend API key (optional)
- MailerLite API key (optional)

### Installation

1. **Clone and install dependencies**

```bash
git clone <repo-url>
cd creatorstays
pnpm install
```

2. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/creatorstays"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_LISTING_FEE="price_..."

# Email (optional)
RESEND_API_KEY="re_..."
MAILERLITE_API_KEY="..."
MAILERLITE_GROUP_HOSTS_ID="..."
MAILERLITE_GROUP_CREATORS_ID="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. **Set up the database**

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

4. **Start the development server**

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Stripe Setup

1. **Create a product for the listing fee**

In Stripe Dashboard:
- Products → Add Product
- Name: "CreatorStays Listing Fee"
- Pricing: $199 one-time
- Copy the Price ID to `STRIPE_PRICE_LISTING_FEE`

2. **Set up Stripe Connect**

- Settings → Connect → Get started
- Configure Express accounts
- Set redirect URLs

3. **Configure webhooks**

For local development, use the Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
pnpm stripe:listen
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

For production, create a webhook endpoint at:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events:
  - `checkout.session.completed`
  - `account.updated`
  - `transfer.created`
  - `payout.paid`

## Project Structure

```
creatorstays/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── (auth)/        # Auth pages
│   │   ├── (dashboard)/   # Protected dashboard
│   │   └── (marketing)/   # Public marketing pages
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── forms/         # Form components
│   │   └── navigation/    # Nav components
│   ├── lib/               # Utilities
│   │   ├── auth.ts        # NextAuth config
│   │   ├── prisma.ts      # Prisma client
│   │   ├── stripe/        # Stripe utilities
│   │   ├── email/         # Email services
│   │   └── validators.ts  # Zod schemas
│   └── types/             # TypeScript types
├── tests/                 # Test files
└── public/                # Static assets
```

## Core Features

### Attribution & Tracking

- **Tracking URLs**: `https://creatorstays.com/r/{trackingToken}`
- **Attribution Window**: Configurable per offer (default 30 days)
- **Cookie-based tracking**: First-party `cs_click` cookie
- **Privacy-first**: Cookie consent required before setting tracking cookies

### Booking Claims & Payouts

Since we cannot access Airbnb booking data:

1. Host submits a booking claim with dates and optional proof
2. System checks for attributed clicks within the attribution window
3. Attribution confidence is calculated (HIGH/MEDIUM/LOW/NONE)
4. Host approves the claim
5. Payout is calculated:
   - Creator payout = commission - 15% platform fee
   - Host pays = commission + 15% platform fee
6. Funds transferred via Stripe Connect

### Fee Structure

- **Host listing fee**: One-time $199
- **Platform fee**: 15% from host side + 15% from creator side = 30% total
- **Example**: $100 commission
  - Host pays: $115 ($100 + $15 fee)
  - Creator receives: $85 ($100 - $15 fee)
  - Platform revenue: $30

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm test:run     # Run tests once

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio

# Stripe
pnpm stripe:listen  # Forward webhooks locally
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run specific test file
pnpm test tests/payout.test.ts
```

## Deployment (Vercel)

1. Push to GitHub

2. Import in Vercel:
   - Connect your repository
   - Set environment variables
   - Deploy

3. Configure production:
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`
   - Add production Stripe keys
   - Configure Stripe webhook for production URL
   - Set up a production PostgreSQL database

## Test Accounts (After Seeding)

| Role | Email | Notes |
|------|-------|-------|
| Admin | admin@creatorstays.com | Full access |
| Host | host@example.com | Has properties & offers |
| Creator | creator@example.com | Has active deal |

## FTC Compliance

Creators must disclose their affiliate relationship. The platform:
- Requires creators to agree to FTC disclosure when accepting deals
- Provides reminder copy in the deal flow
- Stores `hasAgreedToDisclose` on each deal

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact support@creatorstays.com
