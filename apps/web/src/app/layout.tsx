import type { Metadata } from "next";
import { Geist, DM_Serif_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="en" className={cn("h-full antialiased", geist.variable, dmSerif.variable)}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <QueryProvider>
          <AuthProvider>
            <div className="relative min-h-screen">
              <div className="pointer-events-none fixed inset-0 opacity-40">
                <div className="absolute inset-0 grid-halo" />
                <div className="absolute -left-24 top-8 h-96 w-96 rounded-full bg-primary/5 blur-3xl orbit-slow" />
                <div className="absolute -right-32 top-24 h-[28rem] w-[28rem] rounded-full bg-blue-200/30 blur-3xl orbit-slow" />
                <div className="absolute right-16 bottom-8 h-80 w-80 rounded-full bg-sky-200/20 blur-3xl orbit-slow" />
              </div>
              <Navbar />
              <main className="relative z-10 flex flex-1 flex-col">{children}</main>
            </div>
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
