"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  IAccountSummary,
  IStockPosition,
  getAccountDetails,
  IStockSummary,
  getStockDetails,
} from "../services";

// Master Chart Colors (Blueish)
const COLORS_MASTER = ["#1e3a8a", "#3b82f6", "#60a5fa", "#9ca3af"];
// Detail Chart Colors (Greenish to differentiate)
const COLORS_DETAIL = ["#059669", "#10b981", "#34d399", "#6ee7b7"];

interface Props {
  accountData: IAccountSummary[];
  stockData: IStockSummary[];
}

export function PortfolioDistribution({ accountData, stockData }: Props) {
  // state to keep track of ViewMode
  const [viewMode, setViewMode] = useState<"account" | "stock">("account");

  // State to track the interaction
  const [activeAccount, setActiveAccount] = useState<IAccountSummary | null>(
    accountData[0] || null
  );
  const [activeStock, setActiveStock] = useState<IStockSummary | null>(
    stockData[0] || null
  );
  const [detailData, setDetailData] = useState<IStockPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const data = viewMode === "account" ? accountData : stockData;
  //   const valueFormatter = (value: number | undefined) => {
  //     {
  const valueFormatter = (
    value: number | undefined,
    name: string,
    props: any
  ) => {
    console.log("Hidden data:", props);
    // Safety check: if value is missing, return a placeholder
    if (value === undefined) return ["$0", "Account"];
    return [`$${value.toLocaleString()}`, `${props.name}`];
  };
  // The "Fetch-on-Hover" Logic
  useEffect(() => {
    if (!activeAccount && viewMode == "account") return;
    if (!activeStock && viewMode == "stock") return;

    const fetchAccountDetails = async () => {
      setIsLoading(true);
      try {
        // Here is where we will swap for React Query later
        const stocks = await getAccountDetails(activeAccount!.id);
        setDetailData(stocks);
      } catch (error) {
        console.error("Failed to fetch details", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (viewMode === "account") fetchAccountDetails();

    const fetchStockDetails = async () => {
      setIsLoading(true);
      try {
        // Here is where we will swap for React Query later
        const stocks = await getStockDetails(activeStock!.ticker);
        setDetailData(stocks);
      } catch (error) {
        console.error("Failed to fetch details", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (viewMode === "stock") fetchStockDetails();
  }, [activeAccount, activeStock]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex items-center justify-start mb-4">
        {/* <h3 className="text-lg font-bold text-slate-800">
          Allocation by {viewMode === "account" ? "Account" : "Ticker"}
        </h3> */}

        <div className="flex bg-slate-100 p-1 rounded-lg">
          {/* Account Button */}
          <button
            onClick={() => setViewMode("account")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              viewMode === "account"
                ? "bg-white text-slate-800 shadow-sm" // Active View
                : "text-slate-500 hover:text-slate-700" // Inactive View
            }`}
          >
            Account
          </button>

          {/* Ticker Button */}
          <button
            onClick={() => setViewMode("stock")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              viewMode === "stock"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Ticker
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
        {/* --- LEFT SIDE: MASTER (Accounts) --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Allocation by {viewMode === "account" ? "Account" : "Ticker"}
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as any[]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="totalValue"
                  nameKey={viewMode === "account" ? "name" : "ticker"}
                  onMouseEnter={(_, index) => {
                    if (viewMode === "account") {
                      const account = data[index] as IAccountSummary;
                      if (account) setActiveAccount(account);
                    } else {
                      const stock = data[index] as StockSummary;
                      if (stock) setActiveStock(stock);
                    }
                  }}
                  cursor="pointer"
                >
                  {data.map((entry, index) => {
                    const isSelected =
                      viewMode === "account"
                        ? (entry as IAccountSummary).id === activeAccount?.id
                        : (entry as IStockSummary).ticker ===
                          activeStock?.ticker;

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS_MASTER[index % COLORS_MASTER.length]}
                        stroke={isSelected ? "#000" : "none"}
                        strokeWidth={2}
                      />
                    );
                  })}
                </Pie>
                <Tooltip formatter={valueFormatter} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  onMouseEnter={(e) => {
                    // Find the account that matches the legend item hovered
                    if (viewMode === "account") {
                      const account = data.find(
                        (d) => (d as IAccountSummary).name === e.value
                      );
                      setActiveAccount(account as IAccountSummary);
                    } else {
                      const stock = data.find(
                        (d) => (d as IStockSummary).ticker === e.value
                      );
                      setActiveStock(stock as IStockSummary);
                    }
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- RIGHT SIDE: DETAIL (Stocks) --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col relative">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {activeAccount && viewMode === "account"
              ? `${activeAccount.name} Holdings`
              : "Select an Account"}
            {activeStock && viewMode === "stock"
              ? `${activeStock.ticker} Details`
              : "Select a Ticker"}
          </h3>

          {/* Loading Spinner Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          <div className="flex-1 min-h-0">
            {detailData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={detailData as any[]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="ticker"
                  >
                    {detailData.map((entry, index) => (
                      <Cell
                        key={`cell-detail-${index}`}
                        fill={COLORS_DETAIL[index % COLORS_DETAIL.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={valueFormatter} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No holdings data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
