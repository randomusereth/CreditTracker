/**
 * AUTHENTICATION TYPES
 */

export type User = {
  id: string;
  phoneNumber: string;
  telegramId: string;
  createdAt: string;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};
