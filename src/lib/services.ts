import { FirebaseStorageAdapter } from "./firebase/storage.adapter";
import { FirebaseUserAdapter } from "@/lib/firebase/user.adapter";
export const storageService = new FirebaseStorageAdapter();
export const userService = new FirebaseUserAdapter();
export * from "@/features/report/services";
