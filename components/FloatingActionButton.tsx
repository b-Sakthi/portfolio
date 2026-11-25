"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Mail, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site-config";

export function FloatingActionButton() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Show "Back to top" after scrolling down 300px
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setOpen(false);
  };

  return (
    <aside
      aria-label="Quick actions"
      className="fixed right-5 bottom-6 z-40 flex flex-col items-end gap-3 pointer-events-auto"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            key="fab-menu"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 12 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col items-end gap-2.5 mb-1"
          >
            {/* Quick Contact Form Link */}
            {pathname !== "/contact/" && pathname !== "/contact" && (
              <Link
                href="/contact/"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-2.5 rounded-full border border-[#2A2A2A] bg-[#141414]/95 px-4 py-2 text-xs font-semibold text-[#F5F5F0] shadow-xl backdrop-blur-md transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
              >
                <span>Send a Message</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B0B0B] text-[#F5D90A]">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            )}

            {/* Direct Email Link */}
            <a
              href={`mailto:${siteConfig.email}`}
              onClick={() => setOpen(false)}
              className="group flex items-center gap-2.5 rounded-full border border-[#2A2A2A] bg-[#141414]/95 px-4 py-2 text-xs font-semibold text-[#F5F5F0] shadow-xl backdrop-blur-md transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
            >
              <span>Email Sakthi</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B0B0B] text-[#F5D90A]">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </a>

            {/* Scroll to Top */}
            {showScrollTop && (
              <button
                type="button"
                onClick={scrollToTop}
                className="group flex items-center gap-2.5 rounded-full border border-[#2A2A2A] bg-[#141414]/95 px-4 py-2 text-xs font-semibold text-[#F5F5F0] shadow-xl backdrop-blur-md transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
              >
                <span>Scroll to Top</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B0B0B] text-[#F5D90A]">
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? "Close quick actions menu" : "Open quick actions menu"}
        className="group relative flex h-13 w-13 items-center justify-center rounded-full border border-[#F5D90A]/30 bg-[#141414] text-[#F5D90A] shadow-2xl transition-all duration-200 hover:scale-105 hover:border-[#F5D90A] hover:bg-[#F5D90A] hover:text-[#0B0B0B] focus-visible:outline-2 focus-visible:outline-[#F5D90A] active:scale-95"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#F5D90A]/10 animate-ping pointer-events-none"
          style={{ animationDuration: "3s" }}
        />
        {open ? (
          <X className="h-5 w-5 transition-transform duration-200" aria-hidden="true" />
        ) : (
          <MessageSquare className="h-5 w-5 transition-transform duration-200" aria-hidden="true" />
        )}
      </button>
    </aside>
  );
}
