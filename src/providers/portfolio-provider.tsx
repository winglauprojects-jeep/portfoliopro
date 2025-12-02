"use client";
/**
 * it depends on AuthProvider to get the current user's ID
 */
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import { IStockRepository, StockHolding } from "@/types";
import { FirebaseStockAdapter } from "@/lib/firebase/stock.adapter";
import { useAuth } from "./auth-provider"; // We need this to get the user's ID

// 1. Define the shape of the context data
interface PortfolioContextType {
  portfolio: StockHolding[];
  accounts: string[];
  loading: boolean;
  stockService: IStockRepository;
}

// 2. Create the context with a default value
const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

// 3. Create the Provider component
interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider = ({ children }: PortfolioProviderProps) => {
  // State to hold portfolio data and loading status
  const [portfolio, setPortfolio] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);

  //get current user from AuthProvider
  const { user } = useAuth();

  // Create the adapter instance *once*
  const [stockService] = useState(() => new FirebaseStockAdapter());

  useEffect(() => {
    if (!user) {
      // If no user, clear portfolio and stop loading
      setTimeout(() => {
        setPortfolio([]);
        setLoading(false);
        return;
      }, 0);
    } else {
      setLoading(true);

      // Subscribe to portfolio changes for the current user
      const unsubscribe = stockService.subscribeToPortfolioUpdates(
        user.uid,
        (newPortfolio) => {
          setPortfolio(newPortfolio);
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount or user change
      return () => unsubscribe();
    }
  }, [stockService, user]); // Effect depends on the stockService instance and user

  const accounts = useMemo(() => {
    const accountSet = new Set(portfolio.map((item) => item.accountName));
    return Array.from(accountSet).sort();
  }, [portfolio]);

  const value = {
    stockService,
    portfolio,
    accounts,
    loading,
  };
  return (
    <PortfolioContext.Provider value={value}>
      {!loading && children}
    </PortfolioContext.Provider>
  );
};
// 4. Create a custom hook for easy access
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
