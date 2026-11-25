import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="portfolio-container flex min-h-[60vh] flex-col items-start justify-center py-20"
      >
        <span className="font-mono-code text-sm text-[#F5D90A]">404</span>
        <h1 className="text-section mt-3 text-[#F5F5F0]">Page Not Found</h1>
        <p className="mt-4 max-w-md text-base text-[#A1A1AA]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[48px] items-center rounded-[8px] bg-[#F5D90A] px-6 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524]"
        >
          Return Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
