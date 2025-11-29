/**
 * ROOT LAYOUT - Next.js App Router
 * This wraps all pages in the app
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';
import { BottomNavWrapper } from '@/components/navigation/BottomNavWrapper';
import { TopNav } from '@/components/navigation/TopNav';
import { ClearDataButton } from '@/components/debug/ClearDataButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Credit Tracker - Manage Customer Credits',
  description: 'Professional credit tracking system for shopkeepers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AppProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Navigation */}
            <TopNav />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
              {children}
            </main>

            {/* Bottom Navigation - Hidden on bulk payment page */}
            {typeof window !== 'undefined' && !window.location.pathname.includes('/bulk-payment') && <BottomNav />}

            {/* Debug: Clear Data Button - REMOVE IN PRODUCTION */}
            <ClearDataButton />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}