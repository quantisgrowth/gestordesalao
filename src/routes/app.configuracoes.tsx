import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { SaveFeedback } from "@/components/common/SaveFeedback";
import { useOrganization } from "@/components/layout/OrganizationProvider";
import { useRecordSave } from "@/hooks/use-record-save";
import { getSupabase } from "@/lib/supabase";
import { pageHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export const Route = createFileRoute("/app/configuracoes")({
  head: () => pageHead("Configurações", "Dados e preferências do estabelecimento."),
  component: Configuracoes,
});
const modes = [
  ["specific_queue_enabled", "Fila por profissional"],
  ["any_available_queue_enabled", "Fila para qualquer disponível"],
  ["online_booking_enabled", "Agendamento online"],
  ["public_page_enabled", "Página pública"],
  ["public_queue_enabled", "Consulta pública da fila"],
] as const;
const policies = [
  { key: "buffer_minutes", label: "Intervalo entre atendimentos (min)", min: 0, max: 120 },
  { key: "lateness_minutes", label: "Tolerância de atraso (min)", min: 0, max: 120 },
  {
    key: "cancellation_hours",
    label: "Antecedência para cancelar ou remarcar (h)",
    min: 0,
    max: 720,
  },
  {
    key: "minimum_booking_lead_minutes",
    label: "Antecedência mínima para agendar (min)",
    min: 0,
    max: 43200,
  },
  {
    key: "maximum_booking_horizon_days",
    label: "Limite de agendamento futuro (dias)",
    min: 1,
    max: 365,
  },
] as const;
export function Configuracoes() {
  const { organization, settings, canManageCatalog } = useOrganization();
  const [editor, setEditor] = useState<"business" | "policies" | null>(null);
  const [message, setMessage] = useState("");
  const details = [
    ["Nome", organization.name],
    ["Identificador", organization.slug],
    ["Endereço", organization.address || "Não informado"],
    ["Telefone", organization.contact_phone || "Não informado"],
    ["Fuso horário", organization.timezone],
  ];
  return (
    <>
      <PageHeader title="Configurações" description="Dados e regras do seu estabelecimento." />
      <SaveFeedback message={message} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Estabelecimento"
          action={
            canManageCatalog && (
              <Button
                variant="outline"
                onClick={() => {
                  setMessage("");
                  setEditor("business");
                }}
              >
                Editar dados
              </Button>
            )
          }
        >
          <dl className="space-y-4">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel
          title="Modalidades"
          action={
            canManageCatalog && (
              <Button
                variant="outline"
                onClick={() => {
                  setMessage("");
                  setEditor("policies");
                }}
              >
                Editar regras
              </Button>
            )
          }
        >
          <dl className="space-y-4">
            {modes.map(([key, label]) => (
              <div key={key} className="flex justify-between gap-4 text-sm">
                <dt>{label}</dt>
                <dd>{settings[key] ? "Ativada" : "Desativada"}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Políticas operacionais">
          <dl className="space-y-4">
            {policies.map(({ key, label }) => (
              <div key={key}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1">{settings[key]}</dd>
              </div>
            ))}
            <div>
              <dt className="text-sm text-muted-foreground">Resposta à chamada</dt>
              <dd className="mt-1">{settings.call_response_minutes} minutos (fixo)</dd>
            </div>
          </dl>
        </Panel>
      </div>
      {!canManageCatalog && (
        <p className="mt-6 text-sm text-muted-foreground">
          A edição é restrita ao proprietário e gestor da empresa.
        </p>
      )}
      {editor && (
        <SettingsEditor
          kind={editor}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setMessage(
              editor === "business"
                ? "Dados do estabelecimento salvos."
                : "Modalidades e políticas salvas.",
            );
            setEditor(null);
          }}
        />
      )}
    </>
  );
}

export function SettingsEditor({
  kind,
  onClose,
  onSaved,
}: {
  kind: "business" | "policies";
  onClose: () => void;
  onSaved: () => void;
}) {
  const { organization, settings, canManageCatalog } = useOrganization();
  const action = useRecordSave();
  const [version] = useState(kind === "business" ? organization.updated_at : settings.updated_at);
  const [business, setBusiness] = useState({
    name: organization.name,
    address: organization.address ?? "",
    contact_phone: organization.contact_phone ?? "",
    timezone: organization.timezone,
  });
  const [draftModes, setDraftModes] = useState(
    () =>
      Object.fromEntries(modes.map(([key]) => [key, settings[key]])) as Record<
        (typeof modes)[number][0],
        boolean
      >,
  );
  const [numbers, setNumbers] = useState(
    () =>
      Object.fromEntries(policies.map(({ key }) => [key, String(settings[key])])) as Record<
        (typeof policies)[number]["key"],
        string
      >,
  );
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canManageCatalog) return;
    void action.save(async () => {
      if (kind === "business") {
        if (!business.name.trim()) throw new Error("Informe o nome do estabelecimento.");
        try {
          new Intl.DateTimeFormat("pt-BR", { timeZone: business.timezone.trim() }).format();
        } catch {
          throw new Error("Informe um fuso válido, como America/Sao_Paulo.");
        }
        const { data, error } = await getSupabase()
          .from("organizations")
          .update({
            name: business.name.trim(),
            address: business.address.trim() || null,
            contact_phone: business.contact_phone.trim() || null,
            timezone: business.timezone.trim(),
          })
          .eq("id", organization.id)
          .eq("updated_at", version)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!data) throw { code: "40001" };
      } else {
        for (const { key, min, max, label } of policies) {
          if (
            !numbers[key].trim() ||
            !Number.isInteger(Number(numbers[key])) ||
            Number(numbers[key]) < min ||
            Number(numbers[key]) > max
          )
            throw new Error(`${label}: use um inteiro entre ${min} e ${max}.`);
        }
        // Explicit whitelist: slug, roles, remote_queue_enabled and call_response_minutes are never sent.
        const payload = {
          ...draftModes,
          ...Object.fromEntries(policies.map(({ key }) => [key, Number(numbers[key])])),
        };
        const { data, error } = await getSupabase()
          .from("settings")
          .update(payload)
          .eq("organization_id", organization.id)
          .eq("updated_at", version)
          .select("organization_id")
          .maybeSingle();
        if (error) throw error;
        if (!data) throw { code: "40001" };
      }
    }, onSaved);
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !action.pending) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {kind === "business" ? "Editar estabelecimento" : "Editar modalidades e políticas"}
          </DialogTitle>
          <DialogDescription>
            {kind === "business"
              ? "Atualize os dados exibidos pela empresa. O identificador do link permanece fixo."
              : "As regras serão usadas nos atendimentos e agendamentos. A janela de chamada é fixa em 5 minutos."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {kind === "business" ? (
            <>
              {(
                [
                  ["name", "Nome", 120],
                  ["address", "Endereço", 500],
                  ["contact_phone", "Telefone", 30],
                  ["timezone", "Fuso horário", 100],
                ] as const
              ).map(([key, label, max]) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={`business-${key}`}>{label}</Label>
                  <Input
                    id={`business-${key}`}
                    required={key === "name" || key === "timezone"}
                    maxLength={max}
                    value={business[key]}
                    disabled={action.pending}
                    onChange={(e) =>
                      setBusiness((current) => ({ ...current, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <fieldset disabled={action.pending} className="space-y-2">
                <legend className="mb-2 text-sm font-medium">Modalidades</legend>
                {modes.map(([key, label]) => (
                  <label key={key} className="flex min-h-11 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={draftModes[key]}
                      onChange={(e) =>
                        setDraftModes((current) => ({ ...current, [key]: e.target.checked }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              {policies.map(({ key, label, min, max }) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={`policy-${key}`}>{label}</Label>
                  <Input
                    id={`policy-${key}`}
                    type="number"
                    min={min}
                    max={max}
                    step={1}
                    required
                    value={numbers[key]}
                    disabled={action.pending}
                    onChange={(e) =>
                      setNumbers((current) => ({ ...current, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </>
          )}
          <SaveFeedback error={action.error} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={action.pending} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={action.pending || !canManageCatalog}>
              {action.pending ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
