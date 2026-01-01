import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types/transaction';
import { generateSampleTransactions } from '@/data/sampleData';

const STORAGE_KEY = 'smartspend_transactions';
const DATA_CLEARED_KEY = 'smartspend_data_cleared';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load transactions from localStorage or use sample data
  useEffect(() => {
    const wasDataCleared = localStorage.getItem(DATA_CLEARED_KEY) === 'true';
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed);
        } else if (!wasDataCleared) {
          const sampleData = generateSampleTransactions();
          setTransactions(sampleData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
        } else {
          setTransactions([]);
        }
      } catch (e) {
        console.error('Failed to parse transactions:', e);
        if (!wasDataCleared) {
          const sampleData = generateSampleTransactions();
          setTransactions(sampleData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
        } else {
          setTransactions([]);
        }
      }
    } else {
      // First load: populate sample data for better UX unless user explicitly cleared
      if (!wasDataCleared) {
        const sampleData = generateSampleTransactions();
        setTransactions(sampleData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      } else {
        setTransactions([]);
      }
    }
    setIsLoading(false);
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoading]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(DATA_CLEARED_KEY, 'false');
      } catch (e) {
        console.warn('Failed to persist transactions', e);
      }
      return updated;
    });
    return newTransaction;
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist transactions', e);
      }
      return updated;
    });
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => {
      const updatedArr = prev.map(t => (t.id === id ? { ...t, ...updates } : t));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedArr));
      } catch (e) {
        console.warn('Failed to persist transactions', e);
      }
      return updatedArr;
    });
  }, []);

  const getTransactionsByMonth = useCallback((year: number, month: number) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [transactions]);

  const getTotalIncome = useCallback((year?: number, month?: number) => {
    const filtered = year !== undefined && month !== undefined
      ? getTransactionsByMonth(year, month)
      : transactions;
    return filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, getTransactionsByMonth]);

  const getTotalExpenses = useCallback((year?: number, month?: number) => {
    const filtered = year !== undefined && month !== undefined
      ? getTransactionsByMonth(year, month)
      : transactions;
    return filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, getTransactionsByMonth]);

  const getExpensesByCategory = useCallback((year?: number, month?: number) => {
    const filtered = year !== undefined && month !== undefined
      ? getTransactionsByMonth(year, month)
      : transactions;
    
    const expenses = filtered.filter(t => t.type === 'expense');
    const byCategory: Record<string, number> = {};
    
    expenses.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    
    return byCategory;
  }, [transactions, getTransactionsByMonth]);

  const getDailySpending = useCallback((year: number, month: number) => {
    const filtered = getTransactionsByMonth(year, month).filter(t => t.type === 'expense');
    const dailySpending: Record<number, number> = {};
    
    filtered.forEach(t => {
      const day = new Date(t.date).getDate();
      dailySpending[day] = (dailySpending[day] || 0) + t.amount;
    });
    
    return dailySpending;
  }, [getTransactionsByMonth]);

  return {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getTransactionsByMonth,
    getTotalIncome,
    getTotalExpenses,
    getExpensesByCategory,
    getDailySpending,
  };
}
