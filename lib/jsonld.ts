import { siteConfig } from "./site-config";
import type { ProjectCaseStudy } from "./projects";

export function getPersonAndWebSiteJsonLd() {
  const baseUrl = siteConfig.siteUrl.replace(/\/$/, "");

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: siteConfig.name,
    jobTitle: "Software Developer",
    description:
      "Software Developer specializing in Cloud Computing, Backend Development, Java, Python, and Full Stack Systems.",
    url: `${baseUrl}/`,
    image: `${baseUrl}/og-image.png`,
    sameAs: [
      siteConfig.githubUrl,
      siteConfig.linkedinUrl,
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressCountry: "IN",
    },
    knowsAbout: [
      "Cloud Computing",
      "Software Engineering",
      "Backend Development",
      "Full Stack Development",
      "Java",
      "Python",
      "Docker",
      "Kubernetes",
      "FastAPI",
      "Next.js",
      "TypeScript",
      "CI/CD",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Alliance University",
    },
  };

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: `${baseUrl}/`,
    name: `${siteConfig.name} — Software Developer Portfolio`,
    description:
      "Personal developer portfolio of Sakthi B, showcasing software engineering projects, backend architectures, cloud systems, and technical skills.",
    publisher: {
      "@id": `${baseUrl}/#person`,
    },
    inLanguage: "en-IN",
  };

  return { person, webSite };
}

export function getProjectJsonLd(project: ProjectCaseStudy) {
  const baseUrl = siteConfig.siteUrl.replace(/\/$/, "");
  const projectUrl = `${baseUrl}/projects/${project.slug}/`;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${projectUrl}#software`,
    name: project.name,
    headline: project.tagline,
    description: project.oneLineDescription,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Cross-platform, Web, Cloud",
    url: projectUrl,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: `${baseUrl}/`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    ...(project.github ? { codeRepository: project.github } : {}),
    ...(project.live ? { installUrl: project.live } : {}),
    keywords: project.technologies.join(", "),
  };
}
