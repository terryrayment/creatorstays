'use client';

import { usePathname } from 'next/navigation';

/**
 * Hook to determine if we're in the beta dashboard and provide the correct base path
 * Returns { isBeta: boolean, dashboardPath: string }
 * 
 * Usage:
 * const { dashboardPath } = useDashboardPath()
 * <Link href={`${dashboardPath}/host/settings`}>Settings</Link>
 */
export function useDashboardPath() {
  const pathname = usePathname();
  const isBeta = pathname?.startsWith('/beta/');
  
  return {
    isBeta,
    basePath: isBeta ? '/beta/dashboard' : '/dashboard',
    dashboardPath: isBeta ? '/beta/dashboard' : '/dashboard',
    hostPath: isBeta ? '/beta/dashboard/host' : '/dashboard/host',
    creatorPath: isBeta ? '/beta/dashboard/creator' : '/dashboard/creator',
  };
}
