import { Reveal } from "@/components/Reveal";
import { skillGroups } from "@/lib/site-config";

export function SkillsSection() {
  return (
    <section
      id="skills"
      tabIndex={-1}
      className="section-spacing border-b border-[#242424]"
    >
      <div className="portfolio-container">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-meta font-medium text-[#F5D90A]">
                <span>Technical Stack</span>
              </div>
              <h2 className="text-section mt-4 text-[#F5F5F0]">
                Skills &amp; Tooling
              </h2>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA] md:text-base">
              Grouped by layer—from systems languages and frontend frameworks to
              cloud infrastructure, databases, and applied computer vision.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-16">
          {skillGroups.map((group, idx) => (
            <Reveal
              key={group.id}
              delay={idx * 0.05}
              className={idx === skillGroups.length - 1 ? "md:col-span-2" : ""}
            >
              <article className="h-full rounded-[16px] border border-[#242424] bg-[#141414] p-6 transition-colors hover:border-[#383838]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-subhead text-[#F5F5F0]">
                    {group.category}
                  </h3>
                  <span className="font-mono-code text-xs text-[#F5D90A]">
                    {group.items.length} technologies
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#A1A1AA]">{group.summary}</p>

                <ul
                  aria-label={`${group.category} skills`}
                  className="mt-5 flex flex-wrap gap-2.5"
                >
                  {group.items.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-3.5 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A]/60"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
