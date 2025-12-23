import RequireAuth from "@/components/require-auth";
import AddStockForm from "@/features/portfolio/components/add-stock-form";
import { PortfolioTable } from "@/features/portfolio/components/portfolio-table";
// 👇 Update imports
import {
  getDashboardMetrics,
  getAccountSummaries,
  getStockDetails,
  getStockSummaries,
} from "@/features/dashboard/services";
import { DashboardHero } from "@/features/dashboard/components/DashboardHero";
import { PortfolioDistribution } from "@/features/dashboard/components/PortfolioDistribution";

export default async function DashboardPage() {
  // Fetch both sets of data in parallel
  const [metrics, accountSummaries, stockSummaries] = await Promise.all([
    getDashboardMetrics(),
    getAccountSummaries(),
    getStockSummaries(),
  ]);

  return (
    <RequireAuth>
      <main className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            Welcome back to ActivePath Investing.
          </p>
        </div>

        {/* Hero Stats */}
        <section>
          <DashboardHero data={metrics} />
        </section>

        {/* Charts Section - Now passing the real summary data */}
        <section>
          <PortfolioDistribution
            accountData={accountSummaries}
            stockData={stockSummaries}
          />
        </section>

        {/* Management Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Manage Holdings
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AddStockForm />
            </div>
            <div className="lg:col-span-2">
              <PortfolioTable />
            </div>
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}
