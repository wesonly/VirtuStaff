import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile, writeFile } from "node:fs/promises";
import { useState } from "react";
import { PageLayout, FadeIn } from "~/components/shared";

// ─── Server functions ───────────────────────────────────────────────────────

const createCheckoutSession = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { plan: string } }) => {
    const { plan } = data;
    try {
      const response = await fetch("http://localhost:3001/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const result = await response.json();
      if (result.success && result.checkoutUrl) {
        return { ok: true, url: result.checkoutUrl };
      }
      return { ok: false, error: "Failed to create checkout session" };
    } catch {
      return { ok: false, error: "Checkout service unavailable" };
    }
  },
);

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "";
  } catch {
    return "";
  }
});

const submitWaitlist = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: { email: string } }) => {
    const { email } = data;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Invalid email address" };
    }
    try {
      // Write to Neon database
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(dbUrl);
        try {
          const existing = await sql`SELECT email FROM waitlist_signups WHERE email = ${email}`;
          if (existing && existing.length > 0) {
            return { ok: true, alreadyJoined: true };
          }
          await sql`INSERT INTO waitlist_signups (email, source) VALUES (${email}, 'website')`;
        } catch {
          // Fallback to JSON if DB fails
          const existing = JSON.parse(
            await readFile("waitlist.json", "utf8").catch(() => "[]"),
          ) as Array<{ email: string; timestamp: string }>;
          if (existing.some((e) => e.email === email)) {
            return { ok: true, alreadyJoined: true };
          }
          existing.push({ email, timestamp: new Date().toISOString() });
          await writeFile("waitlist.json", JSON.stringify(existing, null, 2));
        }
      } else {
        // Fallback to JSON file
        const existing = JSON.parse(
          await readFile("waitlist.json", "utf8").catch(() => "[]"),
        ) as Array<{ email: string; timestamp: string }>;
        if (existing.some((e) => e.email === email)) {
          return { ok: true, alreadyJoined: true };
        }
        existing.push({ email, timestamp: new Date().toISOString() });
        await writeFile("waitlist.json", JSON.stringify(existing, null, 2));
      }

      // Send confirmation email via backend API
      try {
        await fetch("http://localhost:3000/api/v1/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: "You're on the VirtuStaff waitlist!",
            body: `Hi there,\n\nThanks for joining the VirtuStaff waitlist!\n\nWe're building the future of AI-powered workforces for small and medium businesses. You'll be among the first to know when we launch.\n\nIn the meantime, here's what's coming:\n• AI employees that handle calls, emails, and lead qualification\n• 24/7 availability — no onboarding, no benefits, no management\n• Seamless integration with your CRM and business tools\n\nWe'll be in touch soon with early access details.\n\nBest,\nThe VirtuStaff Team`,
          }),
        });
      } catch {
        // Email sending is best-effort; don't block the signup
      }

      return { ok: true, alreadyJoined: false };
    } catch {
      return { ok: false, error: "Something went wrong. Please try again." };
    }
  },
);

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Home,
});

// ─── Components ──────────────────────────────────────────────────────────────

function Home() {
  const businessName = Route.useLoaderData();

  return (
    <PageLayout>
      <FadeIn><Hero /></FadeIn>
      <FadeIn delay={100}><StatsBar /></FadeIn>
      <FadeIn delay={100}><HowItWorks /></FadeIn>
      <FadeIn delay={100}><Features /></FadeIn>
      <FadeIn delay={100}><Testimonials /></FadeIn>
      <FadeIn delay={100}><Pricing /></FadeIn>
      <FadeIn delay={100}><WaitlistSection /></FadeIn>
      <FadeIn delay={100}><FAQ /></FadeIn>
      <FadeIn delay={100}><CTABanner /></FadeIn>
    </PageLayout>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 pt-24">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500/10 via-violet-500/10 to-transparent blur-3xl dark:from-indigo-500/20 dark:via-violet-500/20" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-t from-indigo-500/5 to-transparent blur-3xl dark:from-indigo-500/10" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          Your AI Workforce — launching soon
        </div>

        <h1 className="bg-gradient-to-r from-gray-900 via-indigo-600 to-violet-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl dark:from-white dark:via-indigo-400 dark:to-violet-400">
          Hire AI Employees.
          <br />
          Scale Your Business.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Replace the cost and hassle of hiring with specialized AI employees that
          handle calls, qualify leads, respond to emails, schedule appointments,
          and integrate with your tools — 24/7, for a fraction of a human salary.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl active:scale-[0.97]"
          >
            Get Early Access
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            See How It Works
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
            No onboarding. No benefits. No limits.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ──────────────────────────────────────────────────────────────

const stats = [
  { label: "Companies on Waitlist", value: "500+" },
  { label: "Coverage", value: "24/7" },
  { label: "Onboarding Time", value: "Zero" },
  { label: "Cost vs Human Hire", value: "90% Less" },
];

function StatsBar() {
  return (
    <section className="border-y border-gray-200 bg-gray-50/50 px-6 py-12 dark:border-gray-800 dark:bg-gray-900/30">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Choose Your AI Employee",
    description:
      "Pick from specialized AI employees trained for your industry — sales, support, marketing, or operations. Each one is ready to work from day one.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Connect Your Tools",
    description:
      "Integrate with your CRM, calendar, email, and phone system in minutes. Your AI employee syncs with everything you already use.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Go 24/7",
    description:
      "Your AI employee works around the clock — handling calls at midnight, replying to emails on weekends, capturing leads while you sleep.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Get started in minutes, not weeks
          </p>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            No job postings. No interviews. No onboarding. Just pick your AI
            employee and turn them on.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-indigo-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
            >
              <span className="absolute -top-3 right-6 text-7xl font-black text-gray-100 dark:text-gray-800/50">
                {step.number}
              </span>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md">
                {step.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────

const features = [
  {
    title: "Call Handling",
    description:
      "Your AI employee answers and routes calls, handles inquiries, and takes messages — with natural conversation and zero hold time.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    title: "Lead Qualification",
    description:
      "AI employees engage website visitors, qualify leads in real time, and pass only the best opportunities to your team.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Email & SMS",
    description:
      "Send, receive, and respond to emails and text messages automatically. Draft replies, follow up with prospects, and never miss a message.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: "Appointment Scheduling",
    description:
      "AI employees manage your calendar, book appointments, send reminders, and reschedule — no back-and-forth required.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: "CRM Integration",
    description:
      "Seamlessly sync with Salesforce, HubSpot, and other CRMs. Your AI employee logs every interaction and keeps your pipeline updated.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: "Marketing Content",
    description:
      "Generate social media posts, email campaigns, blog drafts, and ad copy — all on-brand and ready to publish.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    title: "Reports & Analytics",
    description:
      "Get daily, weekly, and monthly reports on calls handled, leads captured, tasks completed, and ROI — all delivered automatically.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

function Features() {
  return (
    <section id="features" className="relative px-6 py-24 sm:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
            Everything You Need
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            One AI workforce, endless capabilities
          </p>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            From first contact to final report, your AI employees handle the
            entire workflow — so your human team can focus on what matters.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-gray-200 bg-white p-7 transition-all hover:border-indigo-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-indigo-600 group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white dark:text-indigo-400 dark:group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: "VirtuStaff has been a game-changer for our salon. We never miss a booking call anymore, and our AI employee handles appointment scheduling while we focus on clients.",
    name: "Maria Gonzalez",
    role: "Owner",
    company: "Bliss Beauty Salon",
  },
  {
    quote: "The lead qualification alone is worth it. Our AI employee screens every inbound inquiry and only passes us the serious buyers. We've seen a 40% increase in qualified leads.",
    name: "James Chen",
    role: "Broker",
    company: "Pacific Realty Group",
  },
  {
    quote: "We're a small e-commerce team, and VirtuStaff handles our customer emails and social media content. It's like having three extra employees for a fraction of the cost.",
    name: "Sarah Mitchell",
    role: "Founder",
    company: "Modern Home Goods",
  },
  {
    quote: "Setup took less than an hour. Connected our CRM, calendar, and phone — and our AI employee was working. No training, no onboarding, just instant productivity.",
    name: "David Park",
    role: "Operations Director",
    company: "ClearView Dental",
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Loved by businesses like yours
          </p>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            See what early adopters are saying about their AI workforce.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-indigo-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
            >
              {/* Quote icon */}
              <svg
                className="mb-4 h-8 w-8 text-indigo-200 dark:text-indigo-800"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3.3 0-6 2.7-6 6v6h6v-6H8c0-1.1.9-2 2-2V8zm12 0c-3.3 0-6 2.7-6 6v6h6v-6h-2c0-1.1.9-2 2-2V8z" />
              </svg>

              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Starter",
    price: "$99",
    description: "Perfect for solopreneurs and small teams getting started.",
    employees: "2 AI employees",
    features: [
      "Core capabilities (calls, email, SMS)",
      "Basic CRM integration",
      "Email support",
      "Monthly reports",
    ],
    cta: "Start 7-Day Free Trial",
    planKey: "starter",
    featured: false,
  },
  {
    name: "Growth",
    price: "$299",
    description: "For growing businesses ready to scale their workforce.",
    employees: "5 AI employees",
    features: [
      "Everything in Starter",
      "Advanced integrations",
      "Appointment scheduling",
      "Marketing content generation",
      "Priority support",
    ],
    cta: "Start 7-Day Free Trial",
    planKey: "growth",
    featured: true,
  },
  {
    name: "Scale",
    price: "$999",
    description: "For teams that need unlimited AI capacity and customization.",
    employees: "Unlimited AI employees",
    features: [
      "Everything in Growth",
      "Unlimited AI employees",
      "Custom workflows",
      "Dedicated account manager",
      "API access",
      "White-label options",
    ],
    cta: "Start 7-Day Free Trial",
    planKey: "scale",
    featured: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
            Pricing
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Pay per AI employee, not per seat
          </p>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            No hidden fees. No long-term contracts. Cancel anytime.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.featured
                  ? "border-indigo-500 bg-gradient-to-b from-indigo-50 to-white shadow-xl dark:from-indigo-950/30 dark:to-gray-950 dark:shadow-indigo-900/20"
                  : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="ml-1 text-sm text-gray-500">/month</span>
                <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {plan.employees}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  const result = await createCheckoutSession({ data: { plan: plan.planKey } });
                  if (result.ok && result.url) {
                    window.location.href = result.url;
                  }
                }}
                className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all active:scale-[0.97] ${
                  plan.featured
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </a>
              <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
                7-day free trial, then {plan.price}/month
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Waitlist ────────────────────────────────────────────────────────────────

function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "duplicate" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const result = await submitWaitlist({ data: { email: email.trim() } });
      if (result.ok) {
        setStatus(result.alreadyJoined ? "duplicate" : "success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <section id="waitlist" className="relative px-6 py-24 sm:py-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-violet-500/[0.03]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-500/10 via-violet-500/10 to-transparent blur-3xl dark:from-indigo-500/20 dark:via-violet-500/20" />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          Ready to build your AI workforce?
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Join the waitlist for early access and be among the first to deploy
          your AI employees. Limited beta spots available.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-md flex-col gap-4 sm:flex-row"
        >
          <div className="flex-1">
            <label htmlFor="email-input" className="sr-only">
              Email address
            </label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={status === "submitting"}
              className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl active:scale-[0.97] disabled:opacity-60"
          >
            {status === "submitting" ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Joining…
              </>
            ) : (
              "Join Waitlist"
            )}
          </button>
        </form>

        {status === "success" && (
          <p className="mt-4 text-sm font-medium text-green-600 dark:text-green-400">
            You're on the list! We'll be in touch soon.
          </p>
        )}
        {status === "duplicate" && (
          <p className="mt-4 text-sm font-medium text-amber-600 dark:text-amber-400">
            You're already on the waitlist — we'll keep you posted!
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        )}

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          No spam, ever. We'll only email you about your early access.
        </p>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────��───────────────────────────────────────────────────

const faqItems = [
  {
    question: "How does VirtuStaff work?",
    answer:
      "VirtuStaff provides AI employees that you can deploy in minutes. Choose the AI employee you need, connect your existing tools (CRM, calendar, phone, email), and your AI employee starts working immediately — handling calls, qualifying leads, managing communications, and more.",
  },
  {
    question: "How is this different from chatbots or auto-attendants?",
    answer:
      "Unlike simple chatbots that follow rigid scripts, VirtuStaff's AI employees have natural conversations, understand context, and take meaningful action. They can qualify leads, schedule appointments, draft emails, generate reports, and integrate with your business tools — not just answer FAQs.",
  },
  {
    question: "What tools and platforms do you integrate with?",
    answer:
      "VirtuStaff integrates with major CRMs (Salesforce, HubSpot), calendar apps (Google Calendar, Outlook), email providers, phone systems, and marketing platforms. We're continuously adding new integrations, and our API allows custom connections for any tool.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Our plans start at $99/month for 2 AI employees (Starter), $299/month for 5 AI employees (Growth), and $999/month for unlimited AI employees (Scale). All plans include core capabilities. There are no setup fees, no long-term contracts, and you can cancel anytime.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We implement industry-standard encryption, access controls, and security practices. Your data is encrypted at rest and in transit, and we never share or sell your information. We also offer SOC 2 compliance for enterprise customers.",
  },
  {
    question: "Can I customize my AI employee's behavior?",
    answer:
      "Yes. You can set custom scripts, define workflows, specify response guidelines, and train your AI employee on your business processes. Scale plan customers get access to custom workflows and white-label options for complete control.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.02] to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
            FAQ
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Frequently asked questions
          </p>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about VirtuStaff.
          </p>
        </div>

        <div className="mt-16 space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white transition-all hover:border-indigo-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
            >
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="pr-8 text-base font-semibold text-gray-900 dark:text-white">
                  {item.question}
                </span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="border-t border-gray-100 px-6 pb-5 pt-4 text-sm leading-relaxed text-gray-600 dark:border-gray-800 dark:text-gray-400">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ──────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-violet-600/5" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-500/10 via-violet-500/10 to-transparent blur-3xl dark:from-indigo-500/20 dark:via-violet-500/20" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          Ready to build your AI workforce?
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Join hundreds of businesses already on the waitlist. Deploy your first AI employee in minutes.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/#waitlist"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl active:scale-[0.97]"
          >
            Join the Waitlist
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}