import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { DemoBadge } from "@/components/common/DemoBadge";
import { BookingPreview } from "@/components/common/BookingPreview";
import { WaitSummary } from "@/components/common/WaitSummary";
import { demoBusiness, formatPrice, professionals, services } from "@/data/demo";

export const Route = createFileRoute("/estabelecimento/$slug")({
  loader: ({ params }) => {
    if (params.slug !== demoBusiness.slug) throw notFound();
    return demoBusiness;
  },
  head: () => ({
    meta: [
      { title: `${demoBusiness.name} (demonstração) · Gestor de Salão` },
      {
        name: "description",
        content: "Exemplo de página pública de estabelecimento no Gestor de Salão.",
      },
      { property: "og:title", content: `${demoBusiness.name} · Gestor de Salão` },
      {
        property: "og:description",
        content: "Exemplo de página pública de estabelecimento no Gestor de Salão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicPage,
});

function PublicPage() {
  const b = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background pb-12">
      <section className="bg-hero px-4 pb-16 pt-6 text-primary-foreground sm:px-6">
        <div className="mx-auto max-w-3xl">
          <DemoBadge label="Estabelecimento fictício" />
          <h1 className="mt-6 text-4xl font-bold">{b.name}</h1>
          <p className="mt-2 opacity-80">{b.tagline}</p>
          <div className="mt-5 flex flex-col gap-2 text-sm opacity-90 sm:flex-row sm:gap-6">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mint" />
              {b.address}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-mint" />
              {b.hours}
            </span>
          </div>
          <BookingPreview />
        </div>
      </section>
      <div className="mx-auto -mt-8 max-w-3xl space-y-6 px-4 sm:px-6">
        <WaitSummary />
        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Serviços</h2>
          <ul className="divide-y">
            {services.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <span>
                  <span className="block font-medium">{s.name}</span>
                  <span className="text-sm text-muted-foreground">{s.durationMin} min</span>
                </span>
                <span className="font-display font-semibold">{formatPrice(s.priceCents)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="mb-4 text-lg font-semibold">Equipe</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {professionals.map((p) => (
              <div key={p.id} className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary font-semibold">
                  {p.initials}
                </span>
                <p className="mt-2 text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.role}</p>
              </div>
            ))}
          </div>
        </section>
        <p className="flex items-center justify-center gap-2 pt-4 text-sm text-muted-foreground">
          Página feita com{" "}
          <Link to="/">
            <Logo className="text-base" />
          </Link>
        </p>
      </div>
    </div>
  );
}
