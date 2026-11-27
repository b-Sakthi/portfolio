import type { Metadata } from "next";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact | Software Developer & Cloud Engineer",
  description: `Contact ${siteConfig.name} in ${siteConfig.location} for Software Developer, Backend Developer, Cloud Computing, and Full Stack engineering opportunities.`,
  alternates: {
    canonical: "/contact/",
  },
  openGraph: {
    title: `Contact | ${siteConfig.name}`,
    description: `Contact ${siteConfig.name} in ${siteConfig.location} for Software Developer, Backend Developer, Cloud Computing, and Full Stack engineering opportunities.`,
    url: "/contact/",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact ${siteConfig.name} | Software Developer`,
    description: `Get in touch with ${siteConfig.name} for software engineering, cloud, and backend roles.`,
    images: ["/og-image.png"],
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
