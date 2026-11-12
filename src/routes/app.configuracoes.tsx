import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { demoBusiness } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => pageHead("Configurações", "Dados e preferências do estabelecimento."),
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <>
      <PageHeader title="Configurações" description="Ajuste as informações do seu estabelecimento." />
      <p className="mb-4 text-sm text-muted-foreground">As alterações ainda não são salvas — esta tela é uma prévia.</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Estabelecimento">
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="nome">Nome</Label><Input id="nome" className="h-12" defaultValue={demoBusiness.name} /></div>
            <div className="space-y-2"><Label htmlFor="end">Endereço</Label><Input id="end" className="h-12" defaultValue={demoBusiness.address} /></div>
            <div className="space-y-2"><Label htmlFor="hor">Horário de funcionamento</Label><Input id="hor" className="h-12" defaultValue={demoBusiness.hours} /></div>
          </div>
        </Panel>
        <Panel title="Preferências">
          <div className="space-y-5">
            {["Aceitar agendamentos pela página pública", "Ativar fila para clientes sem horário", "Mostrar preços na página pública"].map((l, i) => (
              <label key={l} className="flex items-center justify-between gap-4 text-sm font-medium">{l}<Switch defaultChecked={i !== 1} /></label>
            ))}
          </div>
        </Panel>
      </div>
      <Button size="xl" className="mt-6" disabled>Salvar alterações</Button>
    </>
  );
}
