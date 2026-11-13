import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marca visualmente qualquer conteúdo com dados fictícios. */
export function DemoBadge({
  className,
  label = "Dados de demonstração",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-dashed border-forest/40 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground",
        className,
      )}
    >
      <FlaskConical className="h-3.5 w-3.5" /> {label}
    </span>
  );
}
