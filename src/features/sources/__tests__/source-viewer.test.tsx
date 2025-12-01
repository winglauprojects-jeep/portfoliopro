import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioTable } from "@/features/portfolio/components/portfolio-table";
import { AppProvider } from "@/providers/app";

// 1. Mock the Toaster (Return null to avoid rendering issues)
jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

// 2. Mock Auth (Return children directly)
jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ user: { uid: "test-user" } }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// 3. Mock Sources Provider
const mockGetSources = jest.fn();
const mockDeleteSource = jest.fn();

jest.mock("@/providers/sources-provider", () => ({
  useSources: () => ({
    sourceService: {
      getSourcesForStock: mockGetSources,
      deleteSource: mockDeleteSource,
    },
  }),
  SourcesProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// 4. Mock Portfolio Provider
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
  PortfolioProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("Source Viewer Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays sources when 'View Sources' is clicked", async () => {
    // Setup the mock return value
    mockGetSources.mockResolvedValue([
      {
        id: "src-1",
        type: "note",
        content: "This is a research note",
        visibility: "private",
        status: "approved",
      },
    ]);

    // Render the App
    render(
      <AppProvider>
        <PortfolioTable />
      </AppProvider>
    );

    // 1. Find the row for AAPL
    const row = screen.getByRole("row", { name: /AAPL/i });

    // 2. Click the 'Actions' menu button inside that row
    const menuBtn = within(row).getByRole("button", { name: /open menu/i });
    await userEvent.click(menuBtn);

    // 3. Click 'View Sources' in the dropdown
    const viewBtn = screen.getByRole("menuitem", { name: /view sources/i });
    await userEvent.click(viewBtn);

    // 4. Verify the Dialog Title appears
    expect(await screen.findByText("Sources for AAPL")).toBeInTheDocument();

    // 5. Verify the Note Content appears
    expect(
      await screen.findByText("This is a research note")
    ).toBeInTheDocument();
  });
});
