import type { ProjectSlug } from "@/lib/projects";

interface ProjectVisualProps {
  slug: ProjectSlug;
  title: string;
}

/**
 * Bespoke, zero-CLS architectural visual previews for each project.
 * Uses pure HTML/SVG + CSS transitions (no extra client JS) and respects prefers-reduced-motion.
 */
export function ProjectVisual({ slug, title }: ProjectVisualProps) {
  const usesRealImage = slug === "linlearn" || slug === "cintic";
  return (
    <div
      className="editorial-grid-bg relative min-h-[216px] w-full overflow-hidden rounded-[12px] border border-[#242424] bg-[#0B0B0B] transition-colors duration-300 group-hover:border-[#F5D90A]/45"
      style={{ contentVisibility: "auto", containIntrinsicSize: "216px" }}
      role={usesRealImage ? undefined : "img"}
      aria-label={usesRealImage ? undefined : `${title} technical system preview`}
    >
      {slug === "linlearn" && (
        <div className="flex h-full flex-col justify-between">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0E091A]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/projects/linlearn-preview.jpg"
              alt="LinLearn dashboard showing the sidebar with XP and learning progress, Ubuntu terminal in provisioning state, Simulation Mode indicator, mission panel, and BKT cognitive mastery profile"
              width={1024}
              height={499}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#242424] bg-[#0B0B0B] px-3.5 py-2 font-mono-code text-[11px] text-[#A1A1AA]">
            <span className="text-[#F5D90A]">
              Simulation Mode · Provisioning State
            </span>
            <span>Terminal · Missions · BKT Mastery</span>
          </div>
        </div>
      )}

      {slug === "retailiq" && (
        <div className="flex h-full flex-col justify-between gap-2.5 p-3.5 sm:p-4">
          {/* Top Pipeline Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-code rounded bg-[#F5D90A] px-2 py-0.5 text-[11px] font-semibold text-[#0B0B0B]">
              YOLO11n + ByteTrack
            </span>
            <span className="font-mono-code text-[11px] text-[#A1A1AA]">
              170 Pytest · Async PG
            </span>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-[8px] border border-[#2A2A2A] bg-[#141414] p-2.5 transition-colors duration-300 group-hover:border-[#F5D90A]/35 sm:col-span-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-mono-code text-[#A1A1AA]">
                  CAMERA TRACKING FEED
                </span>
                <span className="font-mono-code inline-flex items-center gap-1 text-[#F5D90A]">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[#F5D90A]"
                  />
                  ACTIVE
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded border border-dashed border-[#F5D90A]/75 bg-[#F5D90A]/5 p-2">
                  <span className="font-mono-code block text-[10px] text-[#F5D90A]">
                    ID #14 · DWELL
                  </span>
                  <span className="mt-1.5 block h-1.5 w-3/4 rounded-full bg-[#F5D90A]/45 transition-all duration-300 group-hover:w-5/6" />
                </div>
                <div className="rounded border border-dashed border-[#383838] bg-[#0B0B0B] p-2">
                  <span className="font-mono-code block text-[10px] text-[#F5F5F0]">
                    ID #27 · AISLE
                  </span>
                  <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-[#A1A1AA]/40 transition-all duration-300 group-hover:w-3/4" />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between rounded bg-[#0B0B0B] px-2 py-1 font-mono-code text-[10px]">
                <span className="text-[#A1A1AA]">SHELF STOCK</span>
                <span className="text-[#F5F5F0]">MONITORED</span>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-1.5 rounded-[8px] border border-[#2A2A2A] bg-[#141414] p-2.5">
              <span className="font-mono-code text-[10px] text-[#A1A1AA]">
                ANALYTICS &amp; RAG
              </span>
              <div className="space-y-1.5 font-mono-code text-[10px]">
                <div className="rounded bg-[#0B0B0B] px-2 py-1 text-[#F5F5F0]">
                  Footfall · Dwell
                </div>
                <div className="rounded bg-[#0B0B0B] px-2 py-1 text-[#F5F5F0]">
                  Vector + BM25
                </div>
                <div className="rounded bg-[#0B0B0B] px-2 py-1 text-[#F5D90A]">
                  Groq Guarded
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-[#242424] pt-2 font-mono-code text-[11px] text-[#A1A1AA]">
            <span>Next.js · FastAPI · Redis</span>
            <span>Docker Compose · CI/CD</span>
          </div>
        </div>
      )}

      {slug === "cintic" && (
        <div className="flex h-full flex-col justify-between">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0B0B0B]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/projects/cintic-preview.png"
              alt="CinTic cinema seat-selection interface showing the screen, Gold (₹150) and Silver (₹200) seat categories"
              width={1000}
              height={480}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#242424] bg-[#0B0B0B] px-3.5 py-2 font-mono-code text-[11px] text-[#A1A1AA]">
            <span className="text-[#F5D90A]">CinTic · Gold ₹150 / Silver ₹200</span>
            <span>Atomic Reservations · Live UI</span>
          </div>
        </div>
      )}

      {slug === "smart-water-hydro" && (
        <div className="flex h-full flex-col justify-between gap-2.5 p-3.5 sm:p-4">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono-code rounded bg-[#F5D90A] px-2 py-0.5 text-[11px] font-semibold text-[#0B0B0B]">
              GCP Cloud Run
            </span>
            <span className="font-mono-code text-[11px] text-[#A1A1AA]">
              Demo Data · Supabase Sync
            </span>
          </div>

          {/* IoT Dashboard Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
            {/* Tank, Quality & Source Indicators */}
            <div className="flex flex-col justify-between gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] p-2.5 sm:col-span-6">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 font-mono-code text-[10px]">
                <span className="text-[#A1A1AA]">TANK LEVEL (DEMO)</span>
                <span className="text-emerald-300">Quality: Normal</span>
              </div>

              {/* Tank Level Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#0B0B0B]">
                <div className="h-full w-3/4 rounded-full bg-[#F5D90A]" />
              </div>

              {/* TDS & pH Indicators */}
              <div className="grid grid-cols-2 gap-1.5 font-mono-code text-[10px]">
                <div className="rounded bg-[#0B0B0B] px-2 py-1">
                  <span className="block text-[9px] text-[#A1A1AA]">TDS</span>
                  <span className="text-[#F5F5F0]">Demo Monitor</span>
                </div>
                <div className="rounded bg-[#0B0B0B] px-2 py-1">
                  <span className="block text-[9px] text-[#A1A1AA]">pH</span>
                  <span className="text-[#F5F5F0]">Balanced</span>
                </div>
              </div>

              {/* Source Indicators */}
              <div className="flex flex-wrap gap-1.5 font-mono-code text-[9px]">
                <span className="rounded border border-[#2A2A2A] bg-[#0B0B0B] px-2 py-0.5 text-[#F5F5F0]">
                  RO Reject Water
                </span>
                <span className="rounded border border-[#F5D90A]/40 bg-[#F5D90A]/10 px-2 py-0.5 text-[#F5D90A]">
                  Rainwater
                </span>
              </div>
            </div>

            {/* Water Consumption Chart */}
            <div className="flex flex-col justify-between rounded-[8px] border border-[#2A2A2A] bg-[#141414] p-2.5 transition-colors duration-300 group-hover:border-[#F5D90A]/35 sm:col-span-6">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 font-mono-code text-[10px]">
                <span className="text-[#A1A1AA]">CONSUMPTION</span>
                <span className="text-[#F5D90A]">DEMO SERIES</span>
              </div>

              <svg
                viewBox="0 0 220 64"
                className="my-1 h-14 w-full"
                aria-hidden="true"
              >
                <line
                  x1="0"
                  y1="56"
                  x2="220"
                  y2="56"
                  stroke="#242424"
                  strokeWidth="1"
                />
                <path
                  d="M4 48 L38 40 L72 44 L106 24 L140 30 L174 16 L212 20"
                  fill="none"
                  stroke="#F5D90A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="106" cy="24" r="3" fill="#F5D90A" />
                <circle cx="174" cy="16" r="3" fill="#F5D90A" />
                <circle cx="212" cy="20" r="3" fill="#F5D90A" />
              </svg>

              <div className="flex items-center justify-between font-mono-code text-[9px] text-[#A1A1AA]">
                <span>Illustrative Trend</span>
                <span className="text-[#F5F5F0]">REST API</span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-[#242424] pt-2 font-mono-code text-[11px] text-[#A1A1AA]">
            <span>Python · Docker</span>
            <span>Automated CI/CD</span>
          </div>
        </div>
      )}
    </div>
  );
}
