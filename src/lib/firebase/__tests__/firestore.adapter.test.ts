import { FirestoreSourcesAdapter } from "../sources.adapter";
import { addDoc, collection } from "firebase/firestore";

// 1. Mock Firebase modules completely
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  // We don't need query/where/getDocs for this specific test,
  // but if we did, we'd mock them here.
}));

// 2. Mock your config to avoid initializing the real app
jest.mock("../config", () => ({
  db: {},
}));

describe("FirestoreSourcesAdapter (Unit)", () => {
  // Clean up mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("addSource calls firestore with correct data", async () => {
    // A. Setup
    const adapter = new FirestoreSourcesAdapter();

    const mockInput = {
      userId: "user-123",
      tickerSymbol: "AAPL",
      type: "note" as const,
      content: "Test note",
      visibility: "private" as const,
      status: "approved" as const,
    };

    // B. Mock the return value of addDoc (what Firestore WOULD return)
    (addDoc as jest.Mock).mockResolvedValue({ id: "new-doc-id" });

    // C. Execute
    const result = await adapter.addSource(mockInput);

    // D. Assert
    // Did we try to get the collection?
    expect(collection).toHaveBeenCalled();

    // Did we try to save the exact data we passed in?
    expect(addDoc).toHaveBeenCalledWith(undefined, mockInput);

    // Did the adapter correctly attach the new ID to the result?
    expect(result).toEqual({ ...mockInput, id: "new-doc-id" });
  });
});
