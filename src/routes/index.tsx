import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ListOrdered, Smartphone, Sparkles, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gestor de Salão — Seu negócio no ritmo certo" },
      {
        name: "description",
        content:
          "Agenda, fila e equipe em um só lugar para barbearias, salões de beleza e profissionais autônomos.",
      },
      { property: "og:title", content: "Gestor de Salão — Seu negócio no ritmo certo" },
      {
        property: "og:description",
        content: "Agenda, fila e equipe em um só lugar para barbearias, salões e autônomos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const benefits = [
  {
    icon: CalendarDays,
    title: "Agenda sem confusão",
    text: "Veja o dia inteiro de cada profissional em uma tela só.",
  },
  {
    icon: ListOrdered,
    title: "Fila organizada",
    text: "Clientes sem horário marcado sabem quanto falta para serem atendidos.",
  },
  {
    icon: Users,
    title: "Equipe em sintonia",
    text: "Saiba quem está livre, atendendo ou em pausa.",
  },
  {
    icon: Smartphone,
    title: "Feito para o celular",
    text: "Funciona bem no celular, tablet e computador.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-hero text-primary-foreground">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo tone="light" />
          <Button asChild variant="mint">
            <Link to="/login">Entrar</Link>
          </Button>
        </header>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-12 sm:px-6 md:grid-cols-2 md:items-center md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/30 px-3 py-1 text-sm text-mint">
              <Sparkles className="h-4 w-4" /> Para barbearias, salões e autônomos
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Seu negócio no <span className="text-mint">ritmo certo.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg opacity-80">
              Agenda, fila de atendimento e equipe organizadas em um lugar simples de usar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="xl" variant="mint">
                <Link to="/login">Acessar meu painel</Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="ghost"
                className="hover:bg-sidebar-accent hover:text-primary-foreground"
              >
                <Link to="/aplicativos">Ver aplicativos</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-sidebar-border bg-sidebar-accent/60 p-5 shadow-glow">
            <p className="text-xs uppercase tracking-wider opacity-60">Exemplo · dados fictícios</p>
            <div className="mt-4 space-y-3">
              {[
                ["09:00", "Corte de cabelo"],
                ["10:00", "Corte + barba"],
                ["10:30", "Escova"],
              ].map(([t, s]) => (
                <div key={t} className="flex items-center gap-4 rounded-xl bg-primary p-4">
                  <span className="flex items-center gap-1 font-display text-mint">
                    <Clock className="h-4 w-4" />
                    {t}
                  </span>
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="max-w-lg text-3xl font-semibold">
          Menos tempo organizando, mais tempo atendendo.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border bg-card p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-forest p-8 text-forest-foreground sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Quer ver como funciona?</h2>
            <p className="mt-2 opacity-85">
              Entre no painel ou explore as prévias dos aplicativos.
            </p>
          </div>
          <Button asChild size="xl" variant="mint">
            <Link to="/aplicativos">Explorar aplicativos</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© Gestor de Salão · Seu negócio no ritmo certo.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-5">
          <Link to="/aplicativos" className="underline">
            Aplicativos
          </Link>
          <Link to="/estabelecimento/$slug" params={{ slug: "demo" }} className="underline">
            Página do cliente
          </Link>
          <Link to="/admin" className="underline">
            Admin da plataforma
          </Link>
        </div>
      </footer>
    </div>
  );
}
