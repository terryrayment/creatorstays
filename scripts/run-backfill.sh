#!/bin/bash
# Run the backfill via curl
# You'll need to be logged in and copy your session cookie

echo "To run the backfill, open your browser console while logged in as admin at creatorstays.com and run:"
echo ""
echo "fetch('/api/admin/backfill-infrastructure', { method: 'POST' }).then(r => r.json()).then(console.log)"
echo ""
echo "Or check current stats first:"
echo ""
echo "fetch('/api/admin/backfill-infrastructure').then(r => r.json()).then(console.log)"
