import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel, StatusPill } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { appointments, professionals, serviceById, demoBusiness } from "@/data/demo";
import { OperationalAlert } from "@/components/common/OperationalAlert";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/agenda")({
  head: () => pageHead("Agenda", "Horários marcados do dia, por profissional."),
  component: Agenda,
});

function Agenda() {
  return (
    <>
      <PageHeader
        title="Agenda de hoje"
        description={demoBusiness.scenarioLabel}
        actions={
          <Button size="xl" disabled title="Disponível em breve">
            <Plus /> Novo agendamento
          </Button>
        }
      />
      <OperationalAlert />
      <p className="mb-4 text-sm text-muted-foreground">
        Reservas preservam o horário. Encaixes precisam comportar a duração do serviço e o
        intervalo; nenhuma ação real está disponível nesta prévia.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {professionals.map((p) => {
          const list = appointments.filter((a) => a.professionalId === p.id);
          return (
            <Panel key={p.id} title={p.name}>
              {list.length === 0 ? (
                <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
                  Nenhum horário marcado hoje.
                </p>
              ) : (
                <ul className="space-y-2">
                  {list.map((a) => (
                    <li key={a.id} className="rounded-xl border-l-4 border-mint bg-background p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold">{a.time}</span>
                        <StatusPill status={a.status} />
                      </div>
                      <p className="mt-1 text-sm font-medium">{a.client}</p>
                      <p className="text-xs text-muted-foreground">
                        {serviceById(a.serviceId)?.name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}
