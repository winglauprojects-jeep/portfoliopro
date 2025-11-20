"use client";

import { usePortfolio } from "@/providers/portfolio-provider";
import { columns } from "./portfolio-columns";
import { DataTable } from "./data-table";
import { toast } from "sonner";

export function PortfolioTable() {
  const { portfolio, loading, stockService } = usePortfolio();

  const handleDeleteStock = async (stockId: string) => {
    if (!window.confirm("Are you sure you want to delete this holding?")) {
      return;
    }

    try {
      await stockService.deleteStock(stockId);
      toast.success("Holding deleted");
    } catch (error) {
      toast.error("Failed to delete holding");
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading portfolio...</div>;
  }
  console.log(portfolio, "data in portfolio table");
  return (
    <DataTable
      columns={columns}
      data={portfolio}
      meta={{
        deleteStock: handleDeleteStock, // Pass the delete function
      }}
    />
  );
}
