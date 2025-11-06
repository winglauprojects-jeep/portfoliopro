import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";
import { IStorageService } from "@/types";

export class FirebaseStorageAdapter implements IStorageService {
  private storage = storage;
  constructor() {
    this.storage = storage;
  }
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Firebase file upload failed");
    }
  }

  async getDownloadUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw new Error("Firebase get download URL failed");
    }
  }
}
