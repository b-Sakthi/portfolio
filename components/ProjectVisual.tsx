import type { ProjectSlug } from "@/lib/projects";

interface ProjectVisualProps {
  slug: ProjectSlug;
  title: string;
}

/**
 * Bespoke, zero-CLS architectural visual previews for each project.
 * Maintains a strict 16:10 aspect ratio and crisp vector rendering.
 */
export function ProjectVisual({ slug, title }: ProjectVisualProps) {
  return (
    <div
      className="editorial-grid-bg relative aspect-[16/10] w-full overflow-hidden rounded-[12px] border border-[#242424] bg-[#0B0B0B]"
      role="img"
      aria-label={`${title} technical system preview`}
    >
      {slug === "retailiq" && (
        <div className="flex h-full flex-col justify-between p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-code rounded bg-[#F5D90A] px-2 py-0.5 text-[11px] font-semibold text-[#0B0B0B]">
              YOLO11n + ByteTrack
            </span>
            <span className="font-mono-code text-[11px] text-[#A1A1AA]">
              170 Pytest · Async PG
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="relative col-span-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] p-3">
              <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                <span className="font-mono-code">FRAME STREAM</span>
                <span className="font-mono-code text-[#F5D90A]">TRACKING</span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div className="rounded border border-dashed border-[#F5D90A]/70 bg-[#F5D90A]/5 p-2">
                  <span className="font-mono-code block text-[10px] text-[#F5D90A]">
                    ID #14 · DWELL
                  </span>
                  <span className="mt-1 block h-1.5 w-3/4 rounded-full bg-[#F5D90A]/40" />
                </div>
                <div className="rounded border border-[#2A2A2A] bg-[#0B0B0B] p-2">
                  <span className="font-mono-code block text-[10px] text-[#F5F5F0]">
                    SHELF STOCK
                  </span>
                  <span className="mt-1 block h-1.5 w-2/3 rounded-full bg-[#A1A1AA]/40" />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[8px] border border-[#2A2A2A] bg-[#141414] p-3">
              <span className="font-mono-code text-[10px] text-[#A1A1AA]">
                HYBRID RAG
              </span>
              <div className="space-y-1.5">
                <div className="rounded bg-[#0B0B0B] px-2 py-1 font-mono-code text-[10px] text-[#F5F5F0]">
                  Vector + BM25
                </div>
                <div className="rounded bg-[#0B0B0B] px-2 py-1 font-mono-code text-[10px] text-[#F5D90A]">
                  Groq Guarded
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#242424] pt-2.5 font-mono-code text-[11px] text-[#A1A1AA]">
            <span>FastAPI · Next.js · Redis</span>
            <span>Docker Compose</span>
          </div>
        </div>
      )}

      {slug === "cintic" && (
        <div className="flex h-full flex-col justify-between p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-code rounded bg-[#F5D90A] px-2 py-0.5 text-[11px] font-semibold text-[#0B0B0B]">
              Vision IQ Engine
            </span>
            <span className="font-mono-code text-[11px] text-[#A1A1AA]">
              Atomic MongoDB
            </span>
          </div>

          <div className="rounded-[8px] border border-[#2A2A2A] bg-[#141414] p-3">
            <div className="mx-auto mb-2.5 h-1 w-2/3 rounded-full bg-[#383838]" />
            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: 24 }).map((_, idx) => {
                const isRecommended = idx === 11 || idx === 12;
                const isTaken = idx === 2 || idx === 3 || idx === 19;
                return (
                  <span
                    key={idx}
                    className={`h-3.5 rounded-[3px] ${
                      isRecommended
                        ? "bg-[#F5D90A]"
                        : isTaken
                          ? "bg-[#2C2C2C]"
                          : "border border-[#2A2A2A] bg-[#0B0B0B]"
                    }`}
                  />
                );
              })}
            </div>
            <div className="mt-2.5 flex items-center justify-between font-mono-code text-[10px] text-[#A1A1AA]">
              <span>Geometric Scoring</span>
              <span className="text-[#F5D90A]">Anti-Stranding Active</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#242424] pt-2.5 font-mono-code text-[11px] text-[#A1A1AA]">
            <span>Node.js · JWT · RBAC</span>
            <span>Dynamic Pricing</span>
          </div>
        </div>
      )}

      {slug === "linlearn" && (
        <div className="flex h-full flex-col justify-between p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-code rounded bg-[#F5D90A] px-2 py-0.5 text-[11px] font-semibold text-[#0B0B0B]">
              WASM VM STATE: BOOTED
            </span>
            <span className="font-mono-code text-[11px] text-[#A1A1AA]">
              v86 x86 · IndexedDB
            </span>
          </div>

          <div className="rounded-[8px] border border-[#2A2A2A] bg-[#141414] p-3 font-mono-code text-[11px]">
            <div className="flex items-center justify-between gap-2 text-[#A1A1AA]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#F5D90A]" />
                <span>ttyS0 · incident-sim</span>
              </div>
              <span className="text-[10px] text-[#F5D90A]">ACTIVE</span>
            </div>
            <p className="mt-2 text-[#F5F5F0]">
              root@linlearn:~$ nginx -t &amp;&amp; systemctl status docker
            </p>
            <p className="mt-1 text-[#A1A1AA]">
              → AI Tutor · Incident Labs · Adaptive Mastery
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-[#242424] pt-2.5 font-mono-code text-[11px] text-[#A1A1AA]">
            <span>Next.js · WebAssembly</span>
            <span>Supabase · Groq AI</span>
          </div>
        </div>
      )}

      {slug === "smart-water-hydro" && (
        <div className="flex h-full flex-col justify-between p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-code rounded bg-[#F5D90A] px-2 py-0.5 text-[11px] font-semibold text-[#0B0B0B]">
              GCP Cloud Run
            </span>
            <span className="font-mono-code text-[11px] text-[#A1A1AA]">
              Supabase Real-Time
            </span>
          </div>

          <div className="rounded-[8px] border border-[#2A2A2A] bg-[#141414] p-3">
            <svg
              viewBox="0 0 280 72"
              className="h-16 w-full"
              aria-hidden="true"
            >
              <path
                d="M0 54 L40 46 L80 50 L120 26 L160 34 L200 18 L240 28 L280 14"
                fill="none"
                stroke="#F5D90A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="120" cy="26" r="3.5" fill="#F5D90A" />
              <circle cx="200" cy="18" r="3.5" fill="#F5D90A" />
              <circle cx="280" cy="14" r="3.5" fill="#F5D90A" />
            </svg>
            <div className="mt-1 flex items-center justify-between font-mono-code text-[10px] text-[#A1A1AA]">
              <span>Live Sensor Telemetry</span>
              <span className="text-[#F5F5F0]">Docker REST API</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#242424] pt-2.5 font-mono-code text-[11px] text-[#A1A1AA]">
            <span>Python · JavaScript</span>
            <span>Automated CI/CD</span>
          </div>
        </div>
      )}
    </div>
  );
}
