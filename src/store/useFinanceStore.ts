import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FinanceState, Transaction, MonthlyBudget, EmergencyFund, AuthState, UserSettings, UserProfile, CategoryAllocation } from '../types';
import { supabase } from '../utils/supabase';

const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
  // --- JUNE 2026 TRANSACTIONS ---
  {
    id: 'tx-june-1',
    title: 'Monthly Base Salary',
    amount: 5000,
    type: 'income',
    category: 'Primary Salary',
    date: '2026-06-01',
    notes: 'Base salary for June.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-june-2',
    title: 'Website Development Design',
    amount: 1000,
    type: 'income',
    category: 'Freelance Income',
    date: '2026-06-03',
    notes: 'Payment for landing page design.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-june-3',
    title: 'Apartment Rent',
    amount: 1200,
    type: 'expense',
    category: 'Rent',
    date: '2026-06-04',
    notes: 'June house rent.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-june-4',
    title: 'Car Loan EMI Payment',
    amount: 500,
    type: 'expense',
    category: 'EMI / Loans',
    date: '2026-06-05',
    notes: 'Monthly car financing EMI.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-june-5',
    title: 'Supermarket Groceries',
    amount: 180,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-06-06',
    notes: 'Weekly fresh food supplies.',
    paymentMethod: 'Card'
  },
  {
    id: 'tx-june-6',
    title: 'Electricity & Water Bill',
    amount: 120,
    type: 'expense',
    category: 'Utilities',
    date: '2026-06-10',
    notes: 'Summer power bills.',
    paymentMethod: 'UPI'
  },
  {
    id: 'tx-june-7',
    title: 'Summer Fashion Shopping',
    amount: 250,
    type: 'expense',
    category: 'Shopping',
    date: '2026-06-12',
    notes: 'New shirts and sandals.',
    paymentMethod: 'Card'
  },
  {
    id: 'tx-june-8',
    title: 'Netflix & Spotify Subs',
    amount: 30,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-06-14',
    notes: 'Monthly media services subscriptions.',
    paymentMethod: 'Card'
  },
  {
    id: 'tx-june-9',
    title: 'Monthly Savings Deposit',
    amount: 1500,
    type: 'expense',
    category: 'Savings',
    date: '2026-06-16',
    notes: 'Transferred to high-yield savings.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-june-10',
    title: 'Emergency Reserve Topup',
    amount: 300,
    type: 'expense',
    category: 'Emergency Fund',
    date: '2026-06-17',
    notes: 'Emergency fund contribution.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-june-11',
    title: 'Bistro Lunch & Drinks',
    amount: 95,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-06-19',
    notes: 'Friday dinner with team.',
    paymentMethod: 'Cash'
  },
  {
    id: 'tx-june-12',
    title: 'General Miscellaneous Costs',
    amount: 60,
    type: 'expense',
    category: 'Miscellaneous',
    date: '2026-06-22',
    notes: 'Minor daily hardware purchases.',
    paymentMethod: 'UPI'
  },
  
  // --- MAY 2026 TRANSACTIONS (MoM Comparison) ---
  {
    id: 'tx-may-1',
    title: 'Monthly Base Salary',
    amount: 5000,
    type: 'income',
    category: 'Primary Salary',
    date: '2026-05-01',
    notes: 'Base salary for May.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-may-2',
    title: 'Apartment Rent',
    amount: 1200,
    type: 'expense',
    category: 'Rent',
    date: '2026-05-04',
    notes: 'May house rent.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-may-3',
    title: 'Car Loan EMI Payment',
    amount: 500,
    type: 'expense',
    category: 'EMI / Loans',
    date: '2026-05-05',
    notes: 'Car EMI.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-may-4',
    title: 'Groceries & Eats',
    amount: 320,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-05-08',
    notes: 'Monthly groceries stock.',
    paymentMethod: 'Card'
  },
  {
    id: 'tx-may-5',
    title: 'Electricity & Gas Bills',
    amount: 130,
    type: 'expense',
    category: 'Utilities',
    date: '2026-05-10',
    notes: 'Utility payments.',
    paymentMethod: 'UPI'
  },
  {
    id: 'tx-may-6',
    title: 'Apparel Purchases',
    amount: 190,
    type: 'expense',
    category: 'Shopping',
    date: '2026-05-12',
    notes: 'Malls clothes.',
    paymentMethod: 'Card'
  },
  {
    id: 'tx-may-7',
    title: 'Cinema & Movie Tickets',
    amount: 50,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-05-15',
    notes: 'Movie tickets and popcorn.',
    paymentMethod: 'Cash'
  },
  {
    id: 'tx-may-8',
    title: 'Savings Allocation',
    amount: 1500,
    type: 'expense',
    category: 'Savings',
    date: '2026-05-18',
    notes: 'Savings deposit.',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'tx-may-9',
    title: 'Emergency Fund Contribution',
    amount: 300,
    type: 'expense',
    category: 'Emergency Fund',
    date: '2026-05-19',
    notes: 'Emergency savings.',
    paymentMethod: 'Bank Transfer'
  }
];

const INITIAL_MOCK_BUDGETS: MonthlyBudget[] = [
  {
    month: '2026-06',
    totalIncome: 6000,
    allocations: [
      { category: 'Rent', allocatedAmount: 1200, allocatedPercentage: 20.00 },
      { category: 'EMI / Loans', allocatedAmount: 500, allocatedPercentage: 8.33 },
      { category: 'Food & Dining', allocatedAmount: 500, allocatedPercentage: 8.33 },
      { category: 'Utilities', allocatedAmount: 200, allocatedPercentage: 3.33 },
      { category: 'Shopping', allocatedAmount: 400, allocatedPercentage: 6.67 },
      { category: 'Entertainment', allocatedAmount: 300, allocatedPercentage: 5.00 },
      { category: 'Savings', allocatedAmount: 1500, allocatedPercentage: 25.00 },
      { category: 'Emergency Fund', allocatedAmount: 300, allocatedPercentage: 5.00 },
      { category: 'Miscellaneous', allocatedAmount: 300, allocatedPercentage: 5.00 }
    ],
    unallocatedAmount: 800
  },
  {
    month: '2026-05',
    totalIncome: 5000,
    allocations: [
      { category: 'Rent', allocatedAmount: 1200, allocatedPercentage: 24.00 },
      { category: 'EMI / Loans', allocatedAmount: 500, allocatedPercentage: 10.00 },
      { category: 'Food & Dining', allocatedAmount: 450, allocatedPercentage: 9.00 },
      { category: 'Utilities', allocatedAmount: 200, allocatedPercentage: 4.00 },
      { category: 'Shopping', allocatedAmount: 300, allocatedPercentage: 6.00 },
      { category: 'Entertainment', allocatedAmount: 200, allocatedPercentage: 4.00 },
      { category: 'Savings', allocatedAmount: 1500, allocatedPercentage: 30.00 },
      { category: 'Emergency Fund', allocatedAmount: 300, allocatedPercentage: 6.00 },
      { category: 'Miscellaneous', allocatedAmount: 200, allocatedPercentage: 4.00 }
    ],
    unallocatedAmount: 150
  }
];

const DEFAULT_EMERGENCY_FUND: EmergencyFund = {
  targetAmount: 10000,
  currentBalance: 3000, // Preloaded with $3000 total
  monthlyContribution: 200
};

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: true,
  currency: 'USD'
};

const DEFAULT_AUTH: AuthState = {
  user: null,
  isLoggedIn: false,
  rememberMe: false
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      monthlyBudgets: [],
      budget: { limit: 0 }, // Legacy support
      emergencyFund: {
        targetAmount: 0,
        currentBalance: 0,
        monthlyContribution: 0
      },
      customCategories: [],
      settings: DEFAULT_SETTINGS,
      auth: DEFAULT_AUTH,
      authLoading: true,

      // Auth actions
      initializeAuth: async () => {
        set({ authLoading: true });
        
        // Subscribe to auth state changes to keep everything synced
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session) {
            // Fetch fresh data when session is established
            await get().fetchUserData();
          } else {
            // Clear data if logged out
            set({
              transactions: [],
              monthlyBudgets: [],
              budget: { limit: 0 },
              emergencyFund: {
                targetAmount: 0,
                currentBalance: 0,
                monthlyContribution: 0
              },
              customCategories: [],
              auth: {
                user: null,
                isLoggedIn: false,
                rememberMe: get().auth.rememberMe,
              }
            });
          }
          set({ authLoading: false });
        });

        // Initial check for active session
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await get().fetchUserData();
          }
        } catch (e) {
          console.error('Session init failed', e);
        } finally {
          set({ authLoading: false });
        }
      },

      fetchUserData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
          // 1. Fetch Profile settings
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          const userProfile: UserProfile = {
            name: profile?.name || user.user_metadata?.name || 'User',
            email: profile?.email || user.email || '',
          };

          const userSettings: UserSettings = {
            darkMode: profile?.dark_mode !== undefined ? profile.dark_mode : true,
            currency: profile?.currency || 'USD',
          };

          // 2. Fetch Transactions
          const { data: txs } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          const transactionsList: Transaction[] = (txs || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            amount: parseFloat(t.amount),
            type: t.type,
            category: t.category,
            date: t.date,
            notes: t.notes || undefined,
            paymentMethod: t.payment_method || undefined,
            attachmentUrl: t.attachment_url || undefined,
          }));

          // 3. Fetch Budgets
          const { data: budgetsData } = await supabase
            .from('monthly_budgets')
            .select(`
              id,
              month,
              total_income,
              unallocated_amount,
              category_allocations (
                category,
                allocated_amount,
                allocated_percentage
              )
            `)
            .eq('user_id', user.id);

          const monthlyBudgetsList: MonthlyBudget[] = (budgetsData || []).map((b: any) => ({
            month: b.month,
            totalIncome: parseFloat(b.total_income),
            unallocatedAmount: parseFloat(b.unallocated_amount),
            allocations: (b.category_allocations || []).map((a: any) => ({
              category: a.category,
              allocatedAmount: parseFloat(a.allocated_amount),
              allocatedPercentage: parseFloat(a.allocated_percentage),
            })),
          }));

          // 4. Fetch Emergency Fund
          const { data: fund } = await supabase
            .from('emergency_funds')
            .select('*')
            .eq('user_id', user.id)
            .single();

          const emergencyFundObj: EmergencyFund = fund ? {
            targetAmount: parseFloat(fund.target_amount),
            currentBalance: parseFloat(fund.current_balance),
            monthlyContribution: parseFloat(fund.monthly_contribution),
          } : {
            targetAmount: 0,
            currentBalance: 0,
            monthlyContribution: 0,
          };

          // 5. Fetch Custom Categories
          const { data: customCats } = await supabase
            .from('custom_categories')
            .select('name')
            .eq('user_id', user.id);

          const customCategoriesList: string[] = (customCats || []).map((c: any) => c.name);

          // Update State
          set({
            auth: {
              user: userProfile,
              isLoggedIn: true,
              rememberMe: get().auth.rememberMe,
            },
            settings: userSettings,
            transactions: transactionsList,
            monthlyBudgets: monthlyBudgetsList,
            emergencyFund: emergencyFundObj,
            customCategories: customCategoriesList,
            budget: {
              limit: monthlyBudgetsList.find(b => b.month === new Date().toISOString().slice(0, 7))?.totalIncome || 0
            }
          });

        } catch (error) {
          console.error('Error fetching user data from Supabase:', error);
        }
      },

      login: async (name: string, email: string, rememberMe: boolean) => {
        const sanitizedEmail = email.replace(/[^a-zA-Z0-9@._+-]/g, '').trim().toLowerCase();
        const password = sanitizedEmail + '_PassVal!';
        const { data, error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: sanitizedEmail,
              password,
              options: {
                data: { name },
              },
            });
            if (signUpError) throw signUpError;
            await get().fetchUserData();
            return;
          }
          throw error;
        }

        await get().fetchUserData();
      },

      register: async (name: string, email: string, rememberMe: boolean) => {
        const sanitizedEmail = email.replace(/[^a-zA-Z0-9@._+-]/g, '').trim().toLowerCase();
        const password = sanitizedEmail + '_PassVal!';
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: { name },
          },
        });

        if (error) throw error;
        await get().fetchUserData();
      },

      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Signout failed', error);

        set((state) => ({
          transactions: [],
          monthlyBudgets: [],
          budget: { limit: 0 },
          emergencyFund: {
            targetAmount: 0,
            currentBalance: 0,
            monthlyContribution: 0
          },
          customCategories: [],
          auth: {
            user: null,
            isLoggedIn: false,
            rememberMe: state.auth.rememberMe ? true : false,
          },
        }));
      },

      updateProfile: async (name: string, email: string, avatarUrl?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        set((state) => ({
          auth: {
            ...state.auth,
            user: { name, email, avatarUrl },
          },
        }));

        try {
          const { error } = await supabase
            .from('profiles')
            .update({ name, email })
            .eq('id', user.id);

          if (error) throw error;
        } catch (error) {
          console.error('Failed to sync profile update to Supabase:', error);
        }
      },

      // Transaction Actions
      addTransaction: async (newTx: Omit<Transaction, 'id'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const tempId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const localTx: Transaction = { ...newTx, id: tempId };

        let extraFundUpdate = {};
        if (newTx.type === 'expense' && newTx.category === 'Emergency Fund') {
          const currentFund = get().emergencyFund;
          extraFundUpdate = {
            emergencyFund: {
              ...currentFund,
              currentBalance: currentFund.currentBalance + newTx.amount
            }
          };
        }

        set((state) => ({
          transactions: [localTx, ...state.transactions],
          ...extraFundUpdate
        }));

        try {
          const { data, error } = await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              title: newTx.title,
              amount: newTx.amount,
              type: newTx.type,
              category: newTx.category,
              date: newTx.date,
              notes: newTx.notes || null,
              payment_method: newTx.paymentMethod || null,
              attachment_url: newTx.attachmentUrl || null,
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            set((state) => ({
              transactions: state.transactions.map((tx) =>
                tx.id === tempId ? { ...tx, id: data.id } : tx
              ),
            }));
          }

          if (newTx.type === 'expense' && newTx.category === 'Emergency Fund') {
            const currentFund = get().emergencyFund;
            await supabase
              .from('emergency_funds')
              .update({ current_balance: currentFund.currentBalance })
              .eq('user_id', user.id);
          }

        } catch (error) {
          console.error('Failed to sync added transaction to Supabase:', error);
        }
      },

      editTransaction: async (id: string, updatedFields: Partial<Transaction>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const oldTx = get().transactions.find(t => t.id === id);
        if (!oldTx) return;

        let extraFundUpdate = {};
        if (oldTx.category === 'Emergency Fund' && updatedFields.amount !== undefined) {
          const diff = (updatedFields.amount || 0) - oldTx.amount;
          const currentFund = get().emergencyFund;
          extraFundUpdate = {
            emergencyFund: {
              ...currentFund,
              currentBalance: currentFund.currentBalance + diff
            }
          };
        }

        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updatedFields } : tx
          ),
          ...extraFundUpdate
        }));

        try {
          const { error } = await supabase
            .from('transactions')
            .update({
              title: updatedFields.title,
              amount: updatedFields.amount,
              type: updatedFields.type,
              category: updatedFields.category,
              date: updatedFields.date,
              notes: updatedFields.notes !== undefined ? updatedFields.notes : undefined,
              payment_method: updatedFields.paymentMethod !== undefined ? updatedFields.paymentMethod : undefined,
              attachment_url: updatedFields.attachmentUrl !== undefined ? updatedFields.attachmentUrl : undefined,
            })
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          if (oldTx.category === 'Emergency Fund' && updatedFields.amount !== undefined) {
            const currentFund = get().emergencyFund;
            await supabase
              .from('emergency_funds')
              .update({ current_balance: currentFund.currentBalance })
              .eq('user_id', user.id);
          }
        } catch (error) {
          console.error('Failed to sync edited transaction to Supabase:', error);
        }
      },

      deleteTransaction: async (id: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const oldTx = get().transactions.find(t => t.id === id);
        if (!oldTx) return;

        let extraFundUpdate = {};
        if (oldTx.type === 'expense' && oldTx.category === 'Emergency Fund') {
          const currentFund = get().emergencyFund;
          extraFundUpdate = {
            emergencyFund: {
              ...currentFund,
              currentBalance: Math.max(0, currentFund.currentBalance - oldTx.amount)
            }
          };
        }

        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
          ...extraFundUpdate
        }));

        try {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          if (oldTx.type === 'expense' && oldTx.category === 'Emergency Fund') {
            const currentFund = get().emergencyFund;
            await supabase
              .from('emergency_funds')
              .update({ current_balance: currentFund.currentBalance })
              .eq('user_id', user.id);
          }
        } catch (error) {
          console.error('Failed to sync deleted transaction to Supabase:', error);
        }
      },

      // Budget Allocations
      setMonthlyBudget: async (month: string, totalIncome: number, allocations: CategoryAllocation[]) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const totalAllocated = allocations.reduce((sum, item) => sum + item.allocatedAmount, 0);
        const unallocatedAmount = Math.max(0, totalIncome - totalAllocated);

        set((state) => {
          const exists = state.monthlyBudgets.some((b) => b.month === month);
          let updatedBudgets = [];

          if (exists) {
            updatedBudgets = state.monthlyBudgets.map((b) =>
              b.month === month ? { month, totalIncome, allocations, unallocatedAmount } : b
            );
          } else {
            updatedBudgets = [...state.monthlyBudgets, { month, totalIncome, allocations, unallocatedAmount }];
          }

          const currentMonth = new Date().toISOString().slice(0, 7);
          const newBudgetLimit = month === currentMonth ? totalIncome : state.budget.limit;

          return { 
            monthlyBudgets: updatedBudgets,
            budget: { limit: newBudgetLimit }
          };
        });

        try {
          const { data: budgetData, error: budgetError } = await supabase
            .from('monthly_budgets')
            .upsert({
              user_id: user.id,
              month,
              total_income: totalIncome,
              unallocated_amount: unallocatedAmount
            }, {
              onConflict: 'user_id,month'
            })
            .select()
            .single();

          if (budgetError) throw budgetError;

          if (budgetData) {
            await supabase
              .from('category_allocations')
              .delete()
              .eq('budget_id', budgetData.id);

            if (allocations.length > 0) {
              const insertRows = allocations.map((a) => ({
                budget_id: budgetData.id,
                category: a.category,
                allocated_amount: a.allocatedAmount,
                allocated_percentage: a.allocatedPercentage,
              }));

              const { error: allocError } = await supabase
                .from('category_allocations')
                .insert(insertRows);

              if (allocError) throw allocError;
            }
          }
        } catch (error) {
          console.error('Failed to sync monthly budget to Supabase:', error);
        }
      },

      updateBudget: async (limit: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const currentMonth = new Date().toISOString().slice(0, 7);

        set((state) => {
          const updatedBudget = { limit };
          const exists = state.monthlyBudgets.some((b) => b.month === currentMonth);
          let updatedBudgets = state.monthlyBudgets;
          
          if (exists) {
            updatedBudgets = state.monthlyBudgets.map((b) => {
              if (b.month === currentMonth) {
                const totalAllocated = b.allocations.reduce((sum, item) => sum + item.allocatedAmount, 0);
                return {
                  ...b,
                  totalIncome: limit,
                  unallocatedAmount: Math.max(0, limit - totalAllocated)
                };
              }
              return b;
            });
          } else {
            updatedBudgets = [
              ...state.monthlyBudgets,
              {
                month: currentMonth,
                totalIncome: limit,
                allocations: [],
                unallocatedAmount: limit
              }
            ];
          }

          return {
            budget: updatedBudget,
            monthlyBudgets: updatedBudgets
          };
        });

        try {
          const currentB = get().monthlyBudgets.find(b => b.month === currentMonth);
          if (currentB) {
            await supabase
              .from('monthly_budgets')
              .upsert({
                user_id: user.id,
                month: currentMonth,
                total_income: limit,
                unallocated_amount: currentB.unallocatedAmount
              }, {
                onConflict: 'user_id,month'
              });
          }
        } catch (error) {
          console.error('Failed to sync budget limit to Supabase:', error);
        }
      },

      // Emergency Fund
      updateEmergencyFund: async (targetAmount: number, currentBalance: number, monthlyContribution: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        set(() => ({
          emergencyFund: { targetAmount, currentBalance, monthlyContribution }
        }));

        try {
          const { error } = await supabase
            .from('emergency_funds')
            .upsert({
              user_id: user.id,
              target_amount: targetAmount,
              current_balance: currentBalance,
              monthly_contribution: monthlyContribution,
            }, {
              onConflict: 'user_id'
            });

          if (error) throw error;
        } catch (error) {
          console.error('Failed to sync emergency fund to Supabase:', error);
        }
      },

      // Custom Categories
      addCustomCategory: async (name: string) => {
        const normalized = name.trim();
        if (!normalized) return false;
        
        const exists = get().customCategories.some(
          (c) => c.toLowerCase() === normalized.toLowerCase()
        );
        if (exists) return false;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        set((state) => ({
          customCategories: [...state.customCategories, normalized]
        }));

        try {
          const { error } = await supabase
            .from('custom_categories')
            .insert({ user_id: user.id, name: normalized });

          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Failed to sync custom category to Supabase:', error);
          return false;
        }
      },

      deleteCustomCategory: async (name: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        set((state) => ({
          customCategories: state.customCategories.filter((c) => c !== name)
        }));

        try {
          const { error } = await supabase
            .from('custom_categories')
            .delete()
            .eq('user_id', user.id)
            .eq('name', name);

          if (error) throw error;
        } catch (error) {
          console.error('Failed to sync deleted custom category to Supabase:', error);
        }
      },

      // Settings
      toggleDarkMode: async () => {
        const newMode = !get().settings.darkMode;
        set((state) => ({
          settings: {
            ...state.settings,
            darkMode: newMode,
          },
        }));

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({ dark_mode: newMode }).eq('id', user.id);
          }
        } catch (e) {
          console.error('Failed to sync dark mode settings:', e);
        }
      },

      setCurrency: async (currency: string) => {
        set((state) => ({
          settings: {
            ...state.settings,
            currency,
          },
        }));

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({ currency }).eq('id', user.id);
          }
        } catch (e) {
          console.error('Failed to sync currency settings:', e);
        }
      },

      importData: (jsonData: string) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (
            parsed &&
            Array.isArray(parsed.transactions) &&
            Array.isArray(parsed.monthlyBudgets) &&
            parsed.emergencyFund &&
            parsed.settings
          ) {
            set({
              transactions: parsed.transactions,
              monthlyBudgets: parsed.monthlyBudgets,
              budget: parsed.budget || { limit: 0 },
              emergencyFund: parsed.emergencyFund,
              customCategories: parsed.customCategories || [],
              settings: parsed.settings,
            });
            return true;
          }
          return false;
        } catch (e) {
          console.error('Import failed', e);
          return false;
        }
      },

      resetAllData: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        set((state) => ({
          transactions: [],
          monthlyBudgets: [],
          budget: { limit: 0 },
          emergencyFund: {
            targetAmount: 0,
            currentBalance: 0,
            monthlyContribution: 0
          },
          customCategories: [],
          settings: DEFAULT_SETTINGS,
          auth: {
            ...DEFAULT_AUTH,
            rememberMe: state.auth.rememberMe,
            user: state.auth.rememberMe ? state.auth.user : null,
            isLoggedIn: state.auth.rememberMe ? state.auth.isLoggedIn : false,
          },
        }));

        if (user) {
          try {
            await supabase.from('transactions').delete().eq('user_id', user.id);
            await supabase.from('monthly_budgets').delete().eq('user_id', user.id);
            await supabase.from('custom_categories').delete().eq('user_id', user.id);
            await supabase.from('emergency_funds').update({
              target_amount: 0,
              current_balance: 0,
              monthly_contribution: 0
            }).eq('user_id', user.id);
            await supabase.from('profiles').update({
              currency: 'USD',
              dark_mode: true
            }).eq('id', user.id);
          } catch (e) {
            console.error('Failed to clear Supabase data:', e);
          }
        }
      },
    }),
    {
      name: 'financial-tracker-store-v3',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
