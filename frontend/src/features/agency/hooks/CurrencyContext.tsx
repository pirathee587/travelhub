import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/features/agency/services/api';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState('USD');
  const [rate] = useState(300); // 1 USD = 300 LKR
  const [loading, setLoading] = useState(true);

  const fetchCurrencyPreference = async () => {
    try {
      const settingsData = await api.getSettings();
      if (settingsData?.currency) {
        setCurrencyState(settingsData.currency);
      }
    } catch (error) {
      console.error('Failed to load currency setting:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencyPreference();
  }, []);

  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
  };

  const formatPrice = (amount) => {
    const numericAmount = Number(amount) || 0;
    if (currency === 'LKR') {
      const converted = numericAmount * rate;
      return `Rs. ${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `$${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, rate, loading, refreshCurrency: fetchCurrencyPreference }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
