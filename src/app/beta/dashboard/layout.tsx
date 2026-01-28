"use client"

import AdminGate from '@/components/admin-gate';
import { DashboardHeader } from '@/components/navigation/dashboard-header';
import { usePathname } from 'next/navigation';

export default function BetaDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Determine variant based on path
  const variant = pathname?.includes('/creator') ? 'creator' : 'host';
  
  return (
    <AdminGate>
      <div className="min-h-screen bg-black">
        <DashboardHeader variant={variant} />
        <main>{children}</main>
      </div>
    </AdminGate>
  );
}
