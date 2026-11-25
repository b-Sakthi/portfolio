import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProjectsSection } from "@/components/ProjectsSection";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Projects",
  description: `Featured software engineering, cloud, and AI projects by ${siteConfig.name}.`,
  alternates: {
    canonical: "/projects/",
  },
};

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <ProjectsSection />
      </main>
      <Footer />
    </>
  );
}
