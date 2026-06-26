import { Transaction, MonthlyBudget, EmergencyFund, CategoryAllocation } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';

// 1. Currency Formatter
export const getCurrencySymbol = (code: string): string => {
  switch (code) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR': return '₹';
    case 'JPY': return '¥';
    default: return '$';
  }
};

export const formatCurrency = (amount: number, code: string): string => {
  const symbol = getCurrencySymbol(code);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = code === 'JPY'
    ? Math.round(absAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
};

// 2. Date Formatter
export const formatDate = (dateStr: string): string => {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (dateStr === today) {
    return 'Today';
  } else if (dateStr === yesterday) {
    return 'Yesterday';
  }

  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// 3. Overall Totals
export const getTotals = (transactions: Transaction[]) => {
  let income = 0;
  let expense = 0;
  let savings = 0;
  
  transactions.forEach((t) => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
      if (t.category === 'Savings') {
        savings += t.amount;
      }
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
    savings,
    netCashFlow: income - expense,
  };
};

// 4. Month-specific Totals
export const getMonthlyTotals = (transactions: Transaction[], monthStr?: string) => {
  const targetMonth = monthStr || new Date().toISOString().slice(0, 7); // YYYY-MM
  let income = 0;
  let expense = 0;
  let savings = 0;

  transactions.forEach((t) => {
    if (t.date.slice(0, 7) === targetMonth) {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
        if (t.category === 'Savings') {
          savings += t.amount;
        }
      }
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
    savings,
    netCashFlow: income - expense,
  };
};

// 5. Category Breakdown (Expenses)
export interface CategoryShare {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export const getCategoryBreakdown = (transactions: Transaction[]): CategoryShare[] => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);

  if (totalExpense === 0) return [];

  const categoryMap: { [key: string]: number } = {};
  expenses.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  return Object.keys(categoryMap)
    .map((catName) => {
      const amount = categoryMap[catName];
      const percentage = Math.round((amount / totalExpense) * 100);
      const catInfo = EXPENSE_CATEGORIES.find((c) => c.name.toLowerCase() === catName.toLowerCase());
      return {
        name: catName,
        amount,
        percentage,
        color: catInfo ? catInfo.color : '#475569',
      };
    })
    .sort((a, b) => b.amount - a.amount);
};

// 6. Trend Data (6-Month history)
export interface MonthlyTrendPoint {
  monthName: string;
  income: number;
  expense: number;
  savings: number;
}

export const getSixMonthTrend = (transactions: Transaction[]): MonthlyTrendPoint[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trend: MonthlyTrendPoint[] = [];
  
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mIndex = d.getMonth();
    const year = d.getFullYear();
    const mStr = `${year}-${(mIndex + 1).toString().padStart(2, '0')}`;
    
    let income = 0;
    let expense = 0;
    let savings = 0;
    
    transactions.forEach((t) => {
      if (t.date.slice(0, 7) === mStr) {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expense += t.amount;
          if (t.category === 'Savings') {
            savings += t.amount;
          }
        }
      }
    });
    
    trend.push({
      monthName: `${months[mIndex]} ${year.toString().slice(-2)}`,
      income,
      expense,
      savings
    });
  }
  
  return trend;
};

// 7. Transaction Filter Engine (Combined filters)
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  dateSingle?: string;
  dateWeek?: string; // YYYY-MM-DD representing any day of target week
  dateMonth?: string; // YYYY-MM
  dateYear?: string; // YYYY
  category?: string;
  incomeType?: string; // category for income filter
  expenseType?: string; // category for expense filter
  paymentMethod?: string;
  type?: 'income' | 'expense';
  searchQuery?: string;
}

export const filterTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] => {
  return transactions.filter((tx) => {
    // Search Query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchesText = tx.title.toLowerCase().includes(q) || (tx.notes && tx.notes.toLowerCase().includes(q));
      if (!matchesText) return false;
    }

    // Type Filter
    if (filters.type && tx.type !== filters.type) return false;

    // Category Filter
    if (filters.category && filters.category !== 'All' && tx.category !== filters.category) return false;

    // Specific Income Type (category filter for income only)
    if (filters.incomeType && filters.incomeType !== 'All' && tx.type === 'income' && tx.category !== filters.incomeType) return false;

    // Specific Expense Type (category filter for expense only)
    if (filters.expenseType && filters.expenseType !== 'All' && tx.type === 'expense' && tx.category !== filters.expenseType) return false;

    // Payment Method
    if (filters.paymentMethod && filters.paymentMethod !== 'All' && tx.paymentMethod !== filters.paymentMethod) return false;

    // Date Range
    if (filters.startDate && tx.date < filters.startDate) return false;
    if (filters.endDate && tx.date > filters.endDate) return false;

    // Single Day
    if (filters.dateSingle && tx.date !== filters.dateSingle) return false;

    // Month
    if (filters.dateMonth && tx.date.slice(0, 7) !== filters.dateMonth) return false;

    // Year
    if (filters.dateYear && tx.date.slice(0, 4) !== filters.dateYear) return false;

    // Week
    if (filters.dateWeek) {
      const selectedDate = new Date(filters.dateWeek);
      const txDate = new Date(tx.date);
      // Calculate start and end of week (Sunday to Saturday)
      const day = selectedDate.getDay();
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - day);
      startOfWeek.setHours(0,0,0,0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);

      if (txDate < startOfWeek || txDate > endOfWeek) return false;
    }

    return true;
  });
};

// 8. Daily Grouping
export interface DailyGroup {
  date: string;
  totalSpent: number;
  transactions: Transaction[];
}

export const getDailyTransactions = (transactions: Transaction[]): DailyGroup[] => {
  const groupsMap: { [key: string]: Transaction[] } = {};
  
  transactions.forEach((tx) => {
    if (!groupsMap[tx.date]) {
      groupsMap[tx.date] = [];
    }
    groupsMap[tx.date].push(tx);
  });

  return Object.keys(groupsMap)
    .sort((a, b) => b.localeCompare(a)) // Sort dates descending
    .map((date) => {
      const dayTxs = groupsMap[date];
      const totalSpent = dayTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      return {
        date,
        totalSpent,
        transactions: dayTxs
      };
    });
};

// 9. Insights & Advanced Calculations
export interface SpendingInsights {
  highestCategory: { name: string; amount: number } | null;
  lowestCategory: { name: string; amount: number } | null;
  mostFrequentCategory: { name: string; count: number } | null;
  averageDailySpending: number;
}

export const getSpendingInsights = (
  transactions: Transaction[],
  monthStr?: string
): SpendingInsights => {
  const targetMonth = monthStr || new Date().toISOString().slice(0, 7);
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.slice(0, 7) === targetMonth
  );

  if (monthExpenses.length === 0) {
    return {
      highestCategory: null,
      lowestCategory: null,
      mostFrequentCategory: null,
      averageDailySpending: 0
    };
  }

  // Aggregate category spent amounts and frequencies
  const amountsMap: { [key: string]: number } = {};
  const frequencyMap: { [key: string]: number } = {};
  const uniqueDays = new Set<string>();

  monthExpenses.forEach((tx) => {
    amountsMap[tx.category] = (amountsMap[tx.category] || 0) + tx.amount;
    frequencyMap[tx.category] = (frequencyMap[tx.category] || 0) + 1;
    uniqueDays.add(tx.date);
  });

  // Calculate highest & lowest
  let highest = { name: '', amount: -1 };
  let lowest = { name: '', amount: Infinity };
  Object.keys(amountsMap).forEach((cat) => {
    const amt = amountsMap[cat];
    if (amt > highest.amount) {
      highest = { name: cat, amount: amt };
    }
    if (amt < lowest.amount) {
      lowest = { name: cat, amount: amt };
    }
  });

  // Calculate most frequent
  let mostFreq = { name: '', count: -1 };
  Object.keys(frequencyMap).forEach((cat) => {
    const count = frequencyMap[cat];
    if (count > mostFreq.count) {
      mostFreq = { name: cat, count };
    }
  });

  // Calculate average daily spending in this month
  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const year = parseInt(targetMonth.split('-')[0]);
  const month = parseInt(targetMonth.split('-')[1]);
  const daysInMonth = new Date(year, month, 0).getDate();
  const averageDailySpending = totalSpent / daysInMonth;

  return {
    highestCategory: highest.amount !== -1 ? highest : null,
    lowestCategory: lowest.amount !== Infinity ? lowest : null,
    mostFrequentCategory: mostFreq.count !== -1 ? mostFreq : null,
    averageDailySpending
  };
};

// 10. Reports Engine
export interface CategoryReportItem {
  category: string;
  totalSpent: number;
  percentage: number;
}

export const getCategoryReport = (
  transactions: Transaction[],
  monthStr: string
): CategoryReportItem[] => {
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.slice(0, 7) === monthStr
  );
  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  if (totalSpent === 0) return [];

  const map: { [key: string]: number } = {};
  monthExpenses.forEach((t) => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });

  return Object.keys(map).map((catName) => {
    const amt = map[catName];
    return {
      category: catName,
      totalSpent: amt,
      percentage: (amt / totalSpent) * 100
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);
};

export interface MonthlyReport {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  emergencyContribution: number;
  remainingBalance: number;
}

export const getMonthlyReport = (
  transactions: Transaction[],
  budgets: MonthlyBudget[],
  emergencyFund: EmergencyFund,
  monthStr: string
): MonthlyReport => {
  const monthTxs = transactions.filter((t) => t.date.slice(0, 7) === monthStr);
  const budgetConfig = budgets.find((b) => b.month === monthStr);

  let income = budgetConfig ? budgetConfig.totalIncome : 0;
  let expenses = 0;
  let savings = 0;
  let emergencyContribution = 0;

  // Fallback to transactions if budget total income is not configured
  if (income === 0) {
    income = monthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }

  monthTxs.forEach((t) => {
    if (t.type === 'expense') {
      expenses += t.amount;
      if (t.category === 'Savings') {
        savings += t.amount;
      }
      if (t.category === 'Emergency Fund') {
        emergencyContribution += t.amount;
      }
    }
  });

  return {
    month: monthStr,
    income,
    expenses,
    savings,
    emergencyContribution,
    remainingBalance: income - expenses
  };
};

// 11. Financial Health Score
export const getFinancialHealthScore = (
  transactions: Transaction[],
  budgets: MonthlyBudget[],
  emergencyFund: EmergencyFund,
  monthStr?: string
): { score: number; status: string; color: string } => {
  const targetMonth = monthStr || new Date().toISOString().slice(0, 7);
  const totals = getMonthlyTotals(transactions, targetMonth);
  const budget = budgets.find((b) => b.month === targetMonth);
  const income = budget ? budget.totalIncome : (totals.income || 1); // Avoid division by zero

  let savingsScore = 0;
  let emergencyScore = 0;
  let expenseRatioScore = 0;
  let budgetAdherenceScore = 0;

  // 1. Savings Rate (25% weight)
  // Target: 20%+ savings rate gets full points
  const savingsRate = totals.savings > 0 && income > 0 ? (totals.savings / income) * 100 : 0;
  savingsScore = Math.min(25, (savingsRate / 20) * 25);

  // 2. Emergency Fund Status (25% weight)
  // Target: Progress toward Target Fund.
  if (emergencyFund.targetAmount > 0) {
    const progress = (emergencyFund.currentBalance / emergencyFund.targetAmount) * 100;
    emergencyScore = Math.min(25, (progress / 100) * 25);
  } else {
    emergencyScore = 25; // default if no target set
  }

  // 3. Expense-to-Income Ratio (25% weight)
  // Target: keeping expenses <= 70% of income. 100%+ spent gets 0.
  const expenseRatio = income > 0 ? (totals.expense / income) * 100 : 0;
  if (expenseRatio <= 70) {
    expenseRatioScore = 25;
  } else if (expenseRatio >= 100) {
    expenseRatioScore = 0;
  } else {
    expenseRatioScore = ((100 - expenseRatio) / 30) * 25;
  }

  // 4. Budget Adherence (25% weight)
  // Check allocated categories and confirm spent <= allocated
  if (budget && budget.allocations.length > 0) {
    let adheredCount = 0;
    budget.allocations.forEach((alloc) => {
      // Find spent amount in category for this month
      const spentInCat = transactions
        .filter((t) => t.type === 'expense' && t.category === alloc.category && t.date.slice(0, 7) === targetMonth)
        .reduce((sum, t) => sum + t.amount, 0);

      if (spentInCat <= alloc.allocatedAmount) {
        adheredCount++;
      }
    });
    budgetAdherenceScore = (adheredCount / budget.allocations.length) * 25;
  } else {
    budgetAdherenceScore = 25; // Default if no allocations made
  }

  const finalScore = Math.round(savingsScore + emergencyScore + expenseRatioScore + budgetAdherenceScore);

  let status = 'Excellent';
  let color = '#10B981'; // Green

  if (finalScore < 50) {
    status = 'Critical';
    color = '#EF4444'; // Red
  } else if (finalScore < 75) {
    status = 'Fair';
    color = '#F59E0B'; // Orange
  } else if (finalScore < 90) {
    status = 'Good';
    color = '#2563EB'; // Blue
  }

  return {
    score: finalScore,
    status,
    color
  };
};

// 12. Smart Financial Insights Generator
export const getFinancialInsights = (
  transactions: Transaction[],
  budgetsOrLimit?: MonthlyBudget[] | number,
  emergencyFund?: EmergencyFund,
  monthStr?: string
): string[] => {
  const targetMonth = monthStr || new Date().toISOString().slice(0, 7);
  const totals = getMonthlyTotals(transactions, targetMonth);
  
  // Resolve budgets array and legacy single budget limit
  let budgets: MonthlyBudget[] = [];
  let legacyLimit: number | undefined = undefined;

  if (Array.isArray(budgetsOrLimit)) {
    budgets = budgetsOrLimit;
  } else if (typeof budgetsOrLimit === 'number') {
    legacyLimit = budgetsOrLimit;
  }

  const budget = budgets.find((b) => b.month === targetMonth);
  const insights: string[] = [];

  if (transactions.length === 0) {
    return ['No transactions found. Add income or expenses to get dynamic insights.'];
  }

  const incomeVal = budget ? budget.totalIncome : (totals.income || 0);

  // 1. Budget Adherence Overrun Check
  if (budget) {
    let overruns = 0;
    let unusedCategories: string[] = [];

    budget.allocations.forEach((alloc) => {
      const spentInCat = transactions
        .filter((t) => t.type === 'expense' && t.category === alloc.category && t.date.slice(0, 7) === targetMonth)
        .reduce((sum, t) => sum + t.amount, 0);

      if (spentInCat > alloc.allocatedAmount) {
        overruns++;
        insights.push(`🚨 You exceeded your ${alloc.category} budget of $${alloc.allocatedAmount} by $${(spentInCat - alloc.allocatedAmount).toFixed(2)}.`);
      } else if (spentInCat === 0 && alloc.allocatedAmount > 0) {
        unusedCategories.push(alloc.category);
      }
    });

    if (overruns === 0 && budget.allocations.length > 0) {
      insights.push(`🎉 Excellent budget discipline! You have stayed within all allocated category budgets this month.`);
    }

    if (unusedCategories.length > 0) {
      insights.push(`💡 Unused budget: You haven't spent anything in ${unusedCategories.slice(0, 3).join(', ')} allocations yet. You can re-route these savings!`);
    }
  } else if (legacyLimit !== undefined && legacyLimit > 0) {
    const totalSpent = totals.expense;
    if (totalSpent > legacyLimit) {
      insights.push(`🚨 You exceeded your monthly budget limit of $${legacyLimit} by $${(totalSpent - legacyLimit).toFixed(2)}.`);
    } else if (totalSpent > legacyLimit * 0.8) {
      insights.push(`⚠️ You've used over 80% of your monthly budget limit. Try to curb unnecessary spending.`);
    } else {
      insights.push(`🎉 You are well within your monthly budget limit of $${legacyLimit}.`);
    }
  }

  // 2. Savings Rate check
  if (incomeVal > 0) {
    const savingsRate = (totals.savings / incomeVal) * 100;
    if (savingsRate >= 20) {
      insights.push(`🎉 High Savings Rate: You saved ${savingsRate.toFixed(0)}% of your income this month. Keep up this momentum!`);
    } else if (savingsRate > 0) {
      insights.push(`💡 Savings Opportunity: Your savings rate is ${savingsRate.toFixed(0)}%. Try to hit 20% by cutting minor miscellaneous expenses.`);
    } else {
      insights.push(`⚠️ Zero Savings: You didn't allocate any funds to Savings this month. Set aside at least 10% next month.`);
    }
  }

  // 3. Emergency Fund Progress check
  if (emergencyFund && emergencyFund.targetAmount > 0) {
    const progressPercent = (emergencyFund.currentBalance / emergencyFund.targetAmount) * 100;
    if (progressPercent >= 100) {
      insights.push(`🎉 Emergency Fund Secure: You've fully hit 100% of your $${emergencyFund.targetAmount} safety net. You can re-route contributions to investments.`);
    } else {
      insights.push(`🛡️ Safety Net: Your Emergency Fund is at ${progressPercent.toFixed(0)}% of your target. Your monthly contribution of $${emergencyFund.monthlyContribution} gets you closer.`);
    }
  }

  // 4. Month-over-Month Category Spending Comparison
  // Compare June to May
  const parts = targetMonth.split('-');
  const yr = parseInt(parts[0]);
  const mo = parseInt(parts[1]);
  const prevMonthStr = `${mo === 1 ? yr - 1 : yr}-${(mo === 1 ? 12 : mo - 1).toString().padStart(2, '0')}`;

  const prevMonthExpenses = transactions.filter((t) => t.type === 'expense' && t.date.slice(0, 7) === prevMonthStr);
  
  if (prevMonthExpenses.length > 0) {
    const currentBreakdown = getCategoryBreakdown(transactions.filter(t => t.date.slice(0, 7) === targetMonth));
    const prevBreakdown = getCategoryBreakdown(prevMonthExpenses);

    // Look for significant MoM spending increases (> 15%) in categories
    currentBreakdown.forEach((curr) => {
      const prev = prevBreakdown.find((p) => p.name === curr.name);
      if (prev && prev.amount > 0) {
        const increasePercent = ((curr.amount - prev.amount) / prev.amount) * 100;
        if (increasePercent >= 15) {
          insights.push(`🔍 Spending Surge: Expenses in ${curr.name} increased by ${increasePercent.toFixed(0)}% MoM (+$${(curr.amount - prev.amount).toFixed(0)}).`);
        } else if (increasePercent <= -15) {
          insights.push(`💡 Spending Drop: Great job! Your spending in ${curr.name} dropped by ${Math.abs(increasePercent).toFixed(0)}% compared to last month.`);
        }
      }
    });
  }

  // Fallbacks
  if (insights.length < 2) {
    insights.push('💡 Financial Rule: Try aiming for the 50/30/20 rule (50% Needs, 30% Wants, 20% Savings).');
    insights.push('💡 Tip: Setting up automated savings transfers right on payday guarantees you pay yourself first.');
  }

  return insights;
};
