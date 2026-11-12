import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { demoBusiness, demoSettings } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => pageHead("Configurações", "Dados e preferências do estabelecimento."),
  component: Configuracoes,
});

const initialPolicies = Object.fromEntries(
  Object.entries(demoSettings)
    .filter(([, value]) => typeof value === "number")
    .map(([key, value]) => [key, String(value)]),
);

function Configuracoes() {
  const [modes, setModes] = useState(demoSettings);
  const [draftPolicies, setDraftPolicies] = useState<Record<string, string>>(initialPolicies);
  const invalidPolicy = (key: string, min: number, max: number) => {
    const raw = draftPolicies[key] ?? "";
    const value = Number(raw);
    return raw === "" || !Number.isInteger(value) || value < min || value > max;
  };
  const modalities = [
    {
      key: "specificQueueEnabled",
      label: "Fila por profissional",
      description: "O cliente aguarda o profissional escolhido.",
    },
    {
      key: "anyAvailableQueueEnabled",
      label: "Fila para qualquer disponível",
      description: "Um único lugar na fila, atribuído a um profissional habilitado na chamada.",
    },
    {
      key: "onlineBookingEnabled",
      label: "Agendamento online",
      description: "Horários reservados são protegidos dos encaixes da fila.",
    },
  ] as const;
  const policies = [
    { key: "callResponseMinutes", label: "Resposta à chamada", unit: "minutos", min: 1, max: 60 },
    {
      key: "bufferMinutes",
      label: "Intervalo entre atendimentos",
      unit: "minutos",
      min: 0,
      max: 60,
    },
    { key: "latenessMinutes", label: "Tolerância de atraso", unit: "minutos", min: 0, max: 60 },
    {
      key: "cancellationHours",
      label: "Antecedência para cancelar ou remarcar",
      unit: "horas",
      min: 0,
      max: 168,
    },
  ] as const;
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dados, modalidades e regras do estabelecimento."
      />
      <p className="mb-6 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        Prévia visual: os controles podem ser explorados nesta tela, mas nada é salvo nem altera a
        agenda, a fila ou a página pública.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Estabelecimento">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" className="h-12" defaultValue={demoBusiness.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Endereço</Label>
              <Input id="end" className="h-12" defaultValue={demoBusiness.address} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hor">Horário de funcionamento</Label>
              <Input id="hor" className="h-12" defaultValue={demoBusiness.hours} />
            </div>
          </div>
        </Panel>
        <Panel title="Modalidades independentes">
          <div className="space-y-5">
            {modalities.map(({ key, label, description }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={key}>{label}</Label>
                  <p id={`${key}-help`} className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
                <Switch
                  id={key}
                  aria-describedby={`${key}-help`}
                  checked={modes[key]}
                  onCheckedChange={(checked) =>
                    setModes((current) => ({ ...current, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
          {!modes.specificQueueEnabled &&
            !modes.anyAvailableQueueEnabled &&
            !modes.onlineBookingEnabled && (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                Todas as modalidades estão desativadas nesta prévia.
              </p>
            )}
          <p className="mt-5 text-sm text-muted-foreground">
            A entrada na fila exige presença confirmada pela equipe, mesmo quando a consulta pública
            está disponível.
          </p>
        </Panel>
        <Panel title="Políticas operacionais">
          <p className="mb-4 text-sm text-muted-foreground">
            Valores iniciais aprovados. Ajustes reais estarão disponíveis na etapa de gestão.
          </p>
          <div className="space-y-4">
            {policies.map(({ key, label, unit, min, max }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>
                  {label} ({unit})
                </Label>
                <Input
                  id={key}
                  type="number"
                  min={min}
                  max={max}
                  step={1}
                  className="h-12"
                  value={draftPolicies[key] ?? ""}
                  aria-invalid={invalidPolicy(key, min, max)}
                  aria-describedby={`${key}-validation`}
                  onChange={(event) =>
                    setDraftPolicies((current) => ({ ...current, [key]: event.target.value }))
                  }
                />
                <p id={`${key}-validation`} className="text-xs text-muted-foreground">
                  {invalidPolicy(key, min, max)
                    ? `Use um número inteiro entre ${min} e ${max}.`
                    : "Valor apenas para exploração visual; não é salvo."}
                </p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              setModes(demoSettings);
              setDraftPolicies(initialPolicies);
            }}
          >
            Restaurar valores da prévia
          </Button>
        </Panel>
        <Panel title="Como as regras funcionam">
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li>
              Encaixe só cabe se a duração do serviço e o intervalo couberem antes da próxima
              reserva.
            </li>
            <li>
              Após a janela da chamada, a equipe registra a ausência manualmente; o sistema não
              libera o cliente sozinho.
            </li>
            <li>Ausência na chamada e atraso de agendamento são situações diferentes.</li>
            <li>
              Profissional em pausa não recebe novas chamadas. Reservas afetadas continuam visíveis
              com aviso.
            </li>
            <li>O proprietário pode também atender como profissional, com o mesmo login.</li>
            <li>
              Cancelamentos fora do prazo exigem contato com o estabelecimento; exceções deverão
              registrar motivo.
            </li>
          </ul>
        </Panel>
      </div>
      <Button size="xl" className="mt-6" disabled>
        Salvar alterações — em breve
      </Button>
    </>
  );
}
