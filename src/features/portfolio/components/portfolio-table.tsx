"use client";

import { usePortfolio } from "@/providers/portfolio-provider";
import { columns } from "./portfolio-columns";
import { DataTable } from "./data-table";
import { toast } from "sonner";

import { useState } from "react";
import { AddSourceDialog } from "@/features/sources/components/add-source-dialog";
import { SourceViewerDialog } from "@/features/sources/components/source-viewer-dialog";
import { StockHolding } from "@/types";
import { vi } from "zod/v4/locales";

export function PortfolioTable() {
  const { portfolio, loading, stockService } = usePortfolio();

  // State for the Add Source Dialog
  const [selectedStockForSource, setSelectedStockForSource] =
    useState<StockHolding | null>(null);

  const [viewingStock, setViewingStock] = useState<StockHolding | null>(null);

  const handleViewSources = (stock: StockHolding) => {
    setViewingStock(stock);
  };

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
  const handleAddSource = (stock: StockHolding) => {
    setSelectedStockForSource(stock);
  };

  if (loading) {
    return <div>Loading portfolio...</div>;
  }
  console.log(portfolio, "data in portfolio table");
  return (
    <>
      <DataTable
        columns={columns}
        data={portfolio}
        meta={{
          deleteStock: handleDeleteStock, // Pass the delete function
          addSource: handleAddSource,
          viewSources: handleViewSources,
        }}
      />
      {selectedStockForSource && (
        <AddSourceDialog
          stock={selectedStockForSource}
          open={!!selectedStockForSource}
          onOpenChange={(open) => !open && setSelectedStockForSource(null)}
        />
      )}

      {viewingStock && (
        <SourceViewerDialog
          stock={viewingStock}
          open={!!viewingStock}
          onOpenChange={(open) => !open && setViewingStock(null)}
        />
      )}
    </>
  );
}
