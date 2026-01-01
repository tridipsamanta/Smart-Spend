import { useState, useEffect, useCallback } from 'react';

export type Currency = '₹' | '$' | '€' | '£';

const STORAGE_KEY = 'smartspend_currency';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>('$');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['₹', '$', '€', '£'].includes(stored)) {
      setCurrencyState(stored as Currency);
    }
  }, []);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  }, []);

  const formatAmount = useCallback((amount: number) => {
    return `${currency}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }, [currency]);

  return {
    currency,
    setCurrency,
    formatAmount,
  };
}
