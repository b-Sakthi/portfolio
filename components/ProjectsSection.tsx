import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { GitHubIcon } from "@/components/BrandIcons";
import { ProjectVisual } from "@/components/ProjectVisual";
import { Reveal } from "@/components/Reveal";
import { StarMotif } from "@/components/StarMotif";
import { projects } from "@/lib/projects";

export function ProjectsSection() {
  return (
    <section
      id="projects"
      tabIndex={-1}
      className="section-spacing border-b border-[#242424]"
    >
      <div className="portfolio-container">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-meta font-medium text-[#F5D90A]">
                <StarMotif size={16} />
                <span>Selected Work</span>
              </div>
              <h2 className="text-section mt-4 text-[#F5F5F0]">
                Featured Projects
              </h2>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA] md:text-base">
              Four full-stack, cloud, and AI systems built with an emphasis on
              architecture, concurrency, security, and automated delivery.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:mt-16">
          {projects.map((project, idx) => (
            <Reveal key={project.slug} delay={idx * 0.06}>
              <article className="group flex h-full flex-col justify-between rounded-[16px] border border-[#242424] bg-[#141414] p-5 transition-colors hover:border-[#F5D90A]/55 sm:p-6">
                <div>
                  {/* Card Top Bar */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono-code text-meta text-[#F5D90A]">
                      {project.number} / {project.category}
                    </span>
                    {project.role && (
                      <span className="font-mono-code rounded border border-[#2A2A2A] bg-[#0B0B0B] px-2.5 py-0.5 text-[11px] text-[#F5F5F0]">
                        {project.role}
                      </span>
                    )}
                  </div>

                  {/* Visual Preview */}
                  <div className="transition-transform duration-300 group-hover:-translate-y-0.5">
                    <ProjectVisual slug={project.slug} title={project.name} />
                  </div>

                  {/* Title & Description */}
                  <div className="mt-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-project text-[#F5F5F0]">
                        {project.name}
                      </h3>
                      <span className="text-meta font-medium text-[#A1A1AA]">
                        {project.tagline}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA] md:text-base">
                      {project.oneLineDescription}
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <ul
                    aria-label={`${project.name} technology stack`}
                    className="mt-5 flex flex-wrap gap-2"
                  >
                    {project.technologies.map((tech) => (
                      <li
                        key={tech}
                        className="font-mono-code rounded-[6px] border border-[#242424] bg-[#0B0B0B] px-2.5 py-1 text-xs text-[#F5F5F0]"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#242424] pt-5">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} live demo`}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] bg-yellow-400 px-4 py-2.5 font-display text-sm font-bold text-black transition-colors hover:bg-[#FFE524]"
                    >
                      <span>Live Demo</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}

                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} GitHub repository`}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-white/20 bg-[#0B0B0B] px-4 py-2.5 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-yellow-400 hover:text-yellow-400"
                    >
                      <GitHubIcon className="h-4 w-4" />
                      <span>GitHub</span>
                    </a>
                  )}

                  <Link
                    href={`/projects/${project.slug}/`}
                    aria-label={`View case study for ${project.name}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-white/20 bg-[#0B0B0B] px-4 py-2.5 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-yellow-400 hover:text-[#F5F5F0] sm:ml-auto"
                  >
                    <span>Case Study</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
