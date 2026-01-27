# iCal Test Fixtures

This directory contains saved iCal files for testing.

To create a fixture from a live URL:
```bash
npx tsx scripts/test-ical.ts https://www.airbnb.com/calendar/ical/...
```

The script will automatically save the response to this directory.
