/**
 * Basic user profile information.
 */
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  avatarUrl?: string;
  bio?: string;
}
/**
 * Represents a single stock holding within a specific account.
 */
export interface StockHolding {
  id: string; // Unique ID for this specific holding
  userId: string;
  accountName: string;
  tickerSymbol: string;
  shareCount: number;
  averagePurchasePrice: number;
}

/**
 * Represents a single stock holding within a specific account.
 */
export interface StockSource {
  id: string; // Unique ID for this source
  userId: string; // Who added this source
  tickerSymbol: string;

  type: "note" | "file" | "url";
  content: string; // The note text, file path, or external URL

  visibility: "private" | "public";
  status: "pending" | "approved"; // For public moderation
}

// ----------------------------------------------------------------
// 2. SERVICE INTERFACES (THE "ADAPTER" CONTRACTS)
// (Based on your "Decoupled Services" principle)
// ----------------------------------------------------------------

/**
 * Defines the contract for all authentication operations.
 * Our Firebase adapter will implement this.
 */
export interface IAuthRepository {
  signIn(email: string, password: string): Promise<UserProfile>;
  signUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<UserProfile>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void; // Returns an unsubscribe function

  signInWithGoogle(): Promise<UserProfile>;
  signInWithFacebook(): Promise<UserProfile>;
}

/**
 * Defines the contract for portfolio data operations.
 */
export interface IStockRepository {
  addStock(stock: Omit<StockHolding, "id">): Promise<StockHolding>;
  updateStock(stockId: string, data: Partial<StockHolding>): Promise<void>;
  deleteStock(stockId: string): Promise<void>;
  getPortfolio(userId: string): Promise<StockHolding[]>;
  // Can be used for real-time updates from Firestore
  subscribeToPortfolioUpdates(
    userId: string,
    callback: (portfolio: StockHolding[]) => void
  ): () => void; // Returns an unsubscribe function
}

/**
 * Defines the contract for file storage operations.
 */
export interface IStorageService {
  uploadFile(file: File, path: string): Promise<string>; // Returns download URL
  getDownloadUrl(path: string): Promise<string>;
}

/**
 * Defines the contract for managing stock sources (notes, files, URLs).
 */
export interface ISourceRepository {
  addSource(source: Omit<StockSource, "id">): Promise<StockSource>;
  getSourcesForStock(
    userId: string,
    tickerSymbol: string
  ): Promise<StockSource[]>;
  deleteSource(sourceId: string): Promise<void>;

  // 2. Moderation (For the Admin feature later)
  // We will fetch all sources where status == 'pending'
  getPendingSources(): Promise<StockSource[]>;

  // Approve or Reject a source
  updateSourceStatus(
    sourceId: string,
    status: "approved" | "rejected"
  ): Promise<void>;
}
