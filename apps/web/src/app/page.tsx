export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-16">
      <section className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-6 fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
            Build your learning sphere
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl font-[var(--font-display)]">
            A focused workspace for courses, cohorts, and measurable momentum.
          </h1>
          <p className="text-lg leading-7 text-slate-600">
            LearnSphere blends structured content with progress insights, so instructors
            can design journeys and learners can stay accountable without noise.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <button className="h-12 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800">
              Start a cohort
            </button>
            <button className="h-12 rounded-full border border-slate-900/15 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900/30">
              Explore courses
            </button>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-xl fade-up-delay">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Live cohort</p>
              <p className="text-lg font-semibold text-slate-900">Product Thinking Lab</p>
              <p className="text-sm text-slate-500">Next session: Wed 18:00</p>
            </div>
            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus metric</p>
              <p className="text-lg font-semibold text-slate-900">78% completion</p>
              <p className="text-sm text-slate-500">+12% from last week</p>
            </div>
            <div className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next checkpoint</p>
              <p className="text-lg font-semibold text-slate-900">Customer discovery sprint</p>
              <p className="text-sm text-slate-500">Unlocks in 3 days</p>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Course Architecture",
            body: "Map lessons into outcomes with repeatable templates.",
          },
          {
            title: "Mentor Touchpoints",
            body: "Blend async content with human check-ins and feedback.",
          },
          {
            title: "Progress Signals",
            body: "Surface momentum with completion, time-on-task, and trends.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-slate-900/10 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1"
          >
            <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </div>
        ))}
      </section>

      <section id="progress" className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress cockpit</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
              Turn check-ins into a learning rhythm.
            </h2>
          </div>
          <button className="h-12 rounded-full bg-teal-600 px-6 text-sm font-semibold text-white transition hover:bg-teal-500">
            View analytics
          </button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "Weekly heartbeat summaries",
            "Mentor notes alongside metrics",
            "Auto-generated action plans",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="community" className="rounded-3xl border border-dashed border-slate-900/15 bg-white/60 p-10 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Community</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
          Keep cohorts in sync, even between sessions.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Share updates, celebrate wins, and keep lesson resources accessible without
          losing the human touch.
        </p>
        <button className="mt-6 h-12 rounded-full border border-slate-900/15 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900/30">
          Join a preview cohort
        </button>
      </section>
    </div>
  );
}
