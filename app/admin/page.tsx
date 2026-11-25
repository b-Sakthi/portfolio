import type { Metadata } from "next";
import { AdminInbox } from "@/components/AdminInbox";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Admin Inbox",
  description: "Private admin inbox for managing portfolio contact messages.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[75vh] py-10 md:py-14">
        <div className="portfolio-container">
          <AdminInbox />
        </div>
      </main>
      <Footer />
    </>
  );
}
