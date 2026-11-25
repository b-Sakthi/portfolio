"use client";

import { motion } from "framer-motion";
import { Download, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site-config";

const navItems = [
  { id: "home", label: "Home", href: "/#home" },
  { id: "about", label: "About", href: "/#about" },
  { id: "projects", label: "Projects", href: "/#projects" },
  { id: "skills", label: "Skills", href: "/#skills" },
  { id: "experience", label: "Experience", href: "/#experience" },
  { id: "contact", label: "Contact", href: "/#contact" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isProjectPage = pathname?.startsWith("/projects");

  const [activeSection, setActiveSection] = useState<string>("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;

    const sectionIds = navItems.map((item) => item.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const currentId = isProjectPage ? "projects" : isHome ? activeSection : "";

  return (
    <header className="sticky top-0 z-50 border-b border-[#242424] bg-[#0B0B0B]/92 backdrop-blur-md">
      <div className="portfolio-container flex h-20 items-center justify-between gap-4">
        <Link
          href="/#home"
          className="font-display inline-flex min-h-[44px] items-center gap-2.5 text-lg font-bold tracking-tight text-[#F5F5F0] transition-colors hover:text-[#F5D90A]"
        >
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full bg-[#F5D90A]"
          />
          <span>{siteConfig.shortName}</span>
        </Link>

        {/* Desktop Primary Navigation */}
        <nav aria-label="Primary" className="primary-nav hidden items-center gap-1 lg:flex">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentId === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
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
            className="hidden min-h-[44px] items-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A] sm:inline-flex"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Resume</span>
          </Link>

          <button
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
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav-menu"
          aria-label="Mobile"
          className="border-t border-[#242424] bg-[#0B0B0B] lg:hidden"
        >
          <div className="portfolio-container py-5">
            <ul className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = currentId === item.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "true" : undefined}
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
                  </li>
                );
              })}
              <li className="pt-2">
                <Link
                  href={siteConfig.resumeUrl}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2A] bg-[#141414] px-4 py-2.5 text-base font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Resume</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
