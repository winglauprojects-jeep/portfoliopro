import React from "react"; // 👈 Required for the mocks below
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioTable } from "@/features/portfolio/components/portfolio-table";
import { AppProvider } from "@/providers/app";

// 1. Mock Toaster (Return null to avoid rendering issues)
jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

// 2. Mock Auth
jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ user: { uid: "test-user" } }),
  // 👇 Fix: Wrap children in a fragment
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// 3. Mock Sources
const mockGetSources = jest.fn();
const mockDeleteSource = jest.fn();

jest.mock("@/providers/sources-provider", () => ({
  useSources: () => ({
    sourceService: {
      getSourcesForStock: mockGetSources,
      deleteSource: mockDeleteSource,
    },
  }),
  // 👇 Fix: Wrap children in a fragment
  SourcesProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// 4. Mock Portfolio
jest.mock("@/providers/portfolio-provider", () => ({
  usePortfolio: () => ({
    portfolio: [
      {
        id: "stock-1",
        tickerSymbol: "AAPL",
        accountName: "Brokerage",
        shareCount: 10,
        averagePurchasePrice: 150,
      },
    ],
    stockService: {},
    loading: false,
    accounts: ["Brokerage"],
  }),
  // 👇 Fix: Wrap children in a fragment
  PortfolioProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("Source Viewer Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays sources when 'View Sources' is clicked", async () => {
    mockGetSources.mockResolvedValue([
      {
        id: "src-1",
        type: "note",
        content: "This is a research note",
        visibility: "private",
        status: "approved",
      },
    ]);

    render(
      <AppProvider>
        <PortfolioTable />
      </AppProvider>
    );

    const row = screen.getByRole("row", { name: /AAPL/i });
    const menuBtn = within(row).getByRole("button", { name: /open menu/i });
    await userEvent.click(menuBtn);

    const viewBtn = screen.getByRole("menuitem", { name: /view sources/i });
    await userEvent.click(viewBtn);

    expect(await screen.findByText("Sources for AAPL")).toBeInTheDocument();
    expect(
      await screen.findByText("This is a research note")
    ).toBeInTheDocument();
  });
});
