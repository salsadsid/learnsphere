import Link from "next/link";
import type { CSSProperties } from "react";
import { GlassCard, PageShell, Pill, SectionHeading } from "@/shared/ui";

const quickStats = [
  { label: "Active cohorts", value: "14", trend: "+2" },
  { label: "Learners online", value: "2.4k", trend: "+18%" },
  { label: "Completion rate", value: "86%", trend: "+9%" },
];

export default function Home() {
  return (
    <PageShell maxWidth="max-w-7xl" className="gap-16">
      <section className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <Pill label="Contest-grade edutech" tone="accent" />
          <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-6xl font-[var(--font-display)]">
            Build learning journeys that feel like a product launch.
          </h1>
          <p className="text-lg leading-7 text-slate-600">
            LearnSphere combines cinematic course experiences with precision progress
            tracking. Learners stay engaged, instructors ship faster, and admins get
            clarity at scale.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="h-12 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Explore courses
            </Link>
            <Link
              href="/dashboard"
              className="h-12 rounded-full border border-slate-900/15 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900/30"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <GlassCard className="space-y-5 rise-in" style={{ "--delay": "0.1s" } as CSSProperties}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Command center
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Momentum Lab
              </h3>
              <p className="text-sm text-slate-500">Live cohort streaming now</p>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              4x
            </span>
          </div>
          <div className="grid gap-4">
            {quickStats.map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 rise-in"
                style={{ "--delay": `${0.1 + index * 0.08}s` } as CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    {stat.label}
                  </p>
                  <span className="text-xs text-emerald-600">{stat.trend}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section id="experience" className="grid gap-8">
        <SectionHeading
          eyebrow="The LearnSphere experience"
          title="Every touchpoint looks and feels premium"
          description="A tech-forward UX system that adapts to students, instructors, and admins."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Adaptive course paths",
              body: "Personalized next steps based on pace, quiz results, and activity.",
            },
            {
              title: "Studio-grade lessons",
              body: "Video, PDFs, links, and quizzes delivered in a single immersive player.",
            },
            {
              title: "Momentum analytics",
              body: "Live dashboards that highlight friction before learners drop off.",
            },
          ].map((item, index) => (
            <GlassCard
              key={item.title}
              className="h-full rise-in"
              style={{ "--delay": `${index * 0.1}s` } as CSSProperties}
            >
              <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <GlassCard className="space-y-6">
          <SectionHeading
            eyebrow="Live learning cadence"
            title="Turn progress into a daily signal"
            description="Keep teams aligned with auto-generated highlights and next-step prompts."
          />
          <div className="grid gap-3">
            {[
              "Daily momentum summary for learners",
              "Instructor highlights with watch-time deltas",
              "Quiz mastery signals that auto-unlock modules",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3">
                <p className="text-sm text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Cohort pulse</p>
            <h3 className="text-2xl font-semibold text-slate-900">Week 3 cadence</h3>
            <p className="text-sm text-slate-600">
              92 learners active, 74% completion, 12% velocity gain this sprint.
            </p>
          </GlassCard>
          <GlassCard className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Next launch</p>
            <h3 className="text-2xl font-semibold text-slate-900">React Fundamentals</h3>
            <p className="text-sm text-slate-600">
              Live cohort opens in 2 days. Invite your team or enroll solo.
            </p>
            <Link
              href="/courses"
              className="inline-flex h-10 items-center rounded-full bg-slate-900 px-4 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              View catalog
            </Link>
          </GlassCard>
        </div>
      </section>

      <section id="community" className="grid gap-6">
        <GlassCard className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Community runway</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
            Celebrate wins, share momentum, keep cohorts aligned.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
            Integrated spaces for shoutouts, project demos, and async office hours.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-12 items-center rounded-full border border-slate-900/15 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900/30"
          >
            Join the cohort
          </Link>
        </GlassCard>
      </section>
    </PageShell>
  );
}
