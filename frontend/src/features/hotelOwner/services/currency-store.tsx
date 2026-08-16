/**
 * currency-store.ts
 *
 * Provides a React Context for the Hotel Owner's currency display preference.
 * - Fetches the live USD → LKR exchange rate from open.er-api.com (no API key needed).
 * - Persists the selected currency ("USD" | "LKR") in localStorage.
 * - Exposes `useCurrency()` hook for any component to read/update the preference.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type Currency = "USD" | "LKR";

interface CurrencyContextValue {
  /** Currently selected display currency */
  currency: Currency;
  /** Update the display currency preference */
  setCurrency: (c: Currency) => void;
  /** Live USD → LKR exchange rate (e.g. 320.5). Null while loading or on error. */
  exchangeRate: number | null;
  /** True while the live rate is being fetched */
  rateLoading: boolean;
  /** True if the live rate fetch failed */
  rateError: boolean;
  /**
   * Converts a USD price and returns a formatted string.
   * e.g. formatPrice(150) → "$150.00" (USD) or "LKR 48,075" (LKR)
   */
  formatPrice: (usdPrice: number) => string;
}

const STORAGE_KEY = "ownerCurrencyPref";
const RATE_API_URL = "https://open.er-api.com/v6/latest/USD";

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "LKR" ? "LKR" : "USD";
  });
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(false);

  // Fetch live exchange rate on mount
  useEffect(() => {
    let cancelled = false;
    const fetchRate = async () => {
      setRateLoading(true);
      setRateError(false);
      try {
        const res = await fetch(RATE_API_URL);
        if (!res.ok) throw new Error(`Rate API error: ${res.status}`);
        const data = await res.json();
        const lkrRate = data?.rates?.LKR as number | undefined;
        if (typeof lkrRate === "number" && !cancelled) {
          setExchangeRate(lkrRate);
        } else if (!cancelled) {
          setRateError(true);
        }
      } catch (err) {
        console.error("[CurrencyStore] Failed to fetch exchange rate:", err);
        if (!cancelled) setRateError(true);
      } finally {
        if (!cancelled) setRateLoading(false);
      }
    };
    fetchRate();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }, []);

  const formatPrice = useCallback(
    (usdPrice: number): string => {
      if (currency === "LKR") {
        if (exchangeRate === null) {
          // Rate not yet loaded — show USD as fallback
          return `$${usdPrice.toFixed(2)}`;
        }
        const lkrValue = usdPrice * exchangeRate;
        return `LKR ${lkrValue.toLocaleString("en-LK", {
          maximumFractionDigits: 0,
        })}`;
      }
      // Default: USD
      return `$${usdPrice.toFixed(2)}`;
    },
    [currency, exchangeRate]
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, exchangeRate, rateLoading, rateError, formatPrice }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to access the currency context anywhere inside <CurrencyProvider>.
 */
export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a <CurrencyProvider>");
  }
  return ctx;
}
