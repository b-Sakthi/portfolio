import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ExperienceSection } from "@/components/ExperienceSection";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Experience & Credentials",
  description: `Education, certifications, and project contributions of ${siteConfig.name}.`,
  alternates: {
    canonical: "/experience/",
  },
  openGraph: {
    title: `Experience & Credentials | ${siteConfig.name}`,
    description: `Education, certifications, and project contributions of ${siteConfig.name}.`,
    url: "/experience/",
  },
};

export default function ExperiencePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <ExperienceSection />

        {/* Project Contributions Overview */}
        <section className="py-16 md:py-20">
          <div className="portfolio-container">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono-code text-meta text-[#F5D90A]">
                  Engineering Contributions
                </p>
                <h2 className="text-section mt-3 text-[#F5F5F0]">
                  Individual &amp; Team Scope
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA]">
                Clear breakdown of my verified responsibilities across
                individual builds and collaborative engineering projects.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.slug}
                  className="flex flex-col justify-between rounded-[16px] border border-[#242424] bg-[#141414] p-6"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono-code text-xs text-[#F5D90A]">
                        {project.number} · {project.role ?? "Individual Build"}
                      </span>
                      <span className="text-xs text-[#A1A1AA]">
                        {project.tagline}
                      </span>
                    </div>
                    <h3 className="text-subhead mt-2 text-[#F5F5F0]">
                      {project.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                      {project.contributionSummary}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-[#242424] pt-4">
                    <Link
                      href={`/projects/${project.slug}/`}
                      className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-[#F5D90A] transition-colors hover:text-[#FFE524]"
                    >
                      <span>Read Full Case Study</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
