"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ISourceRepository, IStorageService } from "@/types";
import { FirestoreSourcesAdapter } from "@/lib/firebase/sources.adapter";
import { FirebaseStorageAdapter } from "@/lib/firebase/storage.adapter";

//#1
// Define the shape of the context data; what provider provides
//record what sources it is and provide storage service
interface SourcesContextType {
  sourcesService: ISourceRepository;
  storageService: IStorageService;
}
//#2
// Create the context with a default value
const SourcesContext = createContext<SourcesContextType | undefined>(undefined);

//#3
// Create the provider
export function SourcesProvider({ children }: { children: ReactNode }) {
  const [sourcesService] = useState<ISourceRepository>(
    () => new FirestoreSourcesAdapter()
  );
  const [storageService] = useState<IStorageService>(
    () => new FirebaseStorageAdapter()
  );

  const value = {
    sourcesService,
    storageService,
  };

  return (
    <SourcesContext.Provider value={value}>{children}</SourcesContext.Provider>
  );
}

//#4
// Create a custom hook to use the SourcesContext
export function useSources() {
  const context = useContext(SourcesContext);
  if (context === undefined) {
    throw new Error("useSources must be used within a SourcesProvider");
  }
  return context;
}
