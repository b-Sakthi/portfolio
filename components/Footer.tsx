"use client";

import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#242424] bg-[#0B0B0B] py-12">
      <div className="portfolio-container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full bg-[#F5D90A]"
            />
            <span className="font-display text-base font-bold text-[#F5F5F0]">
              {siteConfig.name}
            </span>
          </div>
          <p className="text-meta text-[#A1A1AA]">
            © {year} {siteConfig.name}. Built with Next.js static export · {siteConfig.location}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link
            href="/analytics/"
            prefetch={false}
            className="inline-flex min-h-[44px] items-center text-sm text-[#A1A1AA] transition-colors hover:text-[#F5D90A]"
          >
            Analytics
          </Link>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex min-h-[44px] items-center text-sm text-[#A1A1AA] transition-colors hover:text-[#F5D90A]"
          >
            Email
          </a>
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center text-sm text-[#A1A1AA] transition-colors hover:text-[#F5D90A]"
          >
            GitHub
          </a>
          <a
            href={siteConfig.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center text-sm text-[#A1A1AA] transition-colors hover:text-[#F5D90A]"
          >
            LinkedIn
          </a>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#242424] bg-[#141414] px-4 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
          >
            <span>Top</span>
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
