import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SkillsSection } from "@/components/SkillsSection";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Technical Skills",
  description: `Programming languages, frontend, backend, cloud/DevOps, and AI/ML tools used by ${siteConfig.name}.`,
  alternates: {
    canonical: "/skills/",
  },
  openGraph: {
    title: `Technical Skills | ${siteConfig.name}`,
    description: `Programming languages, frontend, backend, cloud/DevOps, and AI/ML tools used by ${siteConfig.name}.`,
    url: "/skills/",
  },
};

export default function SkillsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <SkillsSection />
      </main>
      <Footer />
    </>
  );
}
