import { Metadata } from "next";
import ReportList from "@/features/report/components/ReportList";

export const metadata: Metadata = {
  title: "Market Research & Insights | PortfolioPro",
  description:
    "Access exclusive financial reports, market analysis, and investment strategies. Stay ahead with our weekly macro updates.",
  openGraph: {
    title: "Market Research & Insights",
    description: "Deep dive into market trends with our expert analysis.",
    type: "website",
  },
};

export default function LearnPage() {
  // 👇 Define the Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Market Intelligence & Research",
    description:
      "Exclusive financial reports, market analysis, and investment strategies.",
    publisher: {
      "@type": "Organization",
      name: "PortfolioPro",
      url: "https://portfoliopro.com", // Replace with your actual domain later
      logo: {
        "@type": "ImageObject",
        url: "https://portfoliopro.com/logo.png", // Replace with your actual logo
      },
    },
    audience: {
      "@type": "Audience",
      audienceType: "Investors",
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      {/* 👇 Inject the JSON-LD Script for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Market Intelligence
          </h1>
          <p className="text-lg text-slate-600">
            Expert analysis to guide your investment decisions. Filter by topic
            to find exactly what you need.
          </p>
        </div>

        {/* The Interactive List */}
        <ReportList />
      </div>
    </main>
  );
}
