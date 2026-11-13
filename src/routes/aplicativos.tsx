import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { PageHeader } from "@/components/common/PageHeader";
import { AppShowcase } from "@/components/previews/AppShowcase";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/aplicativos")({
  head: () =>
    pageHead("Aplicativos", "Explore as prévias dos aplicativos do cliente e do gestor do salão."),
  component: Aplicativos,
});
function Aplicativos() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/app">Painel do salão</Link>
            </Button>
            <Button asChild>
              <Link to="/admin">Admin SaaS</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <PageHeader
          demo
          title="Dois aplicativos. Uma operação conectada."
          description="Veja a experiência de quem agenda e de quem organiza o salão."
        />
        <AppShowcase />
      </main>
    </div>
  );
}
