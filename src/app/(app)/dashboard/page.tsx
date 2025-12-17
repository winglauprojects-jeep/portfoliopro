import AddStockForm from "@/features/portfolio/components/add-stock-form";
import RequireAuth from "@/components/require-auth";
// import { PortfolioTable } from "@/features/portfolio/components/portfolio-table"; // <-- 1. Import
import { PortfolioTable } from "@/features/portfolio/components/portfolio-table";
export default function DashboardPage() {
  return (
    <RequireAuth>
      <main className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">My Portfolio</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Add Form */}
          <div className="lg:col-span-1">
            <AddStockForm />
          </div>

          {/* Right Column: Data Table */}
          <div className="lg:col-span-2">
            <PortfolioTable /> {/* <-- 2. Replace placeholder */}
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
