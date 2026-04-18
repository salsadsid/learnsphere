import type { CSSProperties, ReactNode } from "react";

export type PageShellProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: "max-w-5xl" | "max-w-6xl" | "max-w-7xl" | "max-w-none";
};

export const PageShell = ({
  children,
  className = "",
  maxWidth = "max-w-6xl",
}: PageShellProps) => (
  <div
    className={`mx-auto flex w-full ${maxWidth} flex-1 flex-col gap-16 px-6 py-24 ${className}`}
  >
    {children}
  </div>
);

export type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) => (
  <div className={align === "center" ? "text-center" : "text-left"}>
    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{eyebrow}</p>
    <h2 className="mt-3 text-3xl font-semibold text-slate-900 font-[var(--font-display)] md:text-4xl">
      {title}
    </h2>
    {description && <p className="mt-3 text-sm text-slate-600">{description}</p>}
  </div>
);

export type GlassCardProps = {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  style?: CSSProperties;
};

export const GlassCard = ({ children, className = "", animate = false, style }: GlassCardProps) => (
  <div
    className={`rounded-3xl border border-slate-900/10 bg-white/85 p-6 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.25)] ${
      animate ? "cinema-in" : ""
    } ${className}`}
    style={style}
  >
    {children}
  </div>
);

export type PillTone = "neutral" | "accent" | "success" | "warning";

export type PillProps = {
  label: string;
  tone?: PillTone;
};

export const Pill = ({ label, tone = "neutral" }: PillProps) => {
  const tones: Record<PillTone, string> = {
    neutral: "border-slate-900/10 text-slate-600 bg-white/80",
    accent: "border-blue-200 text-blue-700 bg-blue-50",
    success: "border-emerald-200 text-emerald-700 bg-emerald-50",
    warning: "border-amber-200 text-amber-700 bg-amber-50",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${
        tones[tone]
      }`}
    >
      {label}
    </span>
  );
};
