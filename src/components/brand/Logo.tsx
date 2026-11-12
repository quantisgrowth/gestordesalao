import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 font-display font-bold",
        tone === "light" ? "text-primary-foreground" : "text-foreground",
        className,
      )}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-mint-foreground"
        aria-hidden="true"
      >
        <svg viewBox="0 0 40 40" className="h-8 w-8" fill="currentColor">
          <text
            x="20"
            y="26"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="17"
            fontWeight="700"
            letterSpacing="-1"
          >
            GS
          </text>
        </svg>
      </span>
      <span className="text-left text-sm leading-tight sm:text-base">
        <span className="block">Gestor de</span>
        <span className="block">Salão</span>
      </span>
    </span>
  );
}
