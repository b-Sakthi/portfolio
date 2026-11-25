import { Reveal } from "@/components/Reveal";
import { StarMotif } from "@/components/StarMotif";

const aboutPillars = [
  {
    index: "01",
    title: "Academic Foundation",
    body: "Pursuing a B.Tech in Computer Science and Engineering (Cloud Computing) at Alliance University, Bengaluru (graduating 2027, CGPA 7.9/10), with hands-on focus on cloud-native architecture and distributed backends.",
  },
  {
    index: "02",
    title: "Full-Stack & Cloud",
    body: "Building end-to-end systems with Next.js, TypeScript, FastAPI, and Node.js—paired with PostgreSQL, MongoDB, Redis, Docker Compose, GCP Cloud Run, and automated CI/CD pipelines.",
  },
  {
    index: "03",
    title: "AI & Computer Vision",
    body: "Applying YOLO11n, ByteTrack, OpenCV, hybrid RAG (vector search + BM25), and Groq LLM APIs to real problems—backed by rate limiting, Row-Level Security, and automated test suites.",
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      tabIndex={-1}
      className="section-spacing border-b border-[#242424]"
    >
      <div className="portfolio-container">
        <Reveal>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2.5 text-meta font-medium text-[#F5D90A]">
                <StarMotif size={16} />
                <span>About Me</span>
              </div>
              <h2 className="text-section mt-4 text-[#F5F5F0]">
                From Idea To Production Systems.
              </h2>
            </div>

            <div className="space-y-5 text-[#A1A1AA] lg:col-span-7">
              <p className="text-base leading-relaxed md:text-lg">
                I&apos;m a Computer Science and Engineering undergraduate specializing in{" "}
                <span className="text-[#F5F5F0]">Cloud Computing</span> at Alliance
                University, Bengaluru (2023–2027, CGPA 7.9/10). My focus is building
                software that holds up beyond prototypes—combining clean frontend
                interfaces with reliable APIs, databases, and cloud infrastructure.
              </p>
              <p className="text-base leading-relaxed md:text-lg">
                Across my projects, I work across the stack: designing async FastAPI
                and Node.js services, modeling relational and document data in PostgreSQL,
                Supabase, and MongoDB, containerizing workloads with Docker, and
                shipping automated deployments through GitHub Actions and GCP Cloud Run.
              </p>
              <p className="text-base leading-relaxed md:text-lg">
                I&apos;m equally drawn to applied AI and computer vision—whether
                building YOLO11n and ByteTrack analytics pipelines, hybrid RAG assistants
                with prompt-injection guardrails, or quota-protected LLM learning tools.
                My engineering approach prioritizes clarity, atomic correctness, and
                automated verification.
              </p>
            </div>
          </div>
        </Reveal>

        {/* 3-Card Bento Row */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mt-16">
          {aboutPillars.map((item, idx) => (
            <Reveal key={item.index} delay={idx * 0.06}>
              <article className="flex h-full flex-col justify-between rounded-[16px] border border-[#242424] bg-[#141414] p-6 transition-colors hover:border-[#383838]">
                <div>
                  <span className="font-mono-code text-meta text-[#F5D90A]">
                    {item.index}
                  </span>
                  <h3 className="text-subhead mt-3 text-[#F5F5F0]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                    {item.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
