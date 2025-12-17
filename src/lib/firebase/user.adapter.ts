import { doc, getDoc, setDoc, Firestore, Timestamp } from "firebase/firestore";
import { db } from "./config";
export interface IuserProfile {
  uid: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
}

export class FirebaseUserAdapter {
  private db: Firestore;
  constructor() {
    this.db = db;
  }

  async getUserProfile(uid: string): Promise<IuserProfile | null> {
    try {
      const userRef = doc(this.db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          // Convert Firestore Timestamp to JS Date if it exists
          createdAt: data.createdAt?.toDate(),
        } as IuserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  /**
   * Creates or updates a user profile.
   * We use { merge: true } so we don't accidentally overwrite an 'admin' role
   * if the user logs in again.
   */
  async ensureUserProfile(uid: string, email: string): Promise<void> {
    try {
      const userRef = doc(this.db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // 🆕 NEW USER CASE:
        // They don't exist yet, so we create them with the default "user" role.
        await setDoc(userRef, {
          uid,
          email,
          role: "user", // <--- Default role set here
          createdAt: new Date(),
          lastSeen: new Date(),
        });
      } else {
        // 🔄 RETURNING USER CASE:
        // They already exist. We ONLY update their email/lastSeen.
        // We do NOT touch the 'role' field, so Admins stay Admins.
        await setDoc(
          userRef,
          {
            email,
            lastSeen: new Date(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Error creating/updating user profile:", error);
    }
  }
}
