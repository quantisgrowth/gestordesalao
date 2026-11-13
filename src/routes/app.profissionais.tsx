import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Pencil } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganization } from "@/components/layout/OrganizationProvider";
import { CatalogEditor } from "@/components/common/CatalogEditor";
import { SaveFeedback } from "@/components/common/SaveFeedback";
import type { Professional } from "@/data/organization";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/app/profissionais")({
  head: () => pageHead("Profissionais", "Equipe do estabelecimento."),
  component: Profissionais,
});
export function Profissionais() {
  const { allProfessionals, serviceById, canManageCatalog } = useOrganization();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Professional | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [message, setMessage] = useState("");
  const filtered = allProfessionals.filter(
    (p) =>
      p.name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")) &&
      (filter === "all" || p.active === (filter === "active")),
  );
  return (
    <>
      <PageHeader
        title="Profissionais"
        description="Sua equipe e os serviços que cada pessoa realiza."
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
              <UserPlus /> Adicionar profissional
            </Button>
          )
        }
      />
      <SaveFeedback message={message} />
      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          aria-label="Buscar profissional"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar profissional"
          className="max-w-sm"
        />
        <select
          aria-label="Situação do profissional"
          className="min-h-11 rounded-md border bg-card px-3 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="all">Todos</option>
        </select>
      </div>
      {!filtered.length && (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Nenhum profissional encontrado.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <article key={p.id} className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">
                {p.initials}
              </span>
              <div>
                <h2 className="font-semibold">{p.name}</h2>
                <div className="mt-1">
                  {p.active ? (
                    <StatusPill status={p.status} />
                  ) : (
                    <span className="text-sm text-muted-foreground">Inativo</span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {p.serviceIds.length
                ? p.serviceIds.map((id) => serviceById(id)?.name ?? "Serviço").join(", ")
                : "Nenhum serviço vinculado"}
            </p>
            {canManageCatalog && (
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setSelected(p);
                  setOpen(true);
                  setMessage("");
                }}
              >
                <Pencil className="h-4 w-4" /> Editar
              </Button>
            )}
          </article>
        ))}
      </div>
      {open && (
        <CatalogEditor
          kind="professional"
          initial={selected}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            setMessage("Profissional salvo com sucesso.");
          }}
        />
      )}
    </>
  );
}
