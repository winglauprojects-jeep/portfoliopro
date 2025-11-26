import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  Firestore,
  CollectionReference,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "./config"; // Import the initialized Firestore service
import { ISourceRepository, StockSource } from "@/types";
const mapDocToSourcce = (doc: DocumentData) => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    tickerSymbol: data.tickerSymbol,
    type: data.type,
    content: data.content,
    visibility: data.visibility,
    status: data.status,
  };
};

const mapSnapshotToSources = (snapshot: QuerySnapshot): StockSource[] => {
  return snapshot.docs.map(mapDocToSourcce);
};
export class FirestoreSourcesAdapter implements ISourceRepository {
  private db: Firestore;
  private sourcesCol: CollectionReference<DocumentData>;

  constructor() {
    this.db = db;
    this.sourcesCol = collection(this.db, "sources");
  }

  async addSource(source: Omit<StockSource, "id">): Promise<StockSource> {
    try {
      const docRef = await addDoc(this.sourcesCol, source);
      const newSource: StockSource = {
        id: docRef.id,
        ...source,
      };
      return newSource;
    } catch (error) {
      console.error("Error adding source:", error);
      throw new Error("Firebase add source failed");
    }
  }

  async getSourcesForStock(
    userId: string,
    tickerSymbol: string
  ): Promise<StockSource[]> {
    try {
      const q = query(
        this.sourcesCol,
        where("tickerSymbol", "==", tickerSymbol),
        where("userId", "==", userId),
        orderBy("type", "asc")
      );
      const querySnapshot = await getDocs(q);
      return mapSnapshotToSources(querySnapshot);
    } catch (error) {
      console.error("Error fetching sources by ticker:", error);
      throw new Error("Firebase get sources by ticker failed");
    }
  }
  async deleteSource(sourceId: string): Promise<void> {
    try {
      const sourceDoc = doc(this.sourcesCol, sourceId);
      await deleteDoc(sourceDoc);
    } catch (error) {
      console.error("Error deleting source:", error);
      throw new Error("Firebase delete source failed");
    }
  }
  async getPendingSources(): Promise<StockSource[]> {
    try {
      const q = query(
        this.sourcesCol,
        where("status", "==", "pending"),
        orderBy("tickerSymbol", "asc")
      );
      const querySnapshot = await getDocs(q);
      return mapSnapshotToSources(querySnapshot);
    } catch (error) {
      console.error("Error fetching pending sources:", error);
      throw new Error("Firebase get pending sources failed");
    }
  }
  async updateSourceStatus(
    sourceId: string,
    status: "approved" | "rejected"
  ): Promise<void> {
    try {
      const sourceDoc = doc(this.sourcesCol, sourceId);
      await updateDoc(sourceDoc, { status });
    } catch (error) {
      console.error("Error updating source status:", error);
      throw new Error("Firebase update source status failed");
    }
  }
}
