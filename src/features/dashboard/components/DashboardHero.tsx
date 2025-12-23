import React from "react";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from "lucide-react";

import { IMarketStatus } from "../services";
interface DashboardHeroProps {
  data: IMarketStatus;
}

export function DashboardHero({ data }: DashboardHeroProps) {
  const isPositive = data.dailyChange >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Card 1: Total Net Worth */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-slate-500">
            Total Net Worth
          </h3>
          <DollarSign className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900">
          ${data.totalNetWorth.toLocaleString()}
        </div>
        <p
          className={`text-xs flex items-center mt-1 ${
            isPositive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 mr-1" />
          )}
          {isPositive ? "+" : ""}
          {data.dailyChangePercent}% (${data.dailyChange})
          <span className="text-slate-400 ml-1">vs yesterday</span>
        </p>
      </div>

      {/* Card 2: Cash vs Invested */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-medium text-slate-500">Cash Available</h3>
          <Wallet className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900">
          ${data.cashBalance.toLocaleString()}
        </div>
        <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600"
            style={{
              width: `${(data.cashBalance / data.totalNetWorth) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {((data.cashBalance / data.totalNetWorth) * 100).toFixed(1)}% of
          portfolio in cash
        </p>
      </div>

      {/* Card 3: Top Movers (Feature Suggestion) */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-medium text-slate-500 mb-4">
          Today's Movers
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">
              🚀 {data.topGainer?.ticker}
            </span>
            <span className="text-sm font-medium text-emerald-600">
              +{data.topGainer?.change}%
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-50 pt-2">
            <span className="text-sm font-medium text-slate-700">
              📉 {data.topLoser?.ticker}
            </span>
            <span className="text-sm font-medium text-red-600">
              {data.topLoser?.change}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
