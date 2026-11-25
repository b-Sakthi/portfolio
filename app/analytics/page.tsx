import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Visitor Analytics",
  description:
    "Private visitor and page view analytics for Sakthi B's portfolio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyticsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[75vh] py-10 md:py-14">
        <div className="portfolio-container">
          <AnalyticsDashboard />
        </div>
      </main>
      <Footer />
    </>
  );
}
