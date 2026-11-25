"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Download, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site-config";

const navItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/about/" },
  { id: "projects", label: "Projects", href: "/projects/" },
  { id: "skills", label: "Skills", href: "/skills/" },
  { id: "experience", label: "Experience", href: "/experience/" },
  { id: "contact", label: "Contact", href: "/contact/" },
] as const;

export function Navbar() {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const currentId =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/projects")
        ? "projects"
        : pathname.startsWith("/about")
          ? "about"
          : pathname.startsWith("/skills")
            ? "skills"
            : pathname.startsWith("/experience")
              ? "experience"
              : pathname.startsWith("/contact")
                ? "contact"
                : "";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#242424] bg-[#0B0B0B]/92 backdrop-blur-md">
        <div className="portfolio-container flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-menu"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-[#2A2A2A] bg-[#141414] text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A] lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <Link
              href="/"
              prefetch={false}
              className="font-display inline-flex min-h-[44px] items-center gap-2.5 text-lg font-bold tracking-tight text-[#F5F5F0] transition-colors hover:text-[#F5D90A]"
            >
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full bg-[#F5D90A]"
              />
              <span>{siteConfig.shortName}</span>
            </Link>
          </div>

          {/* Desktop Primary Navigation */}
          <nav aria-label="Primary" className="primary-nav hidden items-center gap-1 lg:flex">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentId === item.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative inline-flex min-h-[40px] items-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-[#0B0B0B] font-semibold"
                          : "text-[#A1A1AA] hover:text-[#F5F5F0]"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="active-nav-pill"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className="absolute inset-0 -z-10 rounded-full bg-[#F5D90A]"
                        />
                      )}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={siteConfig.resumeUrl}
              prefetch={false}
              className="hidden min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A] sm:inline-flex"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Resume</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Left Slide-In Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            />

            <motion.nav
              key="mobile-nav-drawer"
              id="mobile-nav-menu"
              aria-label="Mobile"
              initial={shouldReduceMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 360, damping: 36 }
              }
              className="fixed inset-y-0 left-0 z-50 flex w-[min(82vw,320px)] flex-col border-r border-[#242424] bg-[#0B0B0B] shadow-2xl lg:hidden"
            >
              <div className="flex h-20 items-center justify-between border-b border-[#242424] px-5">
                <Link
                  href="/"
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className="font-display inline-flex min-h-[44px] items-center gap-2.5 text-lg font-bold tracking-tight text-[#F5F5F0]"
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full bg-[#F5D90A]"
                  />
                  <span>{siteConfig.shortName}</span>
                </Link>

                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => {
                    setMobileOpen(false);
                    menuButtonRef.current?.focus();
                  }}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-[#2A2A2A] bg-[#141414] text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5">
                <ul className="flex flex-col gap-1.5">
                  {navItems.map((item, idx) => {
                    const isActive = currentId === item.id;
                    return (
                      <motion.li
                        key={item.id}
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, x: -12 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : {
                                duration: 0.22,
                                delay: 0.05 + idx * 0.03,
                                ease: "easeOut",
                              }
                        }
                      >
                        <Link
                          href={item.href}
                          prefetch={false}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setMobileOpen(false)}
                          className={`flex min-h-[48px] items-center justify-between rounded-[8px] px-4 py-2.5 text-base font-medium transition-colors ${
                            isActive
                              ? "bg-[#F5D90A] font-semibold text-[#0B0B0B]"
                              : "text-[#F5F5F0] hover:bg-[#141414]"
                          }`}
                        >
                          <span>{item.label}</span>
                          {isActive && (
                            <span className="font-mono-code text-xs uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t border-[#242424] p-4">
                <Link
                  href={siteConfig.resumeUrl}
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2.5 text-base font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Resume</span>
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
