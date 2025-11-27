/**
 * Validates Ethiopian phone numbers
 * Accepts formats:
 * - +251968686690 (with country code)
 * - 0968786690 (local format starting with 0)
 * 
 * @param phone - Phone number to validate
 * @returns Object with isValid flag and error message
 */
export function validateEthiopianPhone(phone: string): { isValid: boolean; error?: string } {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const cleaned = phone.trim();

  // Check if it starts with +251 (Ethiopian country code)
  if (cleaned.startsWith('+251')) {
    // Format: +251XXXXXXXXX (should be 13 characters total, 9 digits after +251)
    const digits = cleaned.substring(4); // Get digits after +251
    if (!/^\d{9}$/.test(digits)) {
      return { isValid: false, error: 'Invalid phone number format. After +251, expect 9 digits (e.g., +251912345678)' };
    }
    // Check if it starts with valid Ethiopian mobile prefix (9, 7, or 1)
    const firstDigit = digits[0];
    if (!['9', '7', '1'].includes(firstDigit)) {
      return { isValid: false, error: 'Invalid Ethiopian mobile number. Must start with 9, 7, or 1 after +251' };
    }
    return { isValid: true };
  }

  // Check if it starts with 0 (local format)
  if (cleaned.startsWith('0')) {
    // Format: 0XXXXXXXXX (should be 10 characters total, starting with 0)
    if (!/^0\d{9}$/.test(cleaned)) {
      return { isValid: false, error: 'Invalid phone number format. Should be 10 digits starting with 0 (e.g., 0912345678)' };
    }
    // Check if it starts with valid Ethiopian mobile prefix (09, 07, or 01)
    const prefix = cleaned.substring(0, 2);
    if (!['09', '07', '01'].includes(prefix)) {
      return { isValid: false, error: 'Invalid Ethiopian mobile number. Must start with 09, 07, or 01' };
    }
    return { isValid: true };
  }

  // If it doesn't match either format, check if it has a different country code
  if (cleaned.startsWith('+') && !cleaned.startsWith('+251')) {
    return { isValid: false, error: 'Only Ethiopian phone numbers are allowed (+251 or 0...)' };
  }

  // If it doesn't start with + or 0, it's invalid
  return { isValid: false, error: 'Phone number must start with +251 or 0 (e.g., +251912345678 or 0912345678)' };
}

/**
 * Normalizes phone number to a standard format
 * Converts local format (0...) to international format (+251...)
 * 
 * @param phone - Phone number to normalize
 * @returns Normalized phone number in +251 format
 */
export function normalizeEthiopianPhone(phone: string): string {
  if (!phone) return phone;
  
  const cleaned = phone.trim();
  
  // If already in +251 format, return as is
  if (cleaned.startsWith('+251')) {
    return cleaned;
  }
  
  // If in local format (0...), convert to +251
  if (cleaned.startsWith('0')) {
    return '+251' + cleaned.substring(1);
  }
  
  // If it's just digits, assume it's missing the prefix
  if (/^\d{9}$/.test(cleaned)) {
    return '+251' + cleaned;
  }
  
  return cleaned;
}

