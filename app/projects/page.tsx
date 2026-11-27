import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProjectsSection } from "@/components/ProjectsSection";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Software Engineering Projects & System Architectures",
  description: `Explore production software engineering projects by ${siteConfig.name}, spanning Cloud Computing, WebAssembly, full stack web apps, and distributed backend architectures.`,
  alternates: {
    canonical: "/projects/",
  },
  openGraph: {
    title: `Software Engineering Projects | ${siteConfig.name}`,
    description: `Explore production software engineering projects by ${siteConfig.name}, spanning Cloud Computing, WebAssembly, full stack web apps, and distributed backend architectures.`,
    url: "/projects/",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `Software Engineering Projects | ${siteConfig.name}`,
    description: `Production software engineering projects by ${siteConfig.name} in Cloud Computing, Backend, and Full Stack Development.`,
    images: ["/og-image.png"],
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
