"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IAuthRepository, UserProfile } from "@/types";
import { FirebaseAuthAdapter } from "@/lib/firebase/auth.adapter";
// ⛔️ No more 'import { ... } from "firebase/auth"' here!

// 1. Define the shape of the context data
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  // We can expose the adapter instance for components to call signIn/signOut
  authService: IAuthRepository;
}

// 2. Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create the adapter instance *once*
  const [authService] = useState(() => new FirebaseAuthAdapter());

  useEffect(() => {
    // Correct: Call the method *from the adapter instance*.
    // This provider doesn't know or care if this is Firebase,
    // it just knows the IAuthRepository contract.
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [authService]); // Effect depends on the authService instance

  const value = {
    user,
    loading,
    authService, // Expose the service so UI can call authService.signIn()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 4. Create a custom hook for easy access
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
