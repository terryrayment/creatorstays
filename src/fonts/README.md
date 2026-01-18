# Fonts Setup

This directory should contain the Fraunces font files. You can download them from Google Fonts:

1. Visit: https://fonts.google.com/specimen/Fraunces
2. Download the font family
3. Convert to woff2 format if needed
4. Place the following files here:
   - Fraunces-Regular.woff2
   - Fraunces-Medium.woff2
   - Fraunces-SemiBold.woff2
   - Fraunces-Bold.woff2

Alternatively, you can use the Google Fonts CDN by modifying `src/app/layout.tsx` to import from `next/font/google` instead of local fonts.

## Quick Alternative Setup

If you prefer not to download fonts, update `src/app/layout.tsx`:

```typescript
import { DM_Sans, Fraunces } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});
```
