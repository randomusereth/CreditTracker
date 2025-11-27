// Utility function to format numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format number for display in input fields (removes commas for editing)
export function parseFormattedNumber(str: string): number {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

// Format as user types in input field
export function formatInputNumber(value: string): string {
  // Remove all non-digit and non-decimal characters
  const cleaned = value.replace(/[^\d.]/g, '');
  
  // Split by decimal point
  const parts = cleaned.split('.');
  
  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Rejoin with decimal (limit to 2 decimal places)
  if (parts.length > 1) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }
  
  return parts[0];
}
