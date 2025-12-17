import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Firestore,
  Query,
  DocumentData,
  addDoc,
} from "firebase/firestore";

import { db } from "./config"; // Import the initialized Firestore service
import { IResearchReport } from "@/types";

export interface GetReportsOptions {
  tags?: string[];
  ownerId?: string;
}

export class FirestoreReportAdapter {
  private db: Firestore;

  constructor() {
    this.db = db;
  }

  async addReport(
    reportData: Omit<IResearchReport, "id" | "createdAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, "reports"), {
        ...reportData,
        createdAt: new Date(), // Always timestamp it on the server side
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding report:", error);
      throw new Error("Failed to save report metadata.");
    }
  }
  async getReports(
    options: GetReportsOptions = {}
  ): Promise<IResearchReport[]> {
    try {
      let reportsCol = collection(this.db, "reports");

      //building query
      let q: Query<DocumentData> = query(
        reportsCol,
        orderBy("createdAt", "desc")
      );

      if (options.tags && options.tags.length > 0) {
        // Note: Firestore 'array-contains-any' lets us match IF the doc has ANY of the provided tags
        q = query(q, where("tags", "array-contains-any", options.tags));
      }
      // 2. Handle Owner Filtering
      if (options.ownerId) {
        q = query(q, where("ownerId", "==", options.ownerId));
      }

      // Execute the query
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        } as IResearchReport;
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw new Error("Firebase get reports failed");
    }
  }

  // --- Convenience Methods (Wrappers) ---

  async getRecentReports(): Promise<IResearchReport[]> {
    return this.getReports(); // No options = just get newest
  }

  async getReportsByTag(tags: string[]): Promise<IResearchReport[]> {
    return this.getReports({ tags });
  }

  async getReportsByOwner(ownerId: string): Promise<IResearchReport[]> {
    return this.getReports({ ownerId });
  }
}
