import { Reveal } from "@/components/Reveal";

export function AboutSection() {
  return (
    <section
      id="about"
      tabIndex={-1}
      className="section-spacing border-b border-[#242424]"
    >
      <div className="portfolio-container">
        <Reveal>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <div className="text-meta font-medium text-[#F5D90A]">
                <span>About Me</span>
              </div>
              <h2 className="text-section mt-4 text-[#F5F5F0]">
                From Idea To Production Systems.
              </h2>
            </div>

            <div className="space-y-4 text-[#A1A1AA] lg:col-span-7">
              <p className="text-base leading-relaxed md:text-lg">
                I&apos;m a Computer Science undergraduate specializing in{" "}
                <span className="text-[#F5F5F0]">Cloud Computing</span> at
                Alliance University, Bengaluru (2023–2027).
              </p>
              <p className="text-base leading-relaxed md:text-lg">
                I build full-stack applications, cloud systems, and AI-powered
                tools using modern technologies, with a focus on turning ideas
                into{" "}
                <span className="text-[#F5F5F0]">
                  reliable, production-ready software
                </span>
                .
              </p>
              <p className="text-base leading-relaxed md:text-lg">
                My interests include full-stack engineering, cloud and DevOps
                workflows, computer vision, and applied AI systems.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
