import { Transaction } from '@/types/transaction';

// Generate sample transactions for demo purposes
export function generateSampleTransactions(): Transaction[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const transactions: Transaction[] = [
    // Income
    {
      id: '1',
      type: 'income',
      amount: 4500,
      category: 'salary',
      date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
      notes: 'Monthly salary',
      paymentMethod: 'bank',
      createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    },
    {
      id: '2',
      type: 'income',
      amount: 850,
      category: 'freelance',
      date: new Date(currentYear, currentMonth, 5).toISOString().split('T')[0],
      notes: 'Web design project',
      paymentMethod: 'bank',
      createdAt: new Date(currentYear, currentMonth, 5).toISOString(),
    },
    // Expenses
    {
      id: '3',
      type: 'expense',
      amount: 1200,
      category: 'rent',
      date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
      notes: 'Monthly rent',
      paymentMethod: 'bank',
      createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    },
    {
      id: '4',
      type: 'expense',
      amount: 85,
      category: 'food',
      date: new Date(currentYear, currentMonth, 3).toISOString().split('T')[0],
      notes: 'Groceries',
      paymentMethod: 'card',
      createdAt: new Date(currentYear, currentMonth, 3).toISOString(),
    },
    {
      id: '5',
      type: 'expense',
      amount: 45,
      category: 'transport',
      date: new Date(currentYear, currentMonth, 4).toISOString().split('T')[0],
      notes: 'Gas',
      paymentMethod: 'card',
      createdAt: new Date(currentYear, currentMonth, 4).toISOString(),
    },
    {
      id: '6',
      type: 'expense',
      amount: 120,
      category: 'shopping',
      date: new Date(currentYear, currentMonth, 6).toISOString().split('T')[0],
      notes: 'New clothes',
      paymentMethod: 'card',
      createdAt: new Date(currentYear, currentMonth, 6).toISOString(),
    },
    {
      id: '7',
      type: 'expense',
      amount: 15,
      category: 'entertainment',
      date: new Date(currentYear, currentMonth, 7).toISOString().split('T')[0],
      notes: 'Netflix subscription',
      paymentMethod: 'card',
      createdAt: new Date(currentYear, currentMonth, 7).toISOString(),
    },
    {
      id: '8',
      type: 'expense',
      amount: 65,
      category: 'food',
      date: new Date(currentYear, currentMonth, 8).toISOString().split('T')[0],
      notes: 'Restaurant dinner',
      paymentMethod: 'card',
      createdAt: new Date(currentYear, currentMonth, 8).toISOString(),
    },
    {
      id: '9',
      type: 'expense',
      amount: 180,
      category: 'bills',
      date: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0],
      notes: 'Electric & internet',
      paymentMethod: 'bank',
      createdAt: new Date(currentYear, currentMonth, 10).toISOString(),
    },
    {
      id: '10',
      type: 'expense',
      amount: 35,
      category: 'health',
      date: new Date(currentYear, currentMonth, 12).toISOString().split('T')[0],
      notes: 'Pharmacy',
      paymentMethod: 'cash',
      createdAt: new Date(currentYear, currentMonth, 12).toISOString(),
    },
    {
      id: '11',
      type: 'expense',
      amount: 250,
      category: 'investment',
      date: new Date(currentYear, currentMonth, 15).toISOString().split('T')[0],
      notes: 'Stock purchase',
      paymentMethod: 'bank',
      createdAt: new Date(currentYear, currentMonth, 15).toISOString(),
    },
    {
      id: '12',
      type: 'expense',
      amount: 55,
      category: 'food',
      date: new Date(currentYear, currentMonth, 18).toISOString().split('T')[0],
      notes: 'Groceries',
      paymentMethod: 'card',
      createdAt: new Date(currentYear, currentMonth, 18).toISOString(),
    },
    {
      id: '13',
      type: 'expense',
      amount: 30,
      category: 'transport',
      date: new Date(currentYear, currentMonth, 20).toISOString().split('T')[0],
      notes: 'Uber rides',
      paymentMethod: 'upi',
      createdAt: new Date(currentYear, currentMonth, 20).toISOString(),
    },
  ];

  // Sort by date descending (most recent first)
  return transactions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
