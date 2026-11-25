import { Reveal } from "@/components/Reveal";
import { StarMotif } from "@/components/StarMotif";
import { educationAndCertifications } from "@/lib/site-config";

export function ExperienceSection() {
  return (
    <section
      id="experience"
      tabIndex={-1}
      className="section-spacing border-b border-[#242424]"
    >
      <div className="portfolio-container">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2.5 text-meta font-medium text-[#F5D90A]">
                <StarMotif size={16} />
                <span>Credentials</span>
              </div>
              <h2 className="text-section mt-4 text-[#F5F5F0]">
                Education &amp; Certifications
              </h2>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-[#A1A1AA] md:text-base">
              Undergraduate specialization in Cloud Computing paired with
              industry certifications across Oracle AI, Microsoft Azure, and web foundations.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 divide-y divide-[#242424] rounded-[16px] border border-[#242424] bg-[#141414] lg:mt-16">
          {educationAndCertifications.map((item, idx) => (
            <Reveal key={item.index} delay={idx * 0.05}>
              <article className="grid grid-cols-1 gap-4 p-6 transition-colors hover:bg-[#191919] md:grid-cols-12 md:items-center md:gap-6 md:p-8">
                <div className="flex items-center gap-4 md:col-span-2">
                  <span className="font-mono-code text-lg font-medium text-[#F5D90A]">
                    {item.index}
                  </span>
                  <span className="rounded-full border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-1 text-xs font-medium text-[#A1A1AA]">
                    {item.type}
                  </span>
                </div>

                <div className="md:col-span-6">
                  <h3 className="text-subhead text-[#F5F5F0]">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-[#A1A1AA]">
                    {item.institution} · {item.location}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
                    {item.details}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-4 md:justify-end">
                  <span className="font-mono-code text-sm text-[#A1A1AA]">
                    {item.period}
                  </span>
                  <span className="rounded-[8px] bg-[#F5D90A] px-3.5 py-1.5 font-display text-xs font-bold text-[#0B0B0B]">
                    {item.highlight}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
