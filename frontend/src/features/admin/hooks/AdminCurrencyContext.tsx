import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import adminProfileApi from '../services/adminProfileApi';

export interface AdminCurrencyContextType {
  currency: 'USD' | 'LKR';
  currencySymbol: string;
  rate: number;
  loading: boolean;
  rateError: boolean;
  setCurrency: (newCurrency: 'USD' | 'LKR') => Promise<void>;
  formatPrice: (
    usdAmount: number | string | null | undefined,
    options?: { showCents?: boolean; compact?: boolean; fallback?: string }
  ) => string;
  convertPrice: (usdAmount: number | string | null | undefined) => number;
  refreshCurrency: () => Promise<void>;
}

const AdminCurrencyContext = createContext<AdminCurrencyContextType | null>(null);

const getInitialCurrency = (): 'USD' | 'LKR' => {
  try {
    const stored = localStorage.getItem('travelhub_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.currencyPreference === 'LKR' || user?.currencyPreference === 'USD') {
        return user.currencyPreference;
      }
    }
  } catch {
    // ignore
  }
  return 'USD';
};

export const AdminCurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<'USD' | 'LKR'>(getInitialCurrency);
  const [rate, setRate] = useState<number>(300); // 1 USD = 300 LKR default fallback
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
    } catch (e) {
      console.warn('Failed to fetch live exchange rate, using fallback rate 300:', e);
    }
    setRateError(true);
  }, []);

  const refreshCurrency = useCallback(async () => {
    try {
      // First try localStorage
      const localPref = getInitialCurrency();
      setCurrencyState(localPref);

      // Then sync from backend profile
      const profile = await adminProfileApi.getProfile();
      if (profile?.currencyPreference === 'LKR' || profile?.currencyPreference === 'USD') {
        setCurrencyState(profile.currencyPreference);
        // Sync back to local storage if different
        try {
          const stored = localStorage.getItem('travelhub_user');
          if (stored) {
            const user = JSON.parse(stored);
            if (user.currencyPreference !== profile.currencyPreference) {
              user.currencyPreference = profile.currencyPreference;
              localStorage.setItem('travelhub_user', JSON.stringify(user));
            }
          }
        } catch {}
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.allSettled([refreshCurrency(), fetchExchangeRate()]);
      setLoading(false);
    };
    init();

    const handleProfileUpdate = () => {
      const storedPref = getInitialCurrency();
      setCurrencyState(storedPref);
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, [refreshCurrency, fetchExchangeRate]);

  const setCurrency = useCallback(async (newCurrency: 'USD' | 'LKR') => {
    setCurrencyState(newCurrency);

    // 1. Update localStorage
    try {
      const stored = localStorage.getItem('travelhub_user');
      if (stored) {
        const user = JSON.parse(stored);
        user.currencyPreference = newCurrency;
        localStorage.setItem('travelhub_user', JSON.stringify(user));
      }
    } catch {}

    // 2. Dispatch profile updated event
    window.dispatchEvent(new Event('user-profile-updated'));

    // 3. Save to backend profile
    try {
      await adminProfileApi.updateProfile({ currencyPreference: newCurrency });
    } catch (err) {
      console.error('Failed to persist currency preference to backend:', err);
    }
  }, []);

  const convertPrice = useCallback(
    (usdAmount: number | string | null | undefined): number => {
      if (usdAmount == null || usdAmount === '') return 0;
      const num = typeof usdAmount === 'number' ? usdAmount : parseFloat(String(usdAmount).replace(/[^0-9.-]+/g, ''));
      if (isNaN(num)) return 0;
      return currency === 'LKR' ? num * rate : num;
    },
    [currency, rate]
  );

  const formatPrice = useCallback(
    (
      usdAmount: number | string | null | undefined,
      options?: { showCents?: boolean; compact?: boolean; fallback?: string }
    ): string => {
      const fallback = options?.fallback ?? (currency === 'LKR' ? 'Rs. —' : '$—');
      if (usdAmount == null || usdAmount === '') return fallback;

      const num = typeof usdAmount === 'number' ? usdAmount : parseFloat(String(usdAmount).replace(/[^0-9.-]+/g, ''));
      if (isNaN(num)) return fallback;

      const converted = currency === 'LKR' ? num * rate : num;
      const symbol = currency === 'LKR' ? 'Rs. ' : '$';

      // Compact format (e.g. $1.2K / Rs. 360K / $1.5M)
      if (options?.compact) {
        if (Math.abs(converted) >= 1_000_000) {
          return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
        }
        if (Math.abs(converted) >= 1_000) {
          return `${symbol}${(converted / 1_000).toFixed(1)}K`;
        }
        return `${symbol}${converted.toFixed(0)}`;
      }

      // Standard formatting
      const decimals =
        options?.showCents !== undefined
          ? options.showCents
            ? 2
            : 0
          : currency === 'USD'
          ? 2
          : 0;

      return `${symbol}${converted.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    },
    [currency, rate]
  );

  const currencySymbol = currency === 'LKR' ? 'Rs.' : '$';

  return (
    <AdminCurrencyContext.Provider
      value={{
        currency,
        currencySymbol,
        rate,
        loading,
        rateError,
        setCurrency,
        formatPrice,
        convertPrice,
        refreshCurrency,
      }}
    >
      {children}
    </AdminCurrencyContext.Provider>
  );
};

export const useAdminCurrency = (): AdminCurrencyContextType => {
  const context = useContext(AdminCurrencyContext);
  if (!context) {
    throw new Error('useAdminCurrency must be used within an AdminCurrencyProvider');
  }
  return context;
};
