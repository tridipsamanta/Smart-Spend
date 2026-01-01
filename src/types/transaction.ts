export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank';

export type Category = 
  | 'food'
  | 'transport'
  | 'rent'
  | 'shopping'
  | 'education'
  | 'entertainment'
  | 'health'
  | 'bills'
  | 'investment'
  | 'salary'
  | 'freelance'
  | 'others';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface BudgetGoal {
  category: Category;
  limit: number;
  spent: number;
}

export const EXPENSE_CATEGORIES: Category[] = [
  'food',
  'transport',
  'rent',
  'shopping',
  'education',
  'entertainment',
  'health',
  'bills',
  'investment',
  'others',
];

export const INCOME_CATEGORIES: Category[] = [
  'salary',
  'freelance',
  'investment',
  'others',
];

export const CATEGORY_ICONS: Record<Category, string> = {
  food: '🍔',
  transport: '🚗',
  rent: '🏠',
  shopping: '🛍️',
  education: '📚',
  entertainment: '🎬',
  health: '💊',
  bills: '📄',
  investment: '📈',
  salary: '💰',
  freelance: '💻',
  others: '📦',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  food: 'Food & Dining',
  transport: 'Transport',
  rent: 'Rent & Housing',
  shopping: 'Shopping',
  education: 'Education',
  entertainment: 'Entertainment',
  health: 'Health',
  bills: 'Bills & Utilities',
  investment: 'Investment',
  salary: 'Salary',
  freelance: 'Freelance',
  others: 'Others',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  bank: 'Bank Transfer',
};
