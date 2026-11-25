export const siteConfig = {
  name: "Sakthi B",
  shortName: "SAKTHI B",
  role: "Software Developer | Cloud Computing | AI & Full Stack Engineering",
  location: "Bengaluru, India",
  email: "sakthibalamurugan06@gmail.com",
  phone: "+91 6362163738",
  githubUrl: "https://github.com/b-Sakthi",
  githubHandle: "b-Sakthi",
  linkedinUrl: "https://www.linkedin.com/in/sakthi-b-5298aa356/",
  linkedinConfigured: true,
  /**
   * Canonical URL placeholder for static export metadata, sitemap, and robots.txt.
   * Override via NEXT_PUBLIC_SITE_URL in Cloudflare Pages environment variables.
   */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://sakthib.pages.dev",
  /**
   * Resume route (/resume/) provides a print-ready resume page.
   * You can also place a static PDF at public/Sakthi_B_Resume.pdf and update this path.
   */
  resumeUrl: "/resume/",
  /**
   * Cloudflare Worker base URL (e.g. https://sakthi-portfolio-contact-worker.your-subdomain.workers.dev
   * or http://127.0.0.1:8787 during local wrangler dev).
   */
  workerUrl: (
    process.env.NEXT_PUBLIC_WORKER_URL ||
    process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ||
    ""
  ).replace(/\/+$/, ""),
  contactFormEndpoint: (
    process.env.NEXT_PUBLIC_WORKER_URL ||
    process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ||
    ""
  ).replace(/\/+$/, ""),
} as const;

export interface SkillGroup {
  id: string;
  category: string;
  summary: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: "programming",
    category: "Programming",
    summary: "Core languages for backend services, web apps, and systems problem-solving.",
    items: ["Python", "JavaScript", "TypeScript", "Java", "C++"],
  },
  {
    id: "frontend",
    category: "Frontend",
    summary: "Accessible, responsive interfaces with modern React and Next.js architecture.",
    items: ["HTML5", "CSS3", "Tailwind CSS", "React", "Next.js"],
  },
  {
    id: "backend",
    category: "Backend & Databases",
    summary: "Async APIs, relational schemas, atomic concurrency, and real-time persistence.",
    items: [
      "FastAPI",
      "Node.js",
      "MongoDB",
      "PostgreSQL",
      "SQLAlchemy",
      "Alembic",
      "Supabase",
      "MySQL",
      "REST APIs",
    ],
  },
  {
    id: "cloud",
    category: "Cloud & DevOps",
    summary: "Containerized workloads, serverless cloud runtimes, IaC, and automated CI/CD.",
    items: [
      "Docker",
      "Docker Compose",
      "Kubernetes",
      "GitHub Actions",
      "CI/CD",
      "GCP Cloud Run",
      "Azure",
      "AWS",
      "Terraform",
      "Vercel",
    ],
  },
  {
    id: "ai-tools",
    category: "AI/ML & Tools",
    summary: "Computer vision pipelines, LLM orchestration, caching, and automated testing.",
    items: [
      "YOLO",
      "Ultralytics",
      "OpenCV",
      "Groq LLM APIs",
      "Pytest",
      "Git",
      "GitHub",
      "Linux",
      "Redis",
    ],
  },
];

export interface CredentialItem {
  index: string;
  type: "Education" | "Certification";
  title: string;
  institution: string;
  period: string;
  location: string;
  highlight: string;
  details: string;
}

export const educationAndCertifications: CredentialItem[] = [
  {
    index: "01",
    type: "Education",
    title: "B.Tech Computer Science and Engineering (Cloud Computing)",
    institution: "Alliance University",
    period: "2023 – 2027",
    location: "Bengaluru, India",
    highlight: "CGPA: 7.9 / 10",
    details:
      "Undergraduate specialization in cloud computing, distributed systems, full-stack software engineering, and applied AI.",
  },
  {
    index: "02",
    type: "Certification",
    title: "Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate",
    institution: "Oracle",
    period: "2026",
    location: "Cloud & AI",
    highlight: "Certified",
    details:
      "Foundational certification covering AI/ML concepts, generative AI workflows, and Oracle Cloud Infrastructure AI services.",
  },
  {
    index: "03",
    type: "Certification",
    title: "Microsoft Azure Fundamentals (AZ-900)",
    institution: "Microsoft",
    period: "June 2025",
    location: "Cloud Computing",
    highlight: "AZ-900",
    details:
      "Validated understanding of cloud architecture concepts, Azure core services, security, governance, and pricing models.",
  },
  {
    index: "04",
    type: "Certification",
    title: "Introduction to HTML5",
    institution: "Coursera",
    period: "August 2024",
    location: "Web Foundations",
    highlight: "Completed",
    details:
      "Semantic HTML5 document structure, accessibility fundamentals, and standards-compliant web markup.",
  },
];
