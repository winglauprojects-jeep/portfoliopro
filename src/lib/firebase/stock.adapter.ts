import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  Firestore,
  CollectionReference,
} from "firebase/firestore";
//import db instance
import { db } from "./config"; // Import the initialized Firestore service
//import contract (interface)
import { IStockRepository, StockHolding } from "@/types";

// Helper function to map Firestore document to StockHolding interface
const mapDocToStockHolding = (doc: DocumentData): StockHolding => {
  return {
    id: doc.id,
    userId: doc.userId,
    accountName: doc.accountName,
    tickerSymbol: doc.tickerSymbol,
    shareCount: doc.shareCount,
    averagePurchasePrice: doc.averagePurchasePrice,
  };
};

/**
 * Converts a Firestore QuerySnapshot to an array of StockHoldings
 */
const mapSnapshotToStockHoldings = (
  snapshot: QuerySnapshot
): StockHolding[] => {
  return snapshot.docs.map(mapDocToStockHolding);
};
export class FirebaseStockAdapter implements IStockRepository {
  private db: Firestore; // <-- 1. Declare the dependency
  private stocksCol: CollectionReference<DocumentData>; // <-- 2. Declare the collection

  constructor() {
    this.db = db; // <-- 3. Assign the dependency in the constructor
    this.stocksCol = collection(this.db, "stocks"); // <-- 4. Initialize here
  }
  //   private stockCol = collection(db, "stocks");

  async addStock(stock: Omit<StockHolding, "id">): Promise<StockHolding> {
    try {
      const docRef = await addDoc(this.stocksCol, stock);
      const docSnap = await getDoc(docRef);
      return mapDocToStockHolding({ id: docSnap.id, ...stock });
    } catch (error) {
      console.error("Error adding stock:", error);
      throw new Error("Firebase add stock failed");
    }
  }
  async updateStock(
    stockId: string,
    data: Partial<StockHolding>
  ): Promise<void> {
    try {
      const stockDoc = doc(this.stocksCol, stockId);
      await updateDoc(stockDoc, data);
    } catch (error) {
      console.error("Error updating stock:", error);
      throw new Error("Firebase update stock failed");
    }
  }
  async deleteStock(stockId: string): Promise<void> {
    try {
      const stockDoc = doc(this.stocksCol, stockId);
      await deleteDoc(stockDoc);
    } catch (error) {
      console.error("Error deleting stock:", error);
      throw new Error("Firebase delete stock failed");
    }
  }
  async getPortfolio(userId: string): Promise<StockHolding[]> {
    try {
      const q = query(this.stocksCol, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return mapSnapshotToStockHoldings(querySnapshot);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      throw new Error("Firebase get portfolio failed");
    }
  }
  subscribeToPortfolioUpdates(
    userId: string,
    callback: (portfolio: StockHolding[]) => void
  ): () => void {
    const q = query(this.stocksCol, where("userId", "==", userId));
    //onSnapshot returns an unsubscribe function
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const portfolio = mapSnapshotToStockHoldings(querySnapshot);
      callback(portfolio);
    });
    return unsubscribe;
  }
}
