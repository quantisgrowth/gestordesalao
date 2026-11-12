import { Clock, Users } from "lucide-react";
import { publicQueueSnapshot } from "@/data/demo";

export function WaitSummary() {
  const snapshot = publicQueueSnapshot;
  return (
    <section
      className="rounded-2xl border bg-card p-5 shadow-card"
      aria-label="Consulta pública da fila"
    >
      <h2 className="text-lg font-semibold">Como está a espera?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Exemplo ilustrativo — sem atualização em tempo real nesta versão.
      </p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-background p-4">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> Pessoas aguardando
          </dt>
          <dd className="mt-2 font-display text-3xl font-semibold">{snapshot.waitingCount}</dd>
        </div>
        <div className="rounded-xl bg-background p-4">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> Espera estimada
          </dt>
          <dd className="mt-2 font-display text-2xl font-semibold">
            {snapshot.waitRange
              ? `~ ${snapshot.waitRange.min}–${snapshot.waitRange.max} min`
              : "Indisponível"}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted-foreground">
        A espera pode variar conforme serviço, profissional e horários reservados. Esta faixa não
        garante um horário.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Referência do exemplo: {snapshot.updatedLabel}.
      </p>
      <div className="mt-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
        Para entrar na fila, compareça ao estabelecimento e confirme sua chegada com a equipe. Não
        há entrada remota nesta versão.
      </div>
    </section>
  );
}
