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
  IStockSummary,
  IStockPositionForAccount, // These imports might be unused now, can clean up
  IAccountHoldingForAStock, // These imports might be unused now, can clean up
} from "../services";
import { generateColors } from "@/lib/utils";
import PortfolioDetailChart from "./PortfolioDetailChart";

// Master Chart Colors (Blueish)
const COLORS_MASTER = ["#1e3a8a", "#3b82f6", "#60a5fa", "#9ca3af"];

interface Props {
  accountData: IAccountSummary[];
  stockData: IStockSummary[];
}

export function PortfolioDistribution({ accountData, stockData }: Props) {
  const [viewMode, setViewMode] = useState<"account" | "stock">("account");

  const [activeAccount, setActiveAccount] = useState<IAccountSummary | null>(
    accountData[0] || null
  );
  const [activeStock, setActiveStock] = useState<IStockSummary | null>(
    stockData[0] || null
  );

  // --- REMOVED: const [isLoading, setIsLoading]... (Not needed here!) ---

  const data = viewMode === "account" ? accountData : stockData;

  const currentColors = generateColors(
    data.length,
    viewMode === "account" ? 215 : 150
  );

  const totalValue = data.reduce((sum, item) => {
    const val = (item as any).value || (item as any).totalValue || 0;
    return sum + val;
  }, 0);

  const valueFormatter = (
    value: number | undefined,
    name: string | undefined
  ) => {
    if (value === undefined) return ["$0", ""];
    const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
    return [
      `$${value.toLocaleString()} (${percent.toFixed(1)}%)`,
      name || "Unknown",
    ];
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      {/* View Toggle Buttons */}
      <div className="flex items-center justify-start mb-4">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("account")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              viewMode === "account"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Account
          </button>
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
        {/* --- LEFT SIDE: MASTER --- */}
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
                      setActiveAccount(data[index] as IAccountSummary);
                    } else {
                      setActiveStock(data[index] as IStockSummary);
                    }
                  }}
                  cursor="pointer"
                  label={({ percent }) =>
                    `${((percent || 0) * 100).toFixed(0)}%`
                  }
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
                        fill={currentColors[index % COLORS_MASTER.length]}
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
                  // Added rudimentary hover logic for Legend
                  onMouseEnter={(e) => {
                    const item = data.find(
                      (d: any) =>
                        (viewMode === "account" ? d.name : d.ticker) === e.value
                    );
                    if (item) {
                      viewMode === "account"
                        ? setActiveAccount(item as IAccountSummary)
                        : setActiveStock(item as IStockSummary);
                    }
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- RIGHT SIDE: DETAIL --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col relative">
          {/* FIXED HEADER LOGIC: Cleaner ternary to prevent overlapping text */}
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {viewMode === "account"
              ? activeAccount
                ? `${activeAccount.name} Holdings`
                : "Select an Account"
              : activeStock
              ? `${activeStock.ticker} Details`
              : "Select a Ticker"}
          </h3>

          {/* --- REMOVED: Loading Spinner (Moved to child) --- */}

          <div className="flex-1 min-h-0">
            <PortfolioDetailChart
              viewMode={viewMode}
              activeAccount={activeAccount}
              activeStock={activeStock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
