import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Plus, Pencil } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganization } from "@/components/layout/OrganizationProvider";
import { CatalogEditor } from "@/components/common/CatalogEditor";
import { SaveFeedback } from "@/components/common/SaveFeedback";
import { formatPrice, type Service } from "@/data/organization";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/app/servicos")({
  head: () => pageHead("Serviços", "Serviços oferecidos, duração e preços."),
  component: Servicos,
});
export function Servicos() {
  const { allServices, professionalById, canManageCatalog } = useOrganization();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [message, setMessage] = useState("");
  const filtered = allServices.filter(
    (s) =>
      s.name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")) &&
      (filter === "all" || s.active === (filter === "active")),
  );
  return (
    <>
      <PageHeader
        title="Serviços"
        description="O que você oferece, quanto tempo leva e quanto custa."
        actions={
          canManageCatalog && (
            <Button
              size="lg"
              onClick={() => {
                setSelected(null);
                setOpen(true);
                setMessage("");
              }}
            >
              <Plus /> Novo serviço
            </Button>
          )
        }
      />
      <SaveFeedback message={message} />
      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          aria-label="Buscar serviço"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar serviço"
          className="max-w-sm"
        />
        <select
          aria-label="Situação do serviço"
          className="min-h-11 rounded-md border bg-card px-3 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="all">Todos</option>
        </select>
      </div>
      <Panel>
        {!filtered.length && (
          <p className="py-4 text-sm text-muted-foreground">Nenhum serviço encontrado.</p>
        )}
        <ul className="divide-y">
          {filtered.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {s.name}{" "}
                  {!s.active && <span className="text-xs text-muted-foreground">· Inativo</span>}
                </p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {s.durationMin} min
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.professionalIds.length
                    ? s.professionalIds
                        .map((id) => professionalById(id)?.name ?? "Profissional")
                        .join(", ")
                    : "Nenhum profissional vinculado"}
                </p>
              </div>
              <span className="font-semibold">{formatPrice(s.priceCents)}</span>
              {canManageCatalog && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelected(s);
                    setOpen(true);
                    setMessage("");
                  }}
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Panel>
      {open && (
        <CatalogEditor
          kind="service"
          initial={selected}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            setMessage("Serviço salvo com sucesso.");
          }}
        />
      )}
    </>
  );
}
