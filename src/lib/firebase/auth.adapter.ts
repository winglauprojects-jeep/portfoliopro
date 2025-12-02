// impletment the IAuthRepository contract using Firebase
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "./config"; //Import the initialized auth service
import { IAuthRepository, UserProfile } from "@/types";

// Helper function to map Firebase User to our UserProfile interface
const mapUserToUserProfile = (user: User): UserProfile => {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.photoURL || undefined,
    bio: undefined,
  };
};

export class FirebaseAuthAdapter implements IAuthRepository {
  private auth: Auth;
  constructor() {
    this.auth = auth;
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return mapUserToUserProfile(userCredential.user);
    } catch (_error) {
      throw new Error("Firebase sign-up failed");
    }
  }
  async signUp(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return mapUserToUserProfile(userCredential.user);
    } catch (_error) {
      throw new Error("Firebase sign-up failed");
    }
  }
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (_error) {
      throw new Error("Firebase sign-out failed");
    }
  }
  async getCurrentUser(): Promise<UserProfile | null> {
    const user = this.auth.currentUser;
    return user ? mapUserToUserProfile(user) : null;
  }
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    // onAuthStateChanged returns its own unsubscribe function,
    // which we just return directly.
    return fbOnAuthStateChanged(this.auth, (user) => {
      if (user) {
        callback(mapUserToUserProfile(user));
      } else {
        callback(null);
      }
    });
  }

  async signInWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(this.auth, provider);
      return mapUserToUserProfile(userCredential.user);
    } catch (_error) {
      throw new Error("Google sign-in failed.");
    }
  }

  async signInWithFacebook(): Promise<UserProfile> {
    // You would implement this similarly to Google
    console.warn("Facebook login not implemented in adapter.");
    throw new Error("Not implemented");
  }
}
