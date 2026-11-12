import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ title, children, className, action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-card", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const statusStyles = {
  confirmado: "bg-accent text-accent-foreground",
  pendente: "bg-muted text-muted-foreground",
  concluido: "bg-secondary text-secondary-foreground line-through decoration-1",
  disponivel: "bg-accent text-accent-foreground",
  atendendo: "bg-primary text-primary-foreground",
  pausa: "bg-muted text-muted-foreground",
} as const;
const statusLabels = { confirmado: "Confirmado", pendente: "Pendente", concluido: "Concluído", disponivel: "Disponível", atendendo: "Atendendo", pausa: "Em pausa" } as const;

export function StatusPill({ status }: { status: keyof typeof statusStyles }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[status])}>{statusLabels[status]}</span>;
}
