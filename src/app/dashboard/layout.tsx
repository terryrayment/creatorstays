"use client"

import { DashboardHeader } from '@/components/navigation/dashboard-header';
import { usePathname } from 'next/navigation';

/**
 * Main Dashboard Layout
 * 
 * IMPORTANT: Do NOT add AdminGate (dev passcode) here.
 * Dashboard pages handle their own auth via useSession.
 * AdminGate is only for dev-only routes like /prototype, /internal.
 * 
 * Protected routes: /beta/dashboard, /dashboard, /onboarding, /admin/login
 * should NEVER require dev passcode for authenticated users.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Determine variant based on path
  const variant = pathname?.includes('/creator') ? 'creator' : 'host';
  
  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader variant={variant} />
      <main>{children}</main>
    </div>
  );
}
