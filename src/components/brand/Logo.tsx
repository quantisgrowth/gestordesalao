import { cn } from "@/lib/utils";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-xl font-bold", tone === "light" ? "text-primary-foreground" : "text-foreground", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint text-mint-foreground">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M4 12h2l2-5 3 10 3-7 2 2h4" />
        </svg>
      </span>
      Cadence
    </span>
  );
}
