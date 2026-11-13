import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { useOrganization } from "@/components/layout/OrganizationProvider";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/app/configuracoes")({
  head: () => pageHead("Configurações", "Dados e preferências do estabelecimento."),
  component: Configuracoes,
});
function Configuracoes() {
  const { organization, settings } = useOrganization();
  const details = [
    ["Nome", organization.name],
    ["Identificador", organization.slug],
    ["Endereço", organization.address || "Não informado"],
    ["Telefone", organization.contact_phone || "Não informado"],
    ["Fuso horário", organization.timezone],
  ];
  const modes = [
    ["Fila por profissional", settings.specific_queue_enabled],
    ["Fila para qualquer disponível", settings.any_available_queue_enabled],
    ["Agendamento online", settings.online_booking_enabled],
    ["Página pública", settings.public_page_enabled],
    ["Consulta pública da fila", settings.public_queue_enabled],
  ];
  const policies = [
    ["Intervalo entre atendimentos", `${settings.buffer_minutes} minutos`],
    ["Resposta à chamada", `${settings.call_response_minutes} minutos`],
    ["Tolerância de atraso", `${settings.lateness_minutes} minutos`],
    ["Antecedência para cancelar ou remarcar", `${settings.cancellation_hours} horas`],
  ];
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dados e regras cadastrados para o seu estabelecimento."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Estabelecimento">
          <dl className="space-y-4">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Modalidades">
          <dl className="space-y-4">
            {modes.map(([label, enabled]) => (
              <div key={String(label)} className="flex justify-between gap-4 text-sm">
                <dt>{label}</dt>
                <dd>{enabled ? "Ativada" : "Desativada"}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Políticas operacionais">
          <dl className="space-y-4">
            {policies.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Consulta das configurações salvas. A edição pelo painel será disponibilizada em uma próxima
        etapa.
      </p>
    </>
  );
}
