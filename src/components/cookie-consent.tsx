'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    // Check if user has already made a choice
    const consent = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cs_consent='));

    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const setCookieConsent = (value: 'accepted' | 'declined') => {
    // Set cookie with 1 year expiry
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `cs_consent=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleAccept = () => {
    setCookieConsent('accepted');
  };

  const handleDecline = () => {
    setCookieConsent('declined');
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300',
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border rounded-2xl shadow-lg p-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 pr-8 sm:pr-0">
              <h3 className="font-semibold mb-1">We use cookies</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to track referrals and attribute bookings to creators. 
                This helps ensure creators get credited for their influence. 
                You can decline, but attribution may not work correctly.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleDecline}>
                Decline
              </Button>
              <Button size="sm" onClick={handleAccept}>
                Accept
              </Button>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="absolute top-3 right-3 sm:hidden p-1 rounded-lg hover:bg-accent"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
