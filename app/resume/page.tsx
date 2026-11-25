import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PrintResumeButton } from "@/components/PrintResumeButton";
import { projects } from "@/lib/projects";
import {
  educationAndCertifications,
  siteConfig,
  skillGroups,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${siteConfig.name} — ${siteConfig.role}`,
  alternates: {
    canonical: "/resume/",
  },
};

export default function ResumePage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0B0B0B] py-10 text-[#F5F5F0]">
      <div className="portfolio-container max-w-4xl">
        <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-[#F5D90A]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Portfolio</span>
          </Link>
          <PrintResumeButton />
        </div>

        <article className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-10 print:border-0 print:bg-white print:p-0 print:text-black">
          <header className="border-b border-[#242424] pb-6 print:border-neutral-300">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {siteConfig.name}
            </h1>
            <p className="mt-1.5 text-base font-medium text-[#F5D90A] print:text-neutral-800">
              {siteConfig.role}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#A1A1AA] print:text-neutral-700">
              <span>{siteConfig.location}</span>
              <span>{siteConfig.email}</span>
              <span>{siteConfig.phone}</span>
              <span>{siteConfig.githubUrl}</span>
            </div>
          </header>

          <section className="mt-6 border-b border-[#242424] pb-6 print:border-neutral-300">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-[#F5D90A] print:text-black">
              Education
            </h2>
            <div className="mt-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">
                  {educationAndCertifications[0].title}
                </h3>
                <span className="font-mono-code text-xs text-[#A1A1AA] print:text-neutral-700">
                  {educationAndCertifications[0].period} ·{" "}
                  {educationAndCertifications[0].highlight}
                </span>
              </div>
              <p className="text-sm text-[#A1A1AA] print:text-neutral-700">
                {educationAndCertifications[0].institution},{" "}
                {educationAndCertifications[0].location}
              </p>
            </div>
          </section>

          <section className="mt-6 border-b border-[#242424] pb-6 print:border-neutral-300">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-[#F5D90A] print:text-black">
              Projects
            </h2>
            <div className="mt-4 space-y-5">
              {projects.map((project) => (
                <div key={project.slug}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold">
                      {project.name} — {project.tagline}
                    </h3>
                    <span className="font-mono-code text-xs text-[#A1A1AA] print:text-neutral-700">
                      {project.technologies.slice(0, 5).join(" · ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#A1A1AA] print:text-neutral-700">
                    {project.oneLineDescription}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 border-b border-[#242424] pb-6 print:border-neutral-300">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-[#F5D90A] print:text-black">
              Technical Skills
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              {skillGroups.map((group) => (
                <p key={group.id}>
                  <span className="font-semibold">{group.category}:</span>{" "}
                  <span className="text-[#A1A1AA] print:text-neutral-700">
                    {group.items.join(", ")}
                  </span>
                </p>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-[#F5D90A] print:text-black">
              Certifications
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {educationAndCertifications.slice(1).map((cert) => (
                <li key={cert.index} className="flex flex-wrap justify-between gap-2">
                  <span>
                    <strong className="font-semibold">{cert.title}</strong> —{" "}
                    <span className="text-[#A1A1AA] print:text-neutral-700">
                      {cert.institution}
                    </span>
                  </span>
                  <span className="font-mono-code text-xs text-[#A1A1AA] print:text-neutral-700">
                    {cert.period}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </main>
  );
}
