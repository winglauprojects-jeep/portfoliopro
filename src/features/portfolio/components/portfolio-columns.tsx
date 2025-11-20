"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StockHolding } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

// This is the "Delete" action handler. We'll pass the
// actual delete function from our component via the `meta` prop.
const handleDelete = (stockId: string, meta: any) => {
  if (meta?.deleteStock) {
    meta.deleteStock(stockId);
  }
};

export const columns: ColumnDef<StockHolding>[] = [
  {
    accessorKey: "accountName",
    header: "Account",
  },
  {
    accessorKey: "tickerSymbol",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ticker
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "shareCount",
    header: "Shares",
  },
  {
    accessorKey: "averagePurchasePrice",
    header: () => <div className="text-right">Avg. Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("averagePurchasePrice"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const stock = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleDelete(stock.id, table.options.meta)}
            >
              Delete Holding
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
