import { useState, type FormEvent } from "react";
import { useOrganization } from "@/components/layout/OrganizationProvider";
import { useRecordSave } from "@/hooks/use-record-save";
import { getSupabase } from "@/lib/supabase";
import { parsePriceCents } from "@/lib/record-forms";
import type { Service, Professional } from "@/data/organization";
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
import { SaveFeedback } from "./SaveFeedback";

export function CatalogEditor({
  kind,
  initial,
  onClose,
  onSaved,
}: {
  kind: "service" | "professional";
  initial: Service | Professional | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { organization, allServices, allProfessionals, canManageCatalog } = useOrganization();
  const action = useRecordSave();
  const [id] = useState(() => initial?.id ?? crypto.randomUUID());
  const [version] = useState(() => initial?.updatedAt ?? null);
  const [name, setName] = useState(initial?.name ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [duration, setDuration] = useState(String((initial as Service | null)?.durationMin ?? 30));
  const [price, setPrice] = useState(((initial as Service | null)?.priceCents ?? 0) / 100 + "");
  const [ids, setIds] = useState<string[]>(
    kind === "service"
      ? ((initial as Service | null)?.professionalIds ?? [])
      : ((initial as Professional | null)?.serviceIds ?? []),
  );
  const options = kind === "service" ? allProfessionals : allServices;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canManageCatalog) return;
    void action.save(async () => {
      if (!name.trim()) throw new Error("Informe o nome.");
      if (
        kind === "service" &&
        (!Number.isInteger(Number(duration)) || Number(duration) < 1 || Number(duration) > 1440)
      )
        throw new Error("A duração deve ser um número inteiro entre 1 e 1440 minutos.");
      const common = {
        p_organization_id: organization.id,
        p_id: id,
        p_name: name.trim(),
        p_active: active,
        p_expected_updated_at: version,
      };
      const result =
        kind === "service"
          ? await getSupabase().rpc("gs_save_service", {
              ...common,
              p_duration_minutes: Number(duration),
              p_price_cents: parsePriceCents(price),
              p_professional_ids: ids,
            })
          : await getSupabase().rpc("gs_save_professional", { ...common, p_service_ids: ids });
      if (result.error) throw result.error;
      if (result.data !== id)
        throw new Error(
          "Não foi possível confirmar a gravação. Atualize a lista antes de tentar novamente.",
        );
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
            {initial ? "Editar" : "Cadastrar"} {kind === "service" ? "serviço" : "profissional"}
          </DialogTitle>
          <DialogDescription>
            {kind === "service"
              ? "Defina preço, duração e quem realiza este serviço."
              : "Cadastre a pessoa e os serviços que ela realiza. Este cadastro não cria um login."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="catalog-name">Nome</Label>
            <Input
              id="catalog-name"
              value={name}
              maxLength={kind === "service" ? 120 : 100}
              required
              disabled={action.pending}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {kind === "service" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="catalog-duration">Duração (minutos)</Label>
                <Input
                  id="catalog-duration"
                  type="number"
                  min={1}
                  max={1440}
                  step={1}
                  required
                  value={duration}
                  disabled={action.pending}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catalog-price">Preço (R$)</Label>
                <Input
                  id="catalog-price"
                  inputMode="decimal"
                  required
                  value={price}
                  disabled={action.pending}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="50,00"
                />
              </div>
            </div>
          )}
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={active}
              disabled={action.pending}
              onChange={(e) => setActive(e.target.checked)}
            />
            {kind === "service" ? "Serviço ativo" : "Profissional ativo"}
          </label>
          <p className="text-xs text-muted-foreground">
            Inativar mantém os registros anteriores e retira este cadastro do catálogo público.
          </p>
          <fieldset disabled={action.pending} className="space-y-2">
            <legend className="mb-2 text-sm font-medium">
              {kind === "service" ? "Profissionais habilitados" : "Serviços realizados"}
            </legend>
            {!options.length && (
              <p className="text-sm text-muted-foreground">
                Nenhum {kind === "service" ? "profissional" : "serviço"} cadastrado. Você pode
                salvar e vincular depois.
              </p>
            )}
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={ids.includes(option.id)}
                    onChange={(e) =>
                      setIds((current) =>
                        e.target.checked
                          ? [...current, option.id]
                          : current.filter((id) => id !== option.id),
                      )
                    }
                  />
                  {option.name}
                  {!option.active && <span className="text-xs text-muted-foreground">Inativo</span>}
                </label>
              ))}
            </div>
          </fieldset>
          <SaveFeedback error={action.error} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={action.pending} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={action.pending || !canManageCatalog}>
              {action.pending ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
