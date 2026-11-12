import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => pageHead("Entrar", "Acesse o painel do seu estabelecimento na Cadence."),
  component: Login,
});

function Login() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-hero p-12 text-primary-foreground md:flex md:flex-col md:justify-between">
        <Logo tone="light" />
        <h2 className="max-w-sm text-4xl font-bold leading-tight">Seu negócio no <span className="text-mint">ritmo certo.</span></h2>
        <p className="text-sm opacity-60">© Cadence</p>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden"><Logo /></Link>
          <h1 className="mt-8 text-2xl font-semibold md:mt-0">Entrar</h1>
          <p className="mt-1 text-muted-foreground">Acesse o painel do seu estabelecimento.</p>
          <div className="mt-6 flex gap-2 rounded-xl border border-dashed bg-accent p-3 text-sm text-accent-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            O acesso ainda não está disponível. Esta tela é apenas uma prévia visual.
          </div>
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" placeholder="voce@exemplo.com" className="h-12" disabled /></div>
            <div className="space-y-2"><Label htmlFor="senha">Senha</Label><Input id="senha" type="password" placeholder="••••••••" className="h-12" disabled /></div>
            <Button type="submit" size="xl" className="w-full" disabled>Entrar</Button>
          </form>
          <Button asChild variant="link" className="mt-4 w-full"><Link to="/app">Ver o painel de demonstração</Link></Button>
        </div>
      </div>
    </div>
  );
}
