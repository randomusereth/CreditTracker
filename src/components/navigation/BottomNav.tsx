'use client';

import { Home, Users, CreditCard, FileText, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';

const translations: Record<string, Record<string, string>> = {
  en: {
    home: 'Home',
    customers: 'Customers',
    credits: 'Credits',
    reports: 'Reports',
    staff: 'Staff',
  },
  am: {
    home: 'መነሻ',
    customers: 'ደንበኞች',
    credits: 'ብድሮች',
    reports: 'ሪፖርቶች',
    staff: 'ሰራተኞች',
  },
};

export function BottomNav() {
  const pathname = usePathname();
  const { user, appState } = useApp();
  const t = (key: string) => translations[appState.settings.language]?.[key] || translations['en'][key];

  // Don't show navigation on onboarding page or if not authenticated
  if (!user || pathname === '/onboarding') return null;

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive('/')
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">{t('home')}</span>
          </Link>
          <Link
            href="/customers"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive('/customers')
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">{t('customers')}</span>
          </Link>
          <Link
            href="/credits"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive('/credits')
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs">{t('credits')}</span>
          </Link>
          <Link
            href="/reports"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive('/reports')
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">{t('reports')}</span>
          </Link>
          <Link
            href="/staff"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive('/staff')
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <UserCog className="w-5 h-5" />
            <span className="text-xs">{t('staff')}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}