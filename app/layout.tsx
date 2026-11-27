import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { MotionProvider } from "@/components/MotionProvider";
import { getPersonAndWebSiteJsonLd } from "@/lib/jsonld";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} | Software Developer · Cloud Computing & Full Stack Systems`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Portfolio of Sakthi B — Software Developer specializing in Cloud Computing, Backend & Full Stack Development, and distributed systems in Bengaluru. Discover production projects, technical skills, and case studies.",
  keywords: [
    "Sakthi B",
    "Software Developer",
    "Backend Developer",
    "Cloud Computing",
    "Full Stack Development",
    "Java Developer",
    "Software Engineering Projects",
    "DevOps",
    "CI/CD",
    "Docker",
    "Kubernetes",
    "FastAPI",
    "Next.js",
    "TypeScript",
    "Python",
    "LinLearn",
    "RetailIQ",
    "Bengaluru",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.githubUrl }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: `${siteConfig.name} Portfolio`,
    title: `${siteConfig.name} | Software Developer · Cloud Computing & Full Stack Systems`,
    description:
      "Software Developer specializing in Cloud Computing, Backend & Full Stack Development, and distributed systems. Explore featured software engineering projects.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Software Developer Portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Software Developer · Cloud Computing & Full Stack Systems`,
    description:
      "Software Developer specializing in Cloud Computing, Backend & Full Stack Development, and distributed systems. Explore featured software engineering projects.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google233abb650f794463",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { person, webSite } = getPersonAndWebSiteJsonLd();

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(person),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSite),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#0B0B0B] text-[#F5F5F0] antialiased selection:bg-[#F5D90A] selection:text-[#0B0B0B]">
        <a href="#main-content" className="skip-link visually-hidden">
          Skip to main content
        </a>
        <MotionProvider>
          <AnalyticsTracker />
          {children}
          <FloatingActionButton />
        </MotionProvider>
      </body>
    </html>
  );
}
