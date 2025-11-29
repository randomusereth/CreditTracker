'use client';

/**
 * SETTINGS CLIENT COMPONENT
 * Wrapper that connects the SettingsPage component to Next.js App Context
 */

import { useRouter } from 'next/navigation';
import { useApp } from '@/components/providers/AppProvider';
import SettingsPage from '@/components/SettingsPage';
import { AppSettings, ShopInfo } from '@/types';

export function SettingsClient() {
  const router = useRouter();
  const { appState, setAppState, updateSettings, user, logout } = useApp();

  const handleUpdateSettings = (settings: Partial<AppSettings>) => {
    updateSettings(settings);
  };

  const handleUpdateShopInfo = (shopInfo: ShopInfo) => {
    setAppState(prev => ({
      ...prev,
      shopInfo,
    }));
  };

  return (
    <SettingsPage
      settings={appState.settings}
      onUpdateSettings={handleUpdateSettings}
      shopInfo={appState.shopInfo}
      onUpdateShopInfo={handleUpdateShopInfo}
      user={user}
      onLogout={logout}
    />
  );
}


