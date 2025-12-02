import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioTable } from "@/features/portfolio/components/portfolio-table";
import { AppProvider } from "@/providers/app";

// ============================================
// MOCK THE DIALOG COMPONENT FIRST (CRITICAL!)
// ============================================
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

// 1. Mock Toaster
jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

// 2. Mock Auth
jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ user: { uid: "test-user" } }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// 3. Mock Sources - Define mocks BEFORE jest.mock
const mockGetSources = jest.fn();
const mockDeleteSource = jest.fn();

jest.mock("@/providers/sources-provider", () => ({
  useSources: () => ({
    sourcesService: {
      getSourcesForStock: mockGetSources,
      deleteSource: mockDeleteSource,
    },
    storageService: {
      uploadFile: jest.fn(),
      getDownloadUrl: jest.fn(),
    },
  }),
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
    stockService: {
      deleteStock: jest.fn(),
    },
    loading: false,
    accounts: ["Brokerage"],
  }),
  PortfolioProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("Source Viewer Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock implementation
    mockGetSources.mockResolvedValue([
      {
        id: "src-1",
        type: "note",
        content: "This is a research note",
        visibility: "private",
        status: "approved",
      },
    ]);
  });

  it("loads and displays sources when 'View Sources' is clicked", async () => {
    const user = userEvent.setup();

    render(
      <AppProvider>
        <PortfolioTable />
      </AppProvider>
    );

    // Find the table row for AAPL
    const row = screen.getByRole("row", { name: /AAPL/i });

    // Find and click the actions menu button
    const menuBtn = within(row).getByRole("button", { name: /open menu/i });
    await user.click(menuBtn);

    // Find and click "View Sources" menu item
    const viewBtn = screen.getByRole("menuitem", { name: /view sources/i });
    await user.click(viewBtn);

    // Wait for the mock to be called
    await waitFor(() => {
      expect(mockGetSources).toHaveBeenCalledWith("test-user", "AAPL");
    });

    // Now the dialog should be in the DOM (not in a portal)
    expect(screen.getByText("Sources for AAPL")).toBeInTheDocument();

    // Wait for the note to appear
    expect(
      await screen.findByText("This is a research note")
    ).toBeInTheDocument();
  });
});
