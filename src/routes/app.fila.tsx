import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Monitor } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel, StatusPill } from "@/components/common/Panel";
import { OperationalAlert } from "@/components/common/OperationalAlert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queue, serviceById, professionalById, demoSettings, demoBusiness } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/fila")({
  head: () => pageHead("Fila de atendimento", "Fila presencial e prévia da recepção."),
  component: Fila,
});

function Fila() {
  return (
    <>
      <PageHeader
        title="Fila de atendimento"
        description={demoBusiness.scenarioLabel}
        actions={
          <Button size="xl" disabled>
            <UserPlus /> Registrar chegada — em breve
          </Button>
        }
      />
      <OperationalAlert />
      <Tabs defaultValue="fila">
        <TabsList className="mb-5 h-12">
          <TabsTrigger value="fila" className="min-h-10">
            Fila de hoje
          </TabsTrigger>
          <TabsTrigger value="recepcao" className="min-h-10">
            <Monitor className="mr-2 h-4 w-4" /> Recepção / tablet
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fila">
          <p className="mb-4 text-sm text-muted-foreground">
            Ordem de chegada do exemplo. A próxima chamada depende do serviço, da preferência e das
            reservas de cada profissional; não existe posição única garantida para todos.
          </p>
          <Panel>
            <ol className="space-y-3">
              {queue.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-start gap-4 rounded-xl border bg-background p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{entry.client}</p>
                      <StatusPill status={entry.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {serviceById(entry.serviceId)?.name} · Chegada às {entry.arrivedAt}
                    </p>
                    <p className="mt-1 text-sm">
                      {entry.preferredProfessionalId
                        ? `Aguarda ${professionalById(entry.preferredProfessionalId)?.name}`
                        : "Qualquer profissional habilitado disponível"}
                    </p>
                    {entry.assignedProfessionalId && (
                      <p className="mt-1 text-sm text-forest">
                        Chamado por {professionalById(entry.assignedProfessionalId)?.name}, às{" "}
                        {entry.calledAt}.
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.waitingMin} min já aguardados no exemplo
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
          <p className="mt-4 text-sm text-muted-foreground">
            Tempo já aguardado não é previsão de espera restante. O cliente do grupo “qualquer
            disponível” tem uma única entrada, sem duplicação entre profissionais.
          </p>
        </TabsContent>
        <TabsContent value="recepcao">
          <Panel title="Balcão de atendimento">
            <p className="text-sm text-muted-foreground">
              Prévia para tablet e recepção. Todos os registros são fictícios; os botões
              operacionais ainda estão desabilitados.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Button size="xl" disabled>
                <UserPlus /> Confirmar chegada presencial
              </Button>
              <Button size="xl" variant="outline" disabled>
                Agendar para o cliente
              </Button>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {queue.map((entry) => (
                <article key={entry.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{entry.client}</h3>
                    <StatusPill status={entry.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {serviceById(entry.serviceId)?.name}
                  </p>
                  {entry.status === "called" && (
                    <p className="mt-3 text-sm">
                      Chamada às {entry.calledAt}. Janela de resposta:{" "}
                      {demoSettings.callResponseMinutes} minutos; ausência somente por ação manual
                      após esse prazo.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="lg" disabled>
                      {entry.status === "called" ? "Iniciar atendimento" : "Chamar cliente"}
                    </Button>
                    <Button size="lg" variant="outline" disabled>
                      {entry.status === "called" ? "Registrar ausência" : "Registrar desistência"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Reentrada após ausência será no final da fila, com presença confirmada e histórico
              preservado. Alterar prioridade exigirá administrador ou recepção, com justificativa.
            </p>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  );
}
