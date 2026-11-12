import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { queue, serviceById } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/fila")({
  head: () => pageHead("Fila de atendimento", "Clientes aguardando por ordem de chegada."),
  component: Fila,
});

function Fila() {
  return (
    <>
      <PageHeader title="Fila de atendimento" description="Quem chegou sem horário marcado, por ordem de chegada."
        actions={<Button size="xl" disabled title="Disponível em breve"><UserPlus /> Adicionar à fila</Button>} />
      <Panel>
        <ol className="space-y-3">
          {queue.map((q) => (
            <li key={q.id} className="flex items-center gap-4 rounded-xl border bg-background p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mint font-display text-lg font-bold text-mint-foreground">{q.position}º</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{q.client}</p>
                <p className="text-sm text-muted-foreground">{serviceById(q.serviceId)?.name}</p>
              </div>
              <span className="text-right text-sm"><span className="block font-semibold">{q.waitingMin} min</span><span className="text-muted-foreground">aguardando</span></span>
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
