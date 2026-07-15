import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, Logo } from "~/components/shared";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const team = [
  { name: "Alex Chen", role: "CEO & Co-Founder", initials: "AC" },
  { name: "Sarah Mitchell", role: "CTO & Co-Founder", initials: "SM" },
  { name: "Jordan Patel", role: "Head of AI", initials: "JP" },
  { name: "Maya Rodriguez", role: "Head of Product", initials: "MR" },
  { name: "David Kim", role: "Head of Engineering", initials: "DK" },
  { name: "Emily Watson", role: "Head of Design", initials: "EW" },
];

function AboutPage() {
  return (
    <PageLayout>
      {/* Hero section */}
      <section className="relative isolate overflow-hidden px-6 pt-32 pb-24 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-500/10 via-violet-500/10 to-transparent blur-3xl dark:from-indigo-500/20 dark:via-violet-500/20" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            We're building the future of work — for every business
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            VirtuStaff was founded on a simple belief: every small and medium-sized business
            deserves access to the same AI-powered capabilities that Fortune 500 companies
            take for granted. We're making that vision a reality.
          </p>
        </div>
      </section>

      {/* Mission section */}
      <section className="border-y border-gray-200 bg-gray-50 px-6 py-24 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Our Mission
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-400">
            <p>
              Small businesses are the backbone of the economy, yet they've been left behind
              by the AI revolution. While large enterprises deploy sophisticated AI systems
              with dedicated engineering teams, the local contractor, the independent clinic,
              and the growing e-commerce store are stuck with outdated tools and processes.
            </p>
            <p>
              We founded VirtuStaff to change that. Our platform packages cutting-edge AI
              into ready-to-deploy employees that any business can use — no technical expertise
              required, no months of setup, no million-dollar budgets.
            </p>
            <p>
              We believe that AI shouldn't replace human potential — it should amplify it.
              By handling the repetitive, time-consuming tasks that bog down businesses,
              VirtuStaff frees human teams to focus on creativity, relationships, and growth.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Our Values
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Accessibility First",
                description: "Powerful AI shouldn't require an engineering degree. We design for the business owner, not the developer.",
              },
              {
                title: "Radical Reliability",
                description: "Your business runs 24/7, and so should your AI workforce. We build for uptime, consistency, and trust.",
              },
              {
                title: "Human-Centered",
                description: "AI should amplify human potential, not replace it. Our technology is designed to free people up to do their best work.",
              },
            ].map((value) => (
              <div key={value.title} className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                  <Logo />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{value.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-gray-200 bg-gray-50 px-6 py-24 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Meet the Team
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base text-gray-600 dark:text-gray-400">
            A passionate group of engineers, designers, and entrepreneurs building the future of work.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white">
                  {member.initials}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Ready to join us?
          </h2>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
            Be among the first to deploy your AI employees. Join our waitlist for early access.
          </p>
          <a
            href="/#waitlist"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl active:scale-[0.97]"
          >
            Get Early Access
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </PageLayout>
  );
}