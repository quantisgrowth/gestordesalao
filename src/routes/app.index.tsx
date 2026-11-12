import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, ListOrdered, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel, StatCard, StatusPill } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import {
  appointments,
  professionals,
  queue,
  serviceById,
  professionalById,
  demoBusiness,
  publicQueueSnapshot,
} from "@/data/demo";
import { OperationalAlert } from "@/components/common/OperationalAlert";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/")({
  head: () => pageHead("Painel", "Resumo do dia do seu estabelecimento."),
  component: Dashboard,
});

function Dashboard() {
  const upcoming = appointments
    .filter((a) => ["confirmed", "checked_in"].includes(a.status))
    .slice(0, 4);
  const available = professionals.filter((p) => p.status === "disponivel").length;
  return (
    <>
      <PageHeader
        title="Hoje no estabelecimento"
        description={demoBusiness.scenarioLabel}
        actions={
          <Button asChild size="lg">
            <Link to="/app/fila">Ver fila e recepção</Link>
          </Button>
        }
      />
      <OperationalAlert />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Agendamentos hoje"
          value={appointments.length}
          hint={`${appointments.filter((appointment) => appointment.status === "completed").length} concluído(s) no exemplo`}
          icon={CalendarDays}
        />
        <StatCard
          label="Aguardando na fila"
          value={queue.filter((entry) => entry.status === "waiting").length}
          hint={
            publicQueueSnapshot.waitRange
              ? `Espera ilustrativa: ${publicQueueSnapshot.waitRange.min}–${publicQueueSnapshot.waitRange.max} min`
              : "Estimativa indisponível"
          }
          icon={ListOrdered}
        />
        <StatCard
          label="Profissionais livres"
          value={`${available}/${professionals.length}`}
          hint="No cenário de demonstração"
          icon={UserCheck}
        />
        <StatCard
          label="Próxima reserva"
          value={upcoming[0]?.time ?? "—"}
          hint={upcoming[0]?.client}
          icon={Clock}
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel
          title="Próximos atendimentos"
          className="lg:col-span-2"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/agenda">Ver agenda</Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {upcoming.map((a) => (
              <li key={a.id} className="flex items-center gap-4 py-3">
                <span className="w-14 font-display font-semibold">{a.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.client}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {serviceById(a.serviceId)?.name} · {professionalById(a.professionalId)?.name}
                  </p>
                </div>
                <StatusPill status={a.status} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Equipe no cenário">
          <ul className="space-y-3">
            {professionals.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-semibold">
                  {p.initials}
                </span>
                <span className="flex-1 text-sm font-medium">{p.name}</span>
                <StatusPill status={p.status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
