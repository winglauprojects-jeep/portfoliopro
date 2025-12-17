"use client";

import { useState } from "react";
import { reportsService, storageService } from "@/lib/services";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export default function UploadPortal() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  // State for form inputs
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<"free" | "paid">("free");
  // --- 1. Handling Access Control ---
  if (loading)
    return <div className="p-10 text-center">Loading permissions...</div>;

  if (!user || !isAdmin) {
    return (
      <div className="p-10 text-center text-red-600">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>You must be an admin to view this page.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-blue-600 underline"
        >
          Go Home
        </button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      alert("Please select a file and provide a title.");
      return;
    }

    setIsLoading(true);

    try {
      const path = `reports/${reportType}/${user.uid}/${Date.now()}_${
        file.name
      }`;
      const downloadUrl = await storageService.uploadFile(file, path);
      const tagsArray = (tagsInput || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter((t) => t);

      await reportsService.addReport({
        title,
        fileUrl: downloadUrl,
        tags: tagsArray,
        ownerId: user.uid, // ✅ We use the user from context
        type: reportType || "free",
      });

      alert("Uploaded!");
      // clear form...
    } catch (error) {
      console.error(error);
      alert("Error uploading");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Upload Research Report
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Weekly Market Outlook"
            required
          />
        </div>

        {/* Report Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as "free" | "paid")}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Macro, TSLA, Tech"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple tags with commas.
          </p>
        </div>

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HTML File
          </label>
          <input
            type="file"
            accept=".html"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded text-white font-semibold transition-colors ${
            isLoading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Uploading..." : "Upload Report"}
        </button>
      </form>
    </div>
  );
}
