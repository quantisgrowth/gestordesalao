import { createFileRoute } from "@tanstack/react-router";
import { Clock, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/components/layout/OrganizationProvider";
import { formatPrice } from "@/data/organization";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/servicos")({
  head: () => pageHead("Serviços", "Serviços oferecidos, duração e preços."),
  component: Servicos,
});

function Servicos() {
  const { services } = useOrganization();
  return (
    <>
      <PageHeader
        title="Serviços"
        description="O que você oferece, quanto tempo leva e quanto custa."
        actions={
          <Button size="xl" disabled title="Disponível em breve">
            <Plus /> Novo serviço
          </Button>
        }
      />
      <Panel>
        {!services.length && (
          <p className="py-4 text-sm text-muted-foreground">
            Nenhum serviço cadastrado neste estabelecimento.
          </p>
        )}
        <ul className="divide-y">
          {services.map((s) => (
            <li key={s.id} className="flex items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{s.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {s.durationMin} min · {s.category}
                </p>
              </div>
              <span className="font-display font-semibold">{formatPrice(s.priceCents)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
