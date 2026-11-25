import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { ProjectVisual } from "@/components/ProjectVisual";
import { projects } from "@/lib/projects";
import { siteConfig, skillGroups } from "@/lib/site-config";

export default function HomePage() {
  const featuredPreviews = projects.slice(0, 2);

  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />

        {/* Selected Projects Preview (2 featured projects + link to /projects/) */}
        <section className="section-spacing border-b border-[#242424]">
          <div className="portfolio-container">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-meta font-medium text-[#F5D90A]">
                  Selected Work
                </p>
                <h2 className="text-section mt-2 text-[#F5F5F0]">
                  Featured Projects
                </h2>
              </div>
              <Link
                href="/projects/"
                prefetch={false}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-sm font-semibold text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
              >
                <span>View All {projects.length} Projects</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              {featuredPreviews.map((project) => (
                <article
                  key={project.slug}
                  className="group flex flex-col justify-between rounded-[16px] border border-[#242424] bg-[#141414] p-5 transition-colors hover:border-[#F5D90A]/55 sm:p-6"
                >
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono-code text-meta text-[#F5D90A]">
                        {project.number} / {project.category}
                      </span>
                      {project.role && (
                        <span className="font-mono-code rounded border border-[#2A2A2A] bg-[#0B0B0B] px-2.5 py-0.5 text-[11px] text-[#F5F5F0]">
                          {project.role}
                        </span>
                      )}
                    </div>

                    {(project.slug === "cintic" || project.slug === "linlearn") &&
                    project.live ? (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${project.name} live application preview`}
                        className="block rounded-[12px] focus-visible:outline-2 focus-visible:outline-[#F5D90A]"
                      >
                        <ProjectVisual slug={project.slug} title={project.name} />
                      </a>
                    ) : (
                      <ProjectVisual slug={project.slug} title={project.name} />
                    )}

                    <div className="mt-5 border-t border-[#242424] pt-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-project text-[#F5F5F0]">
                          {project.name}
                        </h3>
                        <span className="text-sm text-[#A1A1AA]">
                          {project.tagline}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[#D4D4D8]">
                        {project.oneLineDescription}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#242424] pt-4">
                    <Link
                      href={`/projects/${project.slug}/`}
                      prefetch={false}
                      className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-[#F5D90A] transition-colors hover:text-[#FFE524]"
                    >
                      <span>View Case Study</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>

                    <div className="flex flex-wrap items-center gap-4">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-[#F5F5F0]"
                        >
                          <span>GitHub ↗</span>
                        </a>
                      )}
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-[#F5F5F0]"
                        >
                          <span>Live Demo ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Compact About Preview + Technical Expertise Overview */}
        <section className="section-spacing border-b border-[#242424]">
          <div className="portfolio-container grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* About Preview */}
            <div className="flex flex-col justify-between rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8 lg:col-span-6">
              <div>
                <p className="text-meta font-medium text-[#F5D90A]">About</p>
                <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                  From Idea To Production Systems.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
                  I&apos;m a Computer Science undergraduate specializing in{" "}
                  <span className="text-[#F5F5F0]">Cloud Computing</span> at
                  Alliance University, Bengaluru (2023–2027). I build
                  full-stack applications, cloud systems, and AI-powered tools
                  with a focus on reliable, production-ready software.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-[#242424] pt-5">
                <Link
                  href="/about/"
                  prefetch={false}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                >
                  <span>Read About Me</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/experience/"
                  prefetch={false}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-[#F5D90A] hover:text-[#F5F5F0]"
                >
                  <span>Credentials</span>
                </Link>
              </div>
            </div>

            {/* Compact Technical Expertise */}
            <div className="flex flex-col justify-between rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8 lg:col-span-6">
              <div>
                <p className="text-meta font-medium text-[#F5D90A]">
                  Technical Expertise
                </p>
                <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                  Core Engineering Stack
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {skillGroups.map((group) => (
                    <li
                      key={group.id}
                      className="flex flex-col gap-1 border-b border-[#242424] pb-2.5 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                    >
                      <span className="font-semibold text-[#F5F5F0]">
                        {group.category}
                      </span>
                      <span className="text-xs text-[#A1A1AA] sm:text-right">
                        {group.items.slice(0, 5).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-[#242424] pt-5">
                <Link
                  href="/skills/"
                  prefetch={false}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                >
                  <span>Explore Full Skills</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="section-spacing">
          <div className="portfolio-container">
            <div className="flex flex-col items-start justify-between gap-6 rounded-[20px] border border-[#242424] bg-[#141414] p-6 sm:p-10 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-meta font-medium text-[#F5D90A]">
                  Get In Touch
                </p>
                <h2 className="text-section mt-3 text-[#F5F5F0]">
                  HAVE A PROJECT IN MIND?{" "}
                  <span className="text-[#F5D90A]">LET&apos;S BUILD SOMETHING.</span>
                </h2>
                <p className="mt-3 text-sm text-[#A1A1AA] sm:text-base">
                  Reach out for software engineering internships, full-stack
                  systems, cloud deployments, or applied AI collaborations.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact/"
                  prefetch={false}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] bg-[#F5D90A] px-6 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Contact Me</span>
                </Link>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-5 py-3 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                >
                  <span>{siteConfig.email}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
