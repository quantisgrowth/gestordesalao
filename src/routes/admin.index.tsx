import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CheckCircle2, Clock } from "lucide-react";
import { usePlatform } from "@/components/admin/PlatformProvider";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel, StatCard } from "@/components/common/Panel";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/")({
  head: () => pageHead("Admin da plataforma", "Administração dos estabelecimentos."),
  component: PlatformOverview,
});
function PlatformOverview() {
  const { companies } = usePlatform();
  return (
    <>
      <PageHeader
        title="Uma plataforma. Várias empresas."
        description="Estabelecimentos cadastrados na plataforma."
        actions={
          <Button asChild>
            <Link to="/admin/empresas">Cadastrar empresa</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Empresas cadastradas" value={companies.length} icon={Building2} />
        <StatCard
          label="Ativas"
          value={companies.filter((c) => c.status === "active").length}
          icon={CheckCircle2}
        />
        <StatCard
          label="Em teste"
          value={companies.filter((c) => c.status === "trial").length}
          icon={Clock}
        />
      </div>
      <div className="mt-6">
        <Panel title="Cadastrar uma empresa">
          <ol className="list-inside list-decimal space-y-3 text-sm text-muted-foreground">
            <li>Crie e confirme o usuário do gestor no Supabase Auth.</li>
            <li>
              Informe o e-mail desse usuário, nome da empresa, identificador e plano no cadastro.
            </li>
            <li>O gestor entra com sua senha para consultar os dados da própria empresa.</li>
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">
            O cadastro usa a função instalada no banco. Convites e criação automática de usuários
            ainda não estão disponíveis.
          </p>
        </Panel>
      </div>
    </>
  );
}
