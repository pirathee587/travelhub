/**
 * TouristCurrencyContext
 *
 * Provides currency preference (USD / LKR) and live exchange-rate conversion
 * for the Tourist-facing frontend.
 *
 * Reuses the same exchange-rate API as the Agent module:
 *   https://open.er-api.com/v6/latest/USD
 *
 * Currency preference is persisted per-user via:
 *   GET  /api/tourist/profile?userId={id}  → reads currencyPreference
 *   PUT  /api/tourist/profile?userId={id}  → saves currencyPreference
 *
 * Default: USD (for guests and users with no saved preference)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface TouristCurrencyContextType {
  currency: 'USD' | 'LKR';
  rate: number;
  loading: boolean;
  rateError: boolean;
  setCurrency: (currency: 'USD' | 'LKR') => Promise<void>;
  formatPrice: (amount: number | null | undefined) => string;
  convertPrice: (usdAmount: number | null | undefined) => number;
}

const TouristCurrencyContext = createContext<TouristCurrencyContextType | null>(null);

const getCurrentUserId = (): number | null => {
  try {
    const stored = localStorage.getItem('travelhub_user');
    if (stored) {
      const user = JSON.parse(stored);
      return user?.id ?? null;
    }
  } catch {
    // ignore
  }
  return null;
};

export const TouristCurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<'USD' | 'LKR'>('USD');
  const [rate, setRate] = useState<number>(300);
  const [loading, setLoading] = useState(true);
  const [rateError, setRateError] = useState(false);

  const fetchExchangeRate = useCallback(async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data?.rates?.LKR) {
          setRate(data.rates.LKR);
          setRateError(false);
          return;
        }
      }
    } catch {
      // fall through
    }
    setRateError(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const userId = getCurrentUserId();
        if (userId) {
          const res = await fetch(`${BASE_URL}/tourist/profile?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.currencyPreference === 'LKR' || data?.currencyPreference === 'USD') {
              setCurrencyState(data.currencyPreference);
            }
          }
        }
      } catch {
        // default to USD
      }
      await fetchExchangeRate();
      setLoading(false);
    };
    init();
  }, [fetchExchangeRate]);

  const setCurrency = useCallback(async (newCurrency: 'USD' | 'LKR') => {
    setCurrencyState(newCurrency);
    try {
      const userId = getCurrentUserId();
      if (userId) {
        await fetch(`${BASE_URL}/tourist/profile?userId=${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currencyPreference: newCurrency }),
        });
      }
    } catch {
      // silent fail — in-memory state still updated for this session
    }
  }, []);

  const convertPrice = useCallback((usdAmount: number | null | undefined): number => {
    const amount = Number(usdAmount) || 0;
    return currency === 'LKR' ? amount * rate : amount;
  }, [currency, rate]);

  const formatPrice = useCallback((usdAmount: number | null | undefined): string => {
    const amount = Number(usdAmount);
    if (isNaN(amount) || usdAmount === null || usdAmount === undefined) {
      return currency === 'LKR' ? 'Rs. —' : '$—';
    }
    if (currency === 'LKR') {
      const converted = amount * rate;
      return `Rs. ${converted.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [currency, rate]);

  return (
    <TouristCurrencyContext.Provider
      value={{ currency, rate, loading, rateError, setCurrency, formatPrice, convertPrice }}
    >
      {children}
    </TouristCurrencyContext.Provider>
  );
};

export const useTouristCurrency = (): TouristCurrencyContextType => {
  const ctx = useContext(TouristCurrencyContext);
  if (!ctx) {
    throw new Error('useTouristCurrency must be used within TouristCurrencyProvider');
  }
  return ctx;
};
