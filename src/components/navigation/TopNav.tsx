'use client';

import { CreditCard, Settings, LogOut, User, Phone } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/components/providers/AppProvider';
import { useState } from 'react';

export function TopNav() {
  const { user, logout } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-gray-900 dark:text-white">Credit Tracker</h1>
          </Link>
          
          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Settings className="w-5 h-5" />
            </Link>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">{user.telegramId}</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <User className="w-4 h-4" />
                        <span>Telegram ID</span>
                      </div>
                      <p className="text-gray-900 dark:text-white">@{user.telegramId}</p>
                    </div>
                    
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Phone className="w-4 h-4" />
                        <span>Phone Number</span>
                      </div>
                      <p className="text-gray-900 dark:text-white">{user.phoneNumber}</p>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
