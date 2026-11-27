import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About | Software Developer & Cloud Computing",
  description: `About ${siteConfig.name} — Software Developer and B.Tech CSE (Cloud Computing) student in ${siteConfig.location} building production cloud infrastructure and full stack systems.`,
  alternates: {
    canonical: "/about/",
  },
  openGraph: {
    title: `About ${siteConfig.name} | Software Developer & Cloud Computing`,
    description: `About ${siteConfig.name} — Software Developer and B.Tech CSE (Cloud Computing) student in ${siteConfig.location} building production cloud infrastructure and full stack systems.`,
    url: "/about/",
    type: "profile",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `About ${siteConfig.name} | Software Developer & Cloud Computing`,
    description: `About ${siteConfig.name} — Software Developer and B.Tech CSE (Cloud Computing) student in ${siteConfig.location}.`,
    images: ["/og-image.png"],
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <AboutSection />

        <section className="py-12 md:py-16">
          <div className="portfolio-container">
            <div className="flex flex-col items-start justify-between gap-6 rounded-[20px] border border-[#242424] bg-[#141414] p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="font-mono-code text-meta text-[#F5D90A]">
                  Continue Exploring
                </p>
                <h2 className="text-subhead mt-2 text-[#F5F5F0]">
                  See how these principles translate into shipped systems.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/projects/"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] bg-[#F5D90A] px-5 py-2.5 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
                >
                  <span>View Projects</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/experience/"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-5 py-2.5 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                >
                  <span>Experience &amp; Credentials</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
