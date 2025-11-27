/**
 * TYPE DEFINITIONS
 * All TypeScript types and interfaces for the Credit Tracker app
 */

export type Customer = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
};

export type PaymentRecord = {
  id: string;
  amount: number;
  date: string;
  remainingAfterPayment: number;
  note?: string;
};

export type Credit = {
  id: string;
  customerId: string;
  item: string;
  remarks: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  images: string[];
  date: string;
  status: 'paid' | 'unpaid' | 'partially-paid';
  paymentHistory: PaymentRecord[];
};

export type ShopInfo = {
  name: string;
  region: string;
  city: string;
  phone: string;
  email?: string;
};

export type Staff = {
  id: string;
  name: string;
  role: string;
  permissions: {
    viewReports: boolean;
    addCredit: boolean;
    manageCustomers: boolean;
  };
};

export type AppSettings = {
  theme: 'light' | 'dark';
  language: 'en' | 'am' | 'om';
  calendarType: 'gregorian' | 'ethiopian';
};

export type AppState = {
  customers: Customer[];
  credits: Credit[];
  shopInfo: ShopInfo | null;
  staff: Staff[];
  settings: AppSettings;
};
