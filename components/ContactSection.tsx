"use client";

import { Check, Copy, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { GitHubIcon, LinkedInIcon } from "@/components/BrandIcons";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/site-config";
import { submitContactForm } from "@/lib/worker-api";

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

type SubmitPhase = "idle" | "submitting" | "success" | "error";

export function ContactSection() {
  const formHeadingId = useId();
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const companyId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [touched, setTouched] = useState<{
    name: boolean;
    email: boolean;
    message: boolean;
  }>({
    name: false,
    email: false,
    message: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Synchronous ref guard prevents race conditions on rapid double-clicks
  const submittingRef = useRef(false);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!name.trim() || name.trim().length < 2) {
      next.name = "Please enter your name (at least 2 characters).";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!message.trim() || message.trim().length < 10) {
      next.message = "Please include a short message (at least 10 characters).";
    }
    return next;
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const nextErrors = validate();
    setErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    setTouched({ name: true, email: true, message: true });
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitPhase("error");
      setStatusMessage("Please fix the highlighted fields before submitting.");
      return;
    }

    if (!siteConfig.workerUrl) {
      setSubmitPhase("error");
      setStatusMessage(
        "Contact API endpoint is not configured yet (NEXT_PUBLIC_WORKER_URL). Please use the direct contact details on the left."
      );
      return;
    }

    submittingRef.current = true;
    setSubmitPhase("submitting");
    setStatusMessage("Sending your message...");

    try {
      await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        company: company.trim() || undefined,
      });

      // Only show confirmed success & clear fields after Worker confirms D1 persistence
      setSubmitPhase("success");
      setStatusMessage(
        "Message received and saved. Thank you for reaching out!"
      );
      setName("");
      setEmail("");
      setMessage("");
      setCompany("");
      setTouched({ name: false, email: false, message: false });
      setErrors({});
    } catch (err) {
      // Preserve entered fields on failure
      setSubmitPhase("error");
      setStatusMessage(
        err instanceof Error
          ? err.message
          : "Unable to send your message right now. Your draft has been preserved—please try again."
      );
    } finally {
      submittingRef.current = false;
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      setCopiedEmail(false);
    }
  };

  const isSubmitting = submitPhase === "submitting";

  return (
    <section id="contact" tabIndex={-1} className="section-spacing">
      <div className="portfolio-container">
        <Reveal>
          <div className="text-meta font-medium text-[#F5D90A]">
            <span>Get In Touch</span>
          </div>
          <h1 className="text-section mt-4 max-w-4xl text-[#F5F5F0]">
            HAVE A PROJECT IN MIND?{" "}
            <span className="text-[#F5D90A]">LET&apos;S BUILD SOMETHING.</span>
          </h1>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:mt-16">
          {/* Direct Contact Details */}
          <Reveal className="lg:col-span-5">
            <div className="flex h-full flex-col justify-between rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-subhead text-[#F5F5F0]">Direct Contact</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
                    Open to software engineering internships, full-stack projects,
                    cloud architecture work, and applied AI collaborations.
                  </p>
                </div>

                <ul className="space-y-4">
                  <li>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[#242424] bg-[#0B0B0B] p-4">
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="inline-flex min-h-[44px] items-center gap-3 text-sm font-medium text-[#F5F5F0] transition-colors hover:text-[#F5D90A]"
                      >
                        <Mail
                          className="h-4 w-4 shrink-0 text-[#F5D90A]"
                          aria-hidden="true"
                        />
                        <span className="break-all">{siteConfig.email}</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        aria-label="Copy email address"
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[6px] border border-[#242424] bg-[#141414] px-3 py-1.5 text-xs font-medium text-[#A1A1AA] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                      >
                        {copiedEmail ? (
                          <>
                            <Check
                              className="h-3.5 w-3.5 text-[#F5D90A]"
                              aria-hidden="true"
                            />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </li>

                  <li>
                    <a
                      href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                      className="flex min-h-[56px] items-center gap-3 rounded-[12px] border border-[#242424] bg-[#0B0B0B] p-4 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                    >
                      <Phone
                        className="h-4 w-4 shrink-0 text-[#F5D90A]"
                        aria-hidden="true"
                      />
                      <span>{siteConfig.phone}</span>
                    </a>
                  </li>

                  <li>
                    <a
                      href={siteConfig.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[56px] items-center gap-3 rounded-[12px] border border-[#242424] bg-[#0B0B0B] p-4 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                    >
                      <GitHubIcon className="h-4 w-4 shrink-0 text-[#F5D90A]" />
                      <span>github.com/{siteConfig.githubHandle}</span>
                    </a>
                  </li>

                  <li>
                    <a
                      href={siteConfig.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[56px] items-center gap-3 rounded-[12px] border border-[#242424] bg-[#0B0B0B] p-4 text-sm font-medium text-[#F5F5F0] transition-colors hover:border-[#F5D90A] hover:text-[#F5D90A]"
                    >
                      <LinkedInIcon className="h-4 w-4 shrink-0 text-[#F5D90A]" />
                      <span>LinkedIn</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-[#242424] pt-5 text-sm text-[#A1A1AA]">
                <MapPin className="h-4 w-4 text-[#F5D90A]" aria-hidden="true" />
                <span>{siteConfig.location}</span>
              </div>
            </div>
          </Reveal>

          {/* Accessible Contact Form UI */}
          <Reveal delay={0.08} className="lg:col-span-7">
            <form
              aria-labelledby={formHeadingId}
              onSubmit={handleSubmit}
              noValidate
              className="rounded-[16px] border border-[#242424] bg-[#141414] p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id={formHeadingId} className="text-subhead text-[#F5F5F0]">
                  Send a Message
                </h3>
                <span className="font-mono-code rounded bg-[#0B0B0B] px-2.5 py-1 text-xs text-[#A1A1AA]">
                  {siteConfig.workerUrl
                    ? "Cloudflare Worker · D1"
                    : "Worker URL Not Configured"}
                </span>
              </div>

              {/* Honeypot field hidden from assistive tech */}
              <div className="visually-hidden" aria-hidden="true">
                <label htmlFor={companyId}>Company</label>
                <input
                  id={companyId}
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor={nameId}
                    className="mb-2 block text-sm font-medium text-[#F5F5F0]"
                  >
                    Your Name{" "}
                    <span aria-hidden="true" className="text-[#F5D90A]">
                      *
                    </span>
                  </label>
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    disabled={isSubmitting}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    onBlur={() => handleBlur("name")}
                    aria-invalid={touched.name && Boolean(errors.name)}
                    aria-describedby={errors.name ? `${nameId}-error` : undefined}
                    placeholder="e.g. Ananya Rao"
                    className="min-h-[48px] w-full rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-base text-[#F5F5F0] placeholder:text-[#71717A] transition-colors focus:border-[#F5D90A] disabled:opacity-60"
                  />
                  {touched.name && errors.name && (
                    <p
                      id={`${nameId}-error`}
                      className="mt-1.5 text-xs text-[#F5D90A]"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={emailId}
                    className="mb-2 block text-sm font-medium text-[#F5F5F0]"
                  >
                    Email Address{" "}
                    <span aria-hidden="true" className="text-[#F5D90A]">
                      *
                    </span>
                  </label>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={touched.email && Boolean(errors.email)}
                    aria-describedby={errors.email ? `${emailId}-error` : undefined}
                    placeholder="you@company.com"
                    className="min-h-[48px] w-full rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-base text-[#F5F5F0] placeholder:text-[#71717A] transition-colors focus:border-[#F5D90A] disabled:opacity-60"
                  />
                  {touched.email && errors.email && (
                    <p
                      id={`${emailId}-error`}
                      className="mt-1.5 text-xs text-[#F5D90A]"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={messageId}
                    className="mb-2 block text-sm font-medium text-[#F5F5F0]"
                  >
                    Project or Inquiry Details{" "}
                    <span aria-hidden="true" className="text-[#F5D90A]">
                      *
                    </span>
                  </label>
                  <textarea
                    id={messageId}
                    name="message"
                    rows={4}
                    required
                    disabled={isSubmitting}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) {
                        setErrors((prev) => ({ ...prev, message: undefined }));
                      }
                    }}
                    onBlur={() => handleBlur("message")}
                    aria-invalid={touched.message && Boolean(errors.message)}
                    aria-describedby={
                      errors.message ? `${messageId}-error` : undefined
                    }
                    placeholder="Tell me about the role, system, or timeline you have in mind..."
                    className="min-h-[120px] w-full resize-y rounded-[8px] border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-3 text-base text-[#F5F5F0] placeholder:text-[#71717A] transition-colors focus:border-[#F5D90A] disabled:opacity-60"
                  />
                  {touched.message && errors.message && (
                    <p
                      id={`${messageId}-error`}
                      className="mt-1.5 text-xs text-[#F5D90A]"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>
              </div>

              <div
                aria-live={submitPhase === "error" ? "assertive" : "polite"}
                role={submitPhase === "error" ? "alert" : "status"}
                className="mt-5 min-h-[20px]"
              >
                {statusMessage && (
                  <p
                    className={`rounded-[8px] border p-3.5 text-xs leading-relaxed ${
                      submitPhase === "success"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : submitPhase === "error"
                          ? "border-red-500/40 bg-red-500/10 text-red-200"
                          : "border-[#2A2A2A] bg-[#0B0B0B] text-[#F5F5F0]"
                    }`}
                  >
                    {statusMessage}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-[8px] bg-[#F5D90A] px-6 py-3 font-display text-sm font-bold text-[#0B0B0B] transition-colors hover:bg-[#FFE524] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden="true" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
