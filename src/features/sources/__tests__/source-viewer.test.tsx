import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioTable } from "@/features/portfolio/components/portfolio-table";
import { AppProvider } from "@/providers/app";

// ------------------------------------------------------------------
// SAFE MOCKS
// ------------------------------------------------------------------

jest.mock("@/components/ui/dialog", () => {
  return {
    Dialog: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open: boolean;
    }) => <>{open ? children : null}</>,
    DialogContent: ({ children }: { children: React.ReactNode }) => (
      <div role="dialog">{children}</div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
      <h1>{children}</h1>
    ),
    DialogDescription: ({ children }: { children: React.ReactNode }) => (
      <p>{children}</p>
    ),
    // These triggers are not used in the viewer (it's controlled), but good to mock just in case
    DialogTrigger: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// 1. Mock Toaster: Return null to avoid browser issues
jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

// 2. Mock Auth: Pass-through the children
jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ user: { uid: "test-user" } }),
  AuthProvider: (props: { children: React.ReactNode }) => props.children,
}));

// 3. Mock Sources: Pass-through the children
const mockGetSources = jest.fn();
const mockDeleteSource = jest.fn();

jest.mock("@/providers/sources-provider", () => ({
  useSources: () => ({
    sourcesService: {
      getSourcesForStock: mockGetSources,
      deleteSource: mockDeleteSource,
    },
  }),
  SourcesProvider: (props: { children: React.ReactNode }) => props.children,
}));

// 4. Mock Portfolio: Pass-through the children
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
  PortfolioProvider: (props: { children: React.ReactNode }) => props.children,
}));

// ------------------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------------------

describe("Source Viewer Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays sources when 'View Sources' is clicked", async () => {
    // Setup Mock Data
    mockGetSources.mockResolvedValue([
      {
        id: "src-1",
        type: "note",
        content: "This is a research note",
        visibility: "private",
        status: "approved",
      },
    ]);
    const user = userEvent.setup();
    // Render the App wrapped in the Provider
    render(
      <AppProvider>
        <PortfolioTable />
      </AppProvider>
    );
    screen.debug();
    // 1. Find AAPL Row
    const row = screen.getByRole("row", { name: /AAPL/i });

    // 2. Open Menu
    const menuBtn = within(row).getByRole("button", { name: /open menu/i });
    await user.click(menuBtn); //userEvent.click(menuBtn);

    // 3. Click View Sources
    const viewBtn = screen.getByRole("menuitem", { name: /view sources/i });
    await user.click(viewBtn); //userEvent.click(viewBtn);

    // 4. Wait for Dialog and Data
    await waitFor(() => {
      expect(screen.getByText("Sources for AAPL")).toBeInTheDocument();
    });

    expect(mockGetSources).toHaveBeenCalledWith("test-user", "AAPL");

    await waitFor(() => {
      expect(screen.getByText("This is a research note")).toBeInTheDocument();
    });
  });
});
