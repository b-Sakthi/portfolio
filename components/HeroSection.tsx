"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, Download, MapPin } from "lucide-react";
import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "@/components/BrandIcons";
import { StarMotif } from "@/components/StarMotif";
import { siteConfig } from "@/lib/site-config";

const focusPillars = [
  {
    code: "01",
    title: "Full-Stack Engineering",
    detail: "Next.js, TypeScript, FastAPI, Node.js, PostgreSQL & MongoDB",
  },
  {
    code: "02",
    title: "Cloud & DevOps",
    detail: "Docker, Kubernetes, GCP Cloud Run, Azure, AWS & GitHub Actions",
  },
  {
    code: "03",
    title: "Computer Vision & AI",
    detail: "YOLO11n, ByteTrack, OpenCV, Hybrid RAG & Groq LLM APIs",
  },
];

export function HeroSection() {
  return (
    <section
      id="home"
      tabIndex={-1}
      className="relative border-b border-[#242424] pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-24 lg:pb-30"
    >
      <div className="portfolio-container">
        {/* Top Metadata Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#242424] bg-[#141414] px-3.5 py-1.5 text-meta text-[#A1A1AA]">
            <MapPin className="h-3.5 w-3.5 text-[#F5D90A]" aria-hidden="true" />
            <span>{siteConfig.location}</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#F5D90A] px-4 py-1.5 text-meta font-semibold text-[#0B0B0B]">
            <span>Software Developer · Cloud &amp; AI</span>
          </div>
        </motion.div>

        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8"
          >
            <div className="relative">
              <StarMotif
                size={28}
                className="mb-4 text-[#F5D90A] md:mb-6"
              />
              <h1 className="text-hero text-[#F5F5F0]">
                BUILDING SOFTWARE{" "}
                <span className="block">
                  THAT <span className="text-[#F5D90A]">SOLVES</span>{" "}
                </span>
                <span className="block">
                  <span className="text-[#F5D90A]">REAL-WORLD</span> PROBLEMS.
                </span>
              </h1>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#A1A1AA] md:mt-8 md:text-lg">
              I&apos;m Sakthi B, a software developer interested in full-stack engineering,
              cloud computing, computer vision, and AI-powered applications.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] bg-[#F5D90A] px-6 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
              >
                <span>View Projects</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <Link
                href={siteConfig.resumeUrl}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-6 py-3 font-display text-sm font-semibold text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download Resume</span>
              </Link>
            </div>

            {/* Social / Profile Links */}
            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[#242424] pt-6">
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-[#F5D90A]"
              >
                <GitHubIcon className="h-4 w-4" />
                <span>github.com/{siteConfig.githubHandle}</span>
              </a>

              <span aria-hidden="true" className="text-[#383838]">
                /
              </span>

              <a
                href={siteConfig.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-[#F5D90A]"
              >
                <LinkedInIcon className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </motion.div>

          {/* Editorial Typographic / Architectural Summary Card (No Invented Photo) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4"
          >
            <div className="editorial-grid-bg rounded-[20px] border border-[#242424] bg-[#141414] p-6 md:p-7">
              <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                <div>
                  <p className="font-mono-code text-meta text-[#F5D90A]">
                    ENGINEER PROFILE
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-[#F5F5F0]">
                    {siteConfig.name}
                  </p>
                </div>
                <StarMotif size={20} className="text-[#F5D90A]" />
              </div>

              <div className="mt-5 space-y-4">
                {focusPillars.map((pillar) => (
                  <div
                    key={pillar.code}
                    className="rounded-[12px] border border-[#242424] bg-[#0B0B0B]/80 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-[#F5F5F0]">
                        {pillar.title}
                      </span>
                      <span className="font-mono-code text-xs text-[#F5D90A]">
                        {pillar.code}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                      {pillar.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#242424] pt-4 text-meta text-[#A1A1AA]">
                <span>B.Tech CSE · Cloud</span>
                <span className="font-mono-code text-[#F5F5F0]">CGPA 7.9/10</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
