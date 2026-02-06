# Tech Stack

## Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.5 | React framework with App Router |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 3.x | Utility-first styling |

## Database

| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database (hosted on Neon) |
| **Prisma** | ORM and migrations |
| **Neon** | Serverless Postgres hosting |

## Authentication

| Technology | Purpose |
|------------|---------|
| **NextAuth.js** | Authentication framework |
| **Magic Links** | Email-based passwordless auth |
| **Google OAuth** | Social login option |
| **Instagram OAuth** | Creator verification (Business Login API) |
| **TikTok OAuth** | Creator verification (Login Kit) |

## Email

| Technology | Purpose |
|------------|---------|
| **Resend** | Transactional email API |
| **Custom templates** | HTML email templates in auth.ts |

## Hosting & Infrastructure

| Technology | Purpose |
|------------|---------|
| **Vercel** | Hosting, serverless functions, edge |
| **Namecheap** | Domain registrar |
| **GitHub** | Source control |

## External APIs

| Service | Purpose |
|---------|---------|
| **Instagram Graph API** | Follower counts, profile data |
| **TikTok API** | Follower counts, profile data |
| **Google Places API** | Location autocomplete |

## Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | IDE |
| **Prisma Studio** | Database GUI |
| **Vercel CLI** | Deployment |

## Key Dependencies

```json
{
  "next": "14.2.5",
  "react": "^18",
  "typescript": "^5",
  "@prisma/client": "^5.22.0",
  "next-auth": "^4.24.5",
  "@auth/prisma-adapter": "^1.0.12",
  "tailwindcss": "^3.4.1"
}
```

## File Structure

```
creatorstays/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── creator/       # Creator API
│   │   │   ├── host/          # Host API
│   │   │   └── oauth/         # OAuth callbacks
│   │   ├── dashboard/         # User dashboards
│   │   ├── onboarding/        # Onboarding flows
│   │   └── join/              # Invite code pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # NextAuth config
│   │   ├── prisma.ts         # Prisma client
│   │   └── trust/            # Trust tier logic
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── docs/                      # This documentation
└── public/                    # Static assets
```

## Styling Conventions

- **Colors:** Black, white, accent colors (#FF7A00 orange, #28D17C green, #4AA3FF blue)
- **Borders:** 2-3px solid black borders
- **Border Radius:** Rounded corners (lg, xl, 2xl, full)
- **Typography:** Bold uppercase labels, clean sans-serif body
- **Buttons:** Pill-shaped with hover lift effect (-translate-y-0.5)
