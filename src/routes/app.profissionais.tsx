import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusPill } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/components/layout/OrganizationProvider";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/profissionais")({
  head: () => pageHead("Profissionais", "Equipe do estabelecimento."),
  component: Profissionais,
});

function Profissionais() {
  const { professionals } = useOrganization();
  return (
    <>
      <PageHeader
        title="Profissionais"
        description="Sua equipe e quem está disponível agora."
        actions={
          <Button size="xl" disabled title="Disponível em breve">
            <UserPlus /> Adicionar profissional
          </Button>
        }
      />
      {!professionals.length && (
        <p className="rounded-xl border bg-card p-6 text-muted-foreground">
          Nenhum profissional cadastrado neste estabelecimento.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {professionals.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-card p-6 text-center shadow-card">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
              {p.initials}
            </span>
            <h3 className="mt-4 font-semibold">{p.name}</h3>
            <p className="text-sm text-muted-foreground">{p.role}</p>
            <div className="mt-3">
              <StatusPill status={p.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
