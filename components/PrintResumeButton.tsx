"use client";

import { Printer } from "lucide-react";

export function PrintResumeButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] bg-[#F5D90A] px-5 py-2.5 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      <span>Print / Save as PDF</span>
    </button>
  );
}
