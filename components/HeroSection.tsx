import { ArrowDownRight, Download, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "@/components/BrandIcons";
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
      className="relative border-b border-[#242424] pt-8 pb-12 md:pt-12 md:pb-16 lg:pt-14 lg:pb-20"
    >
      <div className="portfolio-container">
        {/* Top Metadata Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#242424] bg-[#141414] px-3.5 py-1.5 text-meta text-[#A1A1AA]">
            <MapPin className="h-3.5 w-3.5 text-yellow-400" aria-hidden="true" />
            <span>{siteConfig.location}</span>
          </div>

          <div className="inline-flex items-center rounded-full bg-yellow-400 px-3.5 py-1.5 text-meta font-semibold text-[#0B0B0B]">
            <span>Software Developer · Cloud &amp; AI</span>
          </div>
        </div>

        {/* Balanced Two-Column Hero Grid */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* Left Column: 4-Line Editorial Headline, Intro, CTAs */}
          <div className="lg:col-span-7">
            <h1 className="font-display text-[clamp(2.15rem,1.35rem+3.8vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.03em] text-[#F5F5F0]">
              <span className="block">DESIGNING.</span>
              <span className="block text-yellow-400">BUILDING.</span>
              <span className="block">ENGINEERING</span>
              <span className="block">WHAT&apos;S NEXT.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#A1A1AA] md:mt-6 md:text-lg">
              I&apos;m Sakthi B, a software developer interested in full-stack engineering,
              cloud computing, computer vision, and AI-powered applications.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3.5 md:mt-7">
              <Link
                href="/projects/"
                prefetch={false}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] bg-yellow-400 px-6 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
              >
                <span>Explore Projects</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/contact/"
                prefetch={false}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-6 py-3 font-display text-sm font-semibold text-[#F5F5F0] transition-colors hover:border-yellow-400 hover:text-yellow-400"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Contact Me</span>
              </Link>
            </div>

            {/* Profile & Resume Links */}
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#242424] pt-5">
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-yellow-400"
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
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-yellow-400"
              >
                <LinkedInIcon className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>

              <span aria-hidden="true" className="text-[#383838]">
                /
              </span>

              <Link
                href={siteConfig.resumeUrl}
                prefetch={false}
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-yellow-400"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Resume</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Engineer Profile Card */}
          <div className="lg:col-span-5">
            <div className="editorial-grid-bg rounded-[20px] border border-[#242424] bg-[#141414] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-[#242424] pb-3.5">
                <div>
                  <p className="font-mono-code text-meta text-yellow-400">
                    ENGINEER PROFILE
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-[#F5F5F0]">
                    {siteConfig.name}
                  </p>
                </div>
                <span className="font-mono-code rounded border border-[#2A2A2A] bg-[#0B0B0B] px-2.5 py-1 text-xs text-[#A1A1AA]">
                  &apos;27 Grad
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {focusPillars.map((pillar) => (
                  <div
                    key={pillar.code}
                    className="rounded-[12px] border border-[#242424] bg-[#0B0B0B]/85 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-[#F5F5F0]">
                        {pillar.title}
                      </span>
                      <span className="font-mono-code text-xs text-yellow-400">
                        {pillar.code}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                      {pillar.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#242424] pt-3.5 text-meta text-[#A1A1AA]">
                <span>B.Tech CSE · Cloud</span>
                <span className="font-mono-code text-[#F5F5F0]">CGPA 7.9/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
