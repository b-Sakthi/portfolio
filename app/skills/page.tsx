import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SkillsSection } from "@/components/SkillsSection";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Technical Skills | Java, Python, Backend, Cloud & Full Stack",
  description: `Technical competencies of ${siteConfig.name}: Java, Python, TypeScript, Full Stack Development, Cloud Computing (Docker, Kubernetes, Azure, AWS), and Backend Databases.`,
  alternates: {
    canonical: "/skills/",
  },
  openGraph: {
    title: `Technical Skills | ${siteConfig.name}`,
    description: `Technical competencies of ${siteConfig.name}: Java, Python, TypeScript, Full Stack Development, Cloud Computing, and Backend Databases.`,
    url: "/skills/",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `Technical Skills | ${siteConfig.name}`,
    description: `Core technical skills in Java, Python, Cloud Computing, and Full Stack Development by ${siteConfig.name}.`,
    images: ["/og-image.png"],
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
