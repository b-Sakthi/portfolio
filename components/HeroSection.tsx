import { ArrowDownRight, ArrowUpRight, Download, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "@/components/BrandIcons";
import { siteConfig } from "@/lib/site-config";

export function HeroSection() {
  return (
    <section
      id="home"
      tabIndex={-1}
      className="relative border-b border-[#242424] pt-8 pb-12 md:pt-12 md:pb-16 lg:pt-14 lg:pb-20"
    >
      <div className="portfolio-container">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#242424] bg-[#141414] px-3.5 py-1.5 text-meta text-[#A1A1AA]">
            <MapPin className="h-3.5 w-3.5 text-[#F5D90A]" aria-hidden="true" />
            <span>{siteConfig.location}</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#242424] bg-[#141414] px-3.5 py-1.5 text-meta text-[#A1A1AA]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#F5D90A]" />
            <span>Cloud &amp; DevOps · Applied AI</span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <h1 className="font-display text-[clamp(2.15rem,1.35rem+3.8vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.03em] text-[#F5F5F0]">
              <span className="block">I BUILD</span>
              <span className="block text-[#F5D90A]">CLOUD &amp; DEVOPS</span>
              <span className="block">SYSTEMS.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#A1A1AA] md:mt-6 md:text-lg">
              Final-year CSE (Cloud) student. I built LinLearn, a browser-native Linux &amp; DevOps training platform, and contributed frontend and CI/CD to RetailIQ, a YOLO-based retail analytics system.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3.5 md:mt-7">
              <Link
                href="/projects/"
                prefetch={false}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] bg-[#F5D90A] px-6 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
              >
                <span>View Projects</span>
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <a
                href={siteConfig.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-5 py-3 font-display text-sm font-semibold text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download Resume</span>
              </a>

              <Link
                href="/contact/"
                prefetch={false}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-5 py-3 font-display text-sm font-semibold text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Contact Me</span>
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#242424] pt-5">
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
          </div>

          <div className="lg:col-span-5">
            <div className="editorial-grid-bg rounded-[20px] border border-[#242424] bg-[#141414] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-[#242424] pb-3.5">
                <div>
                  <p className="font-mono-code text-meta text-[#F5D90A]">
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
                <div className="rounded-[12px] border border-[#2A2A2A] bg-[#0B0B0B]/90 p-3.5 transition-colors hover:border-[#F5D90A]/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-[#F5F5F0]">
                      LinLearn
                    </span>
                    <span className="font-mono-code rounded bg-[#F5D90A] px-2 py-0.5 text-[10px] font-bold text-[#0B0B0B]">
                      FEATURED PROJECT
                    </span>
                  </div>

                  <div className="mt-2.5 overflow-hidden rounded-[8px] border border-[#242424] bg-[#0E091A]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/projects/linlearn-preview.png"
                      alt="LinLearn Linux and DevOps training platform dashboard preview"
                      width={480}
                      height={230}
                      loading="lazy"
                      decoding="async"
                      className="h-24 sm:h-28 w-full object-cover object-top transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-[#D4D4D8]">
                    Browser-native Linux &amp; DevOps training with incident simulation and mastery tracking
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href="https://linlearn.vercel.app/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[6px] bg-[#F5D90A] px-3.5 py-1.5 font-display text-xs font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
                    >
                      <span>Live Demo</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    <a
                      href="https://github.com/b-Sakthi/linlearn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[6px] border border-[#2A2A2A] bg-[#141414] px-3 py-1.5 text-xs font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                    >
                      <GitHubIcon className="h-3.5 w-3.5" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#242424] bg-[#0B0B0B]/85 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-[#F5F5F0]">
                      Cloud &amp; DevOps
                    </span>
                    <span className="font-mono-code text-xs text-[#F5D90A]">
                      02
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                    Docker, Docker Compose, GitHub Actions, CI/CD, Azure
                  </p>
                </div>

                <div className="rounded-[12px] border border-[#242424] bg-[#0B0B0B]/85 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-[#F5F5F0]">
                      Computer Vision &amp; AI
                    </span>
                    <span className="font-mono-code text-xs text-[#F5D90A]">
                      03
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                    Python, FastAPI, OpenCV, Hybrid RAG, Groq
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#242424] pt-3.5 text-meta text-[#A1A1AA]">
                <span>B.Tech CSE · Cloud</span>
                <span className="font-mono-code text-xs font-semibold text-[#F5F5F0]">
                  AZ-900 · OCI AI Foundations 2025
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
