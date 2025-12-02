import React from "react";
import { render } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { PortfolioTable } from "@/features/portfolio/components/portfolio-table";
import { AppProvider } from "@/providers/app";

// ============================================
// MOCK THE DIALOG COMPONENT FIRST (CRITICAL!)
// ============================================
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

// ... imports

// 1. Mock Toaster
jest.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

// 2. Mock Auth (Typed children)
jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ user: { uid: "test-user" } }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// 3. Mock Sources (Typed children)
const mockGetSources = jest.fn();
const mockDeleteSource = jest.fn();

jest.mock("@/providers/sources-provider", () => ({
  useSources: () => ({
    sourcesService: {
      getSourcesForStock: mockGetSources,
      deleteSource: mockDeleteSource,
    },
  }),
  SourcesProvider: ({ children }: { children: React.ReactNode }) => (
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
    render(
      <AppProvider>
        <PortfolioTable />
      </AppProvider>
    );

    // ... rest of your test
  });
});
