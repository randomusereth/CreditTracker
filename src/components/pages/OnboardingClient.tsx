'use client';

/**
 * ONBOARDING CLIENT COMPONENT
 * Allows users to create an account with Telegram phone and ID
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Send, AlertCircle, CreditCard } from 'lucide-react';
import { createUser, saveCurrentUser, validatePhoneNumber, validateTelegramId } from '@/lib/auth';

export function OnboardingClient() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; telegram?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate inputs
    const newErrors: { phone?: string; telegram?: string } = {};
    
    if (!phoneNumber.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!telegramId.trim()) {
      newErrors.telegram = 'Telegram ID is required';
    } else if (!validateTelegramId(telegramId)) {
      newErrors.telegram = 'Telegram ID should be 5-32 alphanumeric characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create user account
    setIsSubmitting(true);
    
    try {
      const user = await createUser(phoneNumber.trim(), telegramId.trim());
      saveCurrentUser(user);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    } catch (error) {
      setErrors({ phone: 'Failed to create account. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            Welcome to Credit Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your account to get started
          </p>
          
          {/* NEW: Visual indicator */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 dark:text-green-400">New User Onboarding</span>
          </div>
        </div>

        {/* Onboarding Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Input */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Telegram Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                    errors.phone
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.phone && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.phone}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enter your phone number with country code (e.g., +251912345678)
              </p>
            </div>

            {/* Telegram ID Input */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Telegram ID (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Send className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="@yourusername"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border ${
                    errors.telegram
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.telegram && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.telegram}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Your Telegram username without @ symbol
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    This information will be used for payment reminders and notifications via Telegram.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Get Started</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Your data is stored locally on your device and is completely private.
        </p>
      </div>
    </div>
  );
}