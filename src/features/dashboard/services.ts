export interface IMarketStatus {
  totalNetWorth: number;
  dailyChange: number;
  dailyChangePercent: number;
  cashBalance: number;
  investedAmount: number;
  topGainer: { ticker: string; change: number } | null;
  topLoser: { ticker: string; change: number } | null;
}
export interface IStockPositionForAccount {
  ticker: string;
  shares: number;
  price: number;
  value: number; // shares * price
  allocation: number; // percentage of this account (0-100)
}

// 2. The Summary Item (The high-level account view)
export interface IAccountSummary {
  id: string; // Unique ID for looking up details
  name: string;
  totalValue: number;
  isCash: boolean; // Helper to identify the "Cash" slice
}

export interface IStockSummary {
  ticker: string; // acts as ID
  totalValue: number;
  allocation: number; // % of total portfolio
}

export interface IAccountHoldingForAStock {
  accountName: string;
  value: number;
  shares: number;
  allocation: number; // % of this stock's total that sits in this account
}

export const getDashboardMetrics = async (): Promise<IMarketStatus> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    totalNetWorth: 124500.0,
    dailyChange: 1250.5,
    dailyChangePercent: 1.02,
    cashBalance: 14500.0,
    investedAmount: 110000.0,
    topGainer: { ticker: "NVDA", change: 4.5 },
    topLoser: { ticker: "TSLA", change: -1.2 },
  };
};

// ... (Keep your previous MarketStatus interface here too) ...

export const getAccountSummaries = async (): Promise<IAccountSummary[]> => {
  // Fast load - minimal delay
  return [
    { id: "acc_1", name: "Fidelity IRA", totalValue: 45000, isCash: false },
    { id: "acc_2", name: "Brokerage", totalValue: 30000, isCash: false },
    {
      id: "acc_3",
      name: "Fidelity Individual",
      totalValue: 15000,
      isCash: false,
    },
  ];
};

export const getAccountDetails = async (
  accountId: string
): Promise<IStockPositionForAccount[]> => {
  // Simulate a network delay (500ms) to test our "Loading..." UI
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock response based on the ID requested
  if (accountId === "acc_1") {
    // Fidelity IRA
    return [
      {
        ticker: "NVDA",
        shares: 50,
        price: 500,
        value: 25000,
        allocation: 55.5,
      },
      {
        ticker: "AMD",
        shares: 100,
        price: 150,
        value: 15000,
        allocation: 33.3,
      },
      { ticker: "INTC", shares: 100, price: 50, value: 5000, allocation: 11.2 },
    ];
  }

  if (accountId === "acc_2") {
    // Brokerage
    return [
      {
        ticker: "TSLA",
        shares: 100,
        price: 200,
        value: 20000,
        allocation: 66.6,
      },
      {
        ticker: "AAPL",
        shares: 50,
        price: 200,
        value: 10000,
        allocation: 33.4,
      },
    ];
  }
  if (accountId === "acc_3") {
    // Fidelity Individual (Total: $15,000)
    return [
      {
        ticker: "MSFT",
        shares: 20,
        price: 300,
        value: 6000,
        allocation: 40.0,
      },
      {
        ticker: "AMZN",
        shares: 30,
        price: 150,
        value: 4500,
        allocation: 30.0,
      },
      {
        ticker: "GOOGL",
        shares: 30,
        price: 150,
        value: 4500,
        allocation: 30.0,
      },
    ];
  }

  // Default fallback
  return [];
};

export const getStockSummaries = async (): Promise<IStockSummary[]> => {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In a real app, the backend would do this aggregation.
  // For our mock, we return the pre-calculated totals:
  return [
    { ticker: "NVDA", totalValue: 45000, allocation: 36.1 }, // Sum of all NVDA
    { ticker: "AMD", totalValue: 15000, allocation: 12.0 },
    { ticker: "TSLA", totalValue: 20000, allocation: 16.0 },
    { ticker: "AAPL", totalValue: 10000, allocation: 8.0 },
    { ticker: "INTC", totalValue: 5000, allocation: 4.0 },
    { ticker: "Cash", totalValue: 14500, allocation: 11.6 },
    // ... others
  ];
};

// 3. The Details Function (What accounts hold this stock?)

// 3. The Details Function (Which accounts hold this stock?)
export const getStockDetails = async (
  ticker: string
): Promise<IAccountHoldingForAStock[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (ticker === "NVDA") {
    return [
      {
        accountName: "Fidelity IRA",
        value: 25000,
        shares: 50,
        allocation: 55.5,
      },
      {
        accountName: "Brokerage",
        value: 12000,
        shares: 24,
        allocation: 26.7,
      },
      {
        accountName: "Fidelity Individual",
        value: 8000,
        shares: 16,
        allocation: 17.8,
      },
    ];
  }

  // ... keep your other cases or default return similar ...
  return [];
};
