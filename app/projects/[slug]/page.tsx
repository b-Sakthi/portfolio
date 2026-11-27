import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { GitHubIcon } from "@/components/BrandIcons";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProjectVisual } from "@/components/ProjectVisual";
import { getProjectBySlug, projects } from "@/lib/projects";
import { getProjectJsonLd } from "@/lib/jsonld";
import { siteConfig } from "@/lib/site-config";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  const title = `${project.name} Case Study | ${project.tagline}`;
  const description = `${project.oneLineDescription} Built using ${project.technologies.slice(0, 5).join(", ")}.`;

  return {
    title,
    description,
    keywords: [
      project.name,
      ...project.technologies,
      "Software Engineering Case Study",
      "Software Developer",
      "Cloud Computing",
      "Backend Developer",
    ],
    alternates: {
      canonical: `/projects/${project.slug}/`,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `/projects/${project.slug}/`,
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${project.name} Architecture & Case Study`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const projectJsonLd = getProjectJsonLd(project);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd),
        }}
      />
      <Navbar />
      <main id="main-content" className="pb-20">
        {/* Case Study Hero */}
        <section className="border-b border-[#242424] pt-10 pb-14 md:pt-16 md:pb-20">
          <div className="portfolio-container">
            <Link
              href="/projects/"
              prefetch={false}
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-[#F5D90A]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Projects</span>
            </Link>

            <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono-code rounded-full bg-[#F5D90A] px-3.5 py-1 text-xs font-bold text-[#0B0B0B]">
                    Case Study {project.number}
                  </span>
                  <span className="font-mono-code text-meta text-[#A1A1AA]">
                    {project.category}
                  </span>
                  {project.role && (
                    <span className="font-mono-code rounded border border-[#2A2A2A] bg-[#141414] px-3 py-1 text-xs text-[#F5F5F0]">
                      Role: {project.role}
                    </span>
                  )}
                </div>

                <h1 className="text-hero mt-5 text-[#F5F5F0]">{project.name}</h1>
                <p className="text-subhead mt-3 text-[#F5D90A]">
                  {project.tagline}
                </p>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#A1A1AA] md:text-lg">
                  {project.oneLineDescription}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} live demo`}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] bg-[#F5D90A] px-5 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
                    >
                      <span>Live Demo</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} GitHub repository`}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-5 py-3 font-display text-sm font-semibold text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                    >
                      <GitHubIcon className="h-4 w-4" />
                      <span>View GitHub Repository</span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4">
                <ProjectVisual slug={project.slug} title={project.name} />
              </div>
            </div>
          </div>
        </section>

        {/* Case Study Body */}
        <div className="portfolio-container mt-14 space-y-14 md:mt-20 md:space-y-20">
          {/* 1. Overview & Why I Chose This Project */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8 lg:col-span-7">
              <div className="text-meta font-medium text-[#F5D90A]">
                <span>01 · Project Overview</span>
              </div>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                What {project.name} Does
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#A1A1AA]">
                {project.overview}
              </p>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8 lg:col-span-5">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                02 · Motivation
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                Why I Chose This Project
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#A1A1AA]">
                {project.whyIChoseThis}
              </p>
            </div>
          </section>

          {/* 2. Real-World Problem, Problem Statement, Objectives, Proposed Solution */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6 rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
              <div>
                <span className="font-mono-code text-meta text-[#F5D90A]">
                  03 · Real-World Problem
                </span>
                <p className="mt-3 text-base leading-relaxed text-[#A1A1AA]">
                  {project.realWorldProblem}
                </p>
              </div>

              <div className="border-t border-[#242424] pt-6">
                <span className="font-mono-code text-meta text-[#F5D90A]">
                  04 · Problem Statement
                </span>
                <p className="mt-3 text-base leading-relaxed text-[#F5F5F0]">
                  {project.problemStatement}
                </p>
              </div>

              <div className="border-t border-[#242424] pt-6">
                <span className="font-mono-code text-meta text-[#F5D90A]">
                  06 · Proposed Solution
                </span>
                <p className="mt-3 text-base leading-relaxed text-[#A1A1AA]">
                  {project.proposedSolution}
                </p>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                05 · Project Objectives
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                Core Engineering Goals
              </h2>
              <ul className="mt-5 space-y-3.5">
                {project.objectives.map((objective) => (
                  <li
                    key={objective}
                    className="flex items-start gap-3 text-sm leading-relaxed text-[#A1A1AA] sm:text-base"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#F5D90A]"
                      aria-hidden="true"
                    />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 3. System Architecture Diagram */}
          <section>
            <ArchitectureDiagram
              projectName={project.name}
              summary={project.architectureSummary}
              nodes={project.architectureNodes}
              flows={project.architectureFlows}
            />
          </section>

          {/* 4. Technology Stack & My Contributions */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8 lg:col-span-5">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                08 · Technology Stack
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                Tools &amp; Frameworks
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {project.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="font-mono-code rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-3.5 py-2 text-xs font-medium text-[#F5F5F0]"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8 lg:col-span-7">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                09 · Implementation &amp; Contributions
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                What I Built
              </h2>
              <ul className="mt-5 space-y-3">
                {project.contributions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-[#A1A1AA] sm:text-base"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5D90A]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 5. Important Features & Development Workflow */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                10 · Important Features
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                Key Capabilities
              </h2>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {project.importantFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-[10px] border border-[#242424] bg-[#0B0B0B] px-3.5 py-3 text-sm text-[#F5F5F0]"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                11 · Development Workflow
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                Engineering &amp; Delivery Process
              </h2>
              <ol className="mt-5 space-y-3.5">
                {project.developmentWorkflow.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 text-sm leading-relaxed text-[#A1A1AA] sm:text-base"
                  >
                    <span className="font-mono-code text-xs font-bold text-[#F5D90A]">
                      0{index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* 6. Technical Challenges & How I Solved Them */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                12 · Technical Challenges
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                Hard Problems Encountered
              </h2>
              <ul className="mt-5 space-y-3.5">
                {project.technicalChallenges.map((challenge) => (
                  <li
                    key={challenge}
                    className="rounded-[10px] border border-[#242424] bg-[#0B0B0B] p-4 text-sm leading-relaxed text-[#A1A1AA]"
                  >
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                13 · Solutions
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                How I Solved Those Challenges
              </h2>
              <ul className="mt-5 space-y-3.5">
                {project.howISolvedChallenges.map((solution) => (
                  <li
                    key={solution}
                    className="rounded-[10px] border border-[#2A2A2A] bg-[#0B0B0B] p-4 text-sm leading-relaxed text-[#F5F5F0]"
                  >
                    {solution}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 7. Screenshots / Visuals, Results & Limitations, & What I Learned */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                14 · Results &amp; Implemented Scope
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                What Is Implemented
              </h2>
              <ul className="mt-5 space-y-3.5">
                {project.resultsAndLimitations.implemented.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-relaxed text-[#A1A1AA] sm:text-base"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#F5D90A]"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                15 · Limitations &amp; Current Boundaries
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                Known Constraints
              </h2>
              <ul className="mt-5 space-y-3.5">
                {project.resultsAndLimitations.limitations.map((item) => (
                  <li
                    key={item}
                    className="rounded-[10px] border border-[#242424] bg-[#0B0B0B] p-4 text-sm leading-relaxed text-[#A1A1AA]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8 lg:col-span-6">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                16 · System Visuals &amp; Architecture
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                System Visual Preview
              </h2>
              <div className="mt-5">
                <ProjectVisual slug={project.slug} title={project.name} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[#A1A1AA]">
                {project.screenshotNote}
              </p>
            </div>

            <div className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8 lg:col-span-6">
              <span className="font-mono-code text-meta text-[#F5D90A]">
                17 · What I Learned
              </span>
              <h2 className="text-subhead mt-3 text-[#F5F5F0]">
                Engineering Takeaways
              </h2>
              <ul className="mt-5 space-y-3.5">
                {project.whatILearned.map((lesson) => (
                  <li
                    key={lesson}
                    className="flex items-start gap-3 text-sm leading-relaxed text-[#A1A1AA] sm:text-base"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#F5D90A]"
                      aria-hidden="true"
                    />
                    <span>{lesson}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 8. Next Case Study Navigation */}
          <section className="flex flex-col items-start justify-between gap-6 rounded-[20px] border border-[#242424] bg-[#141414] p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <span className="font-mono-code text-meta text-[#F5D90A]">
                Next Case Study
              </span>
              <h2 className="text-project mt-2 text-[#F5F5F0]">
                {nextProject.name} — {nextProject.tagline}
              </h2>
            </div>

            <Link
              href={`/projects/${nextProject.slug}/`}
              prefetch={false}
              className="inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-[8px] bg-[#F5D90A] px-5 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
            >
              <span>Read Next</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
