export interface CategoryInfo {
  name: string;
  icon: string; // Ionicons icons
  color: string;
}

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { name: 'Primary Salary', icon: 'cash-outline', color: '#10B981' }, // Mint
  { name: 'Freelance Income', icon: 'code-working-outline', color: '#2563EB' }, // Blue
  { name: 'Bonus', icon: 'gift-outline', color: '#D97706' }, // Gold
  { name: 'Incentives', icon: 'ribbon-outline', color: '#7C3AED' }, // Violet
  { name: 'Other Income', icon: 'ellipsis-horizontal-outline', color: '#64748B' }, // Slate Grey
];

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { name: 'EMI / Loans', icon: 'card-outline', color: '#DC2626' }, // Crimson
  { name: 'Rent', icon: 'home-outline', color: '#4F46E5' }, // Indigo
  { name: 'Food & Dining', icon: 'fast-food-outline', color: '#EA580C' }, // Orange
  { name: 'Transportation', icon: 'car-outline', color: '#0891B2' }, // Cyan
  { name: 'Utilities', icon: 'flash-outline', color: '#EAB308' }, // Yellow
  { name: 'Personal Care', icon: 'sparkles-outline', color: '#DB2777' }, // Pink
  { name: 'Shopping', icon: 'bag-handle-outline', color: '#EC4899' }, // Magenta
  { name: 'Entertainment', icon: 'game-controller-outline', color: '#C026D3' }, // Purple
  { name: 'Healthcare', icon: 'heart-outline', color: '#16A34A' }, // Green
  { name: 'Education', icon: 'book-outline', color: '#0D9488' }, // Teal
  { name: 'Investments', icon: 'trending-up-outline', color: '#059669' }, // Emerald
  { name: 'Emergency Fund', icon: 'shield-checkmark-outline', color: '#E11D48' }, // Rose
  { name: 'Savings', icon: 'safe-outline', color: '#0EA5E9' }, // Sky Blue
  { name: 'Miscellaneous', icon: 'options-outline', color: '#475569' }, // Slate
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const getCategoryColor = (name: string): string => {
  const cat = ALL_CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase());
  return cat ? cat.color : '#475569';
};

export const getCategoryIcon = (name: string): string => {
  const cat = ALL_CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase());
  return cat ? cat.icon : 'help-outline';
};
