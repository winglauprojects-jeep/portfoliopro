import React, { useEffect, useState } from "react";
import {
  IAccountSummary,
  IStockSummary,
  IAccountHoldingForAStock,
  IStockPositionForAccount,
  getAccountDetails,
  getStockDetails,
} from "../services";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { generateColors } from "@/lib/utils";

type PropsPortfolioDetailChart = {
  viewMode: "account" | "stock";
  activeStock: IStockSummary | null;
  activeAccount: IAccountSummary | null;
};

export default function PortfolioDetailChart({
  viewMode,
  activeStock,
  activeAccount,
}: PropsPortfolioDetailChart) {
  // ... (State definitions remain the same) ...
  const [stockPositionDetails, setStockPositionDetails] = useState<
    IStockPositionForAccount[]
  >([]);
  const [accountPositionDetails, setAccountPositionDetails] = useState<
    IAccountHoldingForAStock[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchDetailsAccount() {
      setIsLoading(true); // 1. Start Loading
      try {
        const data = await getAccountDetails(activeAccount!.id);
        setStockPositionDetails(data);
      } catch (error) {
        console.error("Failed to fetch account details", error);
      } finally {
        setIsLoading(false); // 2. Stop Loading (even if error)
      }
    }

    async function fetchDetailsStock() {
      setIsLoading(true);
      try {
        const data = await getStockDetails(activeStock!.ticker);
        setAccountPositionDetails(data);
      } catch (error) {
        console.error("Failed to fetch stock details", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (viewMode === "account" && activeAccount) {
      fetchDetailsAccount();
    } else if (viewMode === "stock" && activeStock) {
      fetchDetailsStock();
    }
  }, [viewMode, activeAccount, activeStock]);

  const chartData =
    viewMode === "account" ? stockPositionDetails : accountPositionDetails;
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const chartColors = generateColors(
    chartData.length,
    viewMode === "account" ? 150 : 215
  );

  const valueFormatter = (
    value: number | undefined,
    name: string | undefined
  ) => {
    if (value === undefined) return ["$0", ""];
    const percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
    return [`$${value.toLocaleString()} (${percent.toFixed(1)}%)`, name || ""];
  };

  return (
    // Added 'relative' so the absolute spinner positions correctly inside this div
    <div className="h-full min-h-[300px] relative">
      {/* --- ADDED: LOADING SPINNER --- */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData as any[]}
            dataKey="value"
            nameKey={viewMode === "account" ? "ticker" : "accountName"}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={valueFormatter} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
