import type { Metadata } from "next";
import { DM_Serif_Display, Space_Grotesk } from "next/font/google";
import AuthSession from "@/shared/auth-session";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnSphere",
  description: "A modern learning platform for courses and progress tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSerif.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f7f1e8] text-slate-900">
        <div className="relative min-h-full overflow-hidden">
          <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-amber-200/70 blur-3xl float-slow" />
          <div className="pointer-events-none absolute -right-28 top-32 h-96 w-96 rounded-full bg-teal-200/70 blur-3xl float-slow" />
          <header className="relative z-10 border-b border-slate-900/10 bg-white/70 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-semibold">
                  LS
                </span>
                <div>
                  <p className="text-lg font-semibold tracking-tight">LearnSphere</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Modular Learning
                  </p>
                </div>
              </div>
              <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
                <a className="transition hover:text-slate-900" href="#courses">
                  Courses
                </a>
                <a className="transition hover:text-slate-900" href="#progress">
                  Progress
                </a>
                <a className="transition hover:text-slate-900" href="#community">
                  Community
                </a>
              </nav>
              <AuthSession />
            </div>
          </header>
          <main className="relative z-10 flex flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
