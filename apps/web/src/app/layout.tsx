import type { Metadata } from "next";
import Link from "next/link";
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
      <body className="min-h-screen bg-signal text-slate-900">
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none fixed inset-0 opacity-50">
            <div className="absolute inset-0 grid-halo" />
            <div className="absolute -left-24 top-8 h-96 w-96 rounded-full bg-slate-200/70 blur-3xl orbit-slow" />
            <div className="absolute -right-32 top-24 h-[28rem] w-[28rem] rounded-full bg-blue-100/80 blur-3xl orbit-slow" />
            <div className="absolute right-16 bottom-8 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl orbit-slow" />
          </div>
          <header className="relative z-10 border-b border-white/60 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white font-semibold shadow-lg shadow-blue-500/20">
                  LS
                </span>
                <div>
                  <p className="text-lg font-semibold tracking-tight">LearnSphere</p>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
                    Contest-grade learning
                  </p>
                </div>
              </div>
              <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
                <Link className="transition hover:text-slate-900" href="/courses">
                  Courses
                </Link>
                <Link className="transition hover:text-slate-900" href="/dashboard">
                  Dashboard
                </Link>
                <a className="transition hover:text-slate-900" href="#experience">
                  Experience
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
