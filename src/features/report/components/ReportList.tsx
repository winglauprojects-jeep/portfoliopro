"use client";

import { useEffect, useState } from "react";
import { IResearchReport } from "@/types";
import { reportsService } from "@/lib/services";
import { Search, Filter, FileText, ExternalLink } from "lucide-react";

export default function ReportList() {
  const [reports, setReports] = useState<IResearchReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // -- Filter States --
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // -- 1. Fetch Data Engine --
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // Prepare options for our Adapter
        // If a tag is selected, we ask Firestore to filter.
        // If not, we get everything recent.
        const options = selectedTag ? { tags: [selectedTag] } : {};

        const data = await reportsService.getReports(options);
        setReports(data);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [selectedTag]); // Re-run whenever the selected tag changes

  // -- 2. Client-Side Title Filtering --
  // Firestore is great at Tags, but partial text search (LIKE 'mark%') is expensive.
  // We filter the title on the client side since we already have the data.
  const displayedReports = reports.filter((r) =>
    r.title.toLowerCase().includes(searchTitle.toLowerCase())
  );

  // Common tags helper (optional: you could fetch unique tags from DB later)
  const commonTags = ["Macro", "Tech", "Crypto", "Q3", "Weekly"];

  return (
    <div className="space-y-6">
      {/* --- Controls Section --- */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-50 p-4 rounded-lg">
        {/* Search Bar */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Filter size={14} /> Filter:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 text-sm rounded-full transition-colors border ${
              selectedTag === null
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {commonTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 text-sm rounded-full transition-colors border ${
                selectedTag === tag
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* --- Results Grid --- */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">
          Loading reports...
        </div>
      ) : displayedReports.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg text-gray-400">
          No reports found matching your criteria.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      report.type === "paid"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {report.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {report.createdAt
                      ? report.createdAt.toLocaleDateString()
                      : "Just now"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {report.title}
                </h3>

                {/* Tags Display */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {report.tags?.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <FileText size={14} /> HTML Report
                </div>
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  Read Report <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
