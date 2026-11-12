import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { usePlatformDemo } from "@/components/admin/DemoPlatformContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel, StatCard } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/")({
  head: () =>
    pageHead("Admin da plataforma", "Visão demonstrativa da administração multiempresa do SaaS."),
  component: PlatformOverview,
});
function PlatformOverview() {
  const { companies } = usePlatformDemo();
  return (
    <>
      <PageHeader
        title="Uma plataforma. Várias empresas."
        description="Acompanhe os estabelecimentos e organize a ativação dos gestores."
        actions={
          <Button asChild>
            <Link to="/admin/empresas">Cadastrar empresa</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Empresas no exemplo" value={companies.length} icon={Building2} />
        <StatCard
          label="Ativas no exemplo"
          value={companies.filter((company) => company.status === "ativa").length}
          icon={CheckCircle2}
        />
        <StatCard
          label="Aguardando ativação"
          value={companies.filter((company) => company.status === "convite_pendente").length}
          icon={Mail}
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Ativação de uma nova empresa">
          <ol className="list-inside list-decimal space-y-4 text-sm text-muted-foreground">
            <li>Administrador cadastra a empresa e o e-mail do gestor.</li>
            <li>O gestor recebe um convite para definir a própria senha.</li>
            <li>O gestor configura profissionais, serviços e modalidades do seu salão.</li>
            <li>A equipe opera os atendimentos e o cliente acompanha a página pública.</li>
          </ol>
          <p className="mt-5 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
            Nesta versão, apenas o primeiro passo pode ser simulado. Convites, login e permissões
            reais serão conectados na etapa de autenticação.
          </p>
        </Panel>
        <Panel title="Três visões de acesso">
          <div className="space-y-4 text-sm">
            <p>
              <strong>Admin da plataforma:</strong> empresas, responsáveis, planos e situação do
              acesso.
            </p>
            <p>
              <strong>Gestor do salão:</strong> operação somente da sua empresa, com possibilidade
              de também atender.
            </p>
            <p>
              <strong>Cliente:</strong> serviços públicos, agendamento e seus próprios dados.
            </p>
            <p className="flex items-start gap-2 rounded-xl border p-3 text-muted-foreground">
              <ShieldCheck className="h-5 w-5 shrink-0" /> O isolamento real entre empresas será
              validado antes do piloto com dados pessoais.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
