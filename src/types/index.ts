export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string format YYYY-MM-DD
  notes?: string;
  paymentMethod?: string; // e.g. 'Cash', 'Card', 'Bank Transfer', 'UPI'
  attachmentUrl?: string; // Optional attachment link
}

export interface CategoryAllocation {
  category: string;
  allocatedAmount: number;
  allocatedPercentage: number;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM format
  totalIncome: number;
  allocations: CategoryAllocation[];
  unallocatedAmount: number;
}

export interface Budget {
  limit: number;
}

export interface EmergencyFund {
  targetAmount: number;
  currentBalance: number;
  monthlyContribution: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface UserSettings {
  darkMode: boolean;
  currency: string; // e.g. 'USD', 'EUR', 'GBP', 'INR', 'JPY'
}

export interface AuthState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  rememberMe: boolean;
}

export interface FinanceState {
  transactions: Transaction[];
  monthlyBudgets: MonthlyBudget[];
  budget: Budget; // Compatibility with legacy screens
  emergencyFund: EmergencyFund;
  customCategories: string[];
  settings: UserSettings;
  auth: AuthState;
  authLoading: boolean;
  
  // Actions
  // Auth
  login: (name: string, email: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, email: string, avatarUrl?: string) => void;
  
  // Transactions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Budgets
  setMonthlyBudget: (month: string, totalIncome: number, allocations: CategoryAllocation[]) => void;
  updateBudget: (limit: number) => void; // Compatibility with legacy screens
  
  // Emergency Fund
  updateEmergencyFund: (targetAmount: number, currentBalance: number, monthlyContribution: number) => void;
  
  // Custom Categories
  addCustomCategory: (name: string) => Promise<boolean>;
  deleteCustomCategory: (name: string) => void;
  
  // Settings
  toggleDarkMode: () => void;
  setCurrency: (currency: string) => void;
  importData: (jsonData: string) => boolean;
  resetAllData: () => void;

  // Supabase Sync helpers
  initializeAuth: () => Promise<void>;
  fetchUserData: () => Promise<void>;
}
