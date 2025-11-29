'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';

export function BottomNavWrapper() {
  const pathname = usePathname();
  
  // Hide bottom navigation on bulk payment page
  if (pathname === '/bulk-payment') {
    return null;
  }
  
  return <BottomNav />;
}

