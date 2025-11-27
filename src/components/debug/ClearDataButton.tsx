'use client';

/**
 * DEBUG COMPONENT - Clear all localStorage data
 * Use this to test the new user flow
 */

import { Trash2 } from 'lucide-react';

export function ClearDataButton() {
  const handleClearAll = () => {
    if (confirm('This will clear ALL data and log you out. Continue?')) {
      localStorage.clear();
      window.location.href = '/onboarding';
    }
  };

  return (
    <button
      onClick={handleClearAll}
      className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      <span className="text-sm">Clear All Data (Debug)</span>
    </button>
  );
}
