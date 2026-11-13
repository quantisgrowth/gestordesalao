import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { AccessMessage } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { DemoBadge } from "@/components/common/DemoBadge";
import { BookingPreview } from "@/components/common/BookingPreview";
import { WaitSummary } from "@/components/common/WaitSummary";
import { demoBusiness, formatPrice, professionals, services } from "@/data/demo";

export const Route = createFileRoute("/estabelecimento/$slug")({
  head: () => ({
    meta: [
      { title: "Estabelecimento · Gestor de Salão" },
      {
        name: "description",
        content: "Página pública de estabelecimento no Gestor de Salão.",
      },
      { property: "og:title", content: "Estabelecimento · Gestor de Salão" },
      {
        property: "og:description",
        content: "Página pública de estabelecimento no Gestor de Salão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicPage,
});

function PublicPage() {
  const { slug } = Route.useParams();
  return slug === "demo" ? <DemoPublicPage /> : <LivePublicPage slug={slug} />;
}

type Catalog = {
  name: string;
  address: string | null;
  contact_phone: string | null;
  services: { id: string; name: string; duration_minutes: number; price_cents: number }[];
  professionals: { id: string; name: string }[];
  queue: { waiting_count: number } | null;
};
function LivePublicPage({ slug }: { slug: string }) {
  const catalog = useQuery({
    queryKey: ["public-catalog", slug],
    enabled: typeof window !== "undefined" && supabaseConfigured,
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("gs_public_catalog", { p_slug: slug });
      if (error) throw error;
      return data as Catalog | null;
    },
    retry: false,
    refetchInterval: 30_000,
  });
  if (!supabaseConfigured)
    return (
      <AccessMessage title="Página indisponível">
        <p>A conexão ainda não foi configurada.</p>
      </AccessMessage>
    );
  if (catalog.isPending) return <AccessMessage title="Carregando estabelecimento…" />;
  if (catalog.isError)
    return (
      <AccessMessage title="Não foi possível carregar a página">
        <Button onClick={() => void catalog.refetch()}>Tentar novamente</Button>
      </AccessMessage>
    );
  if (!catalog.data)
    return (
      <AccessMessage title="Página pública indisponível">
        <p>O estabelecimento não foi encontrado ou ainda não ativou sua página pública.</p>
        <Link to="/">Voltar ao início</Link>
      </AccessMessage>
    );
  const b = catalog.data;
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <Logo />
      <h1 className="text-4xl font-bold">{b.name}</h1>
      {b.address && <p className="text-muted-foreground">{b.address}</p>}
      {b.contact_phone && <p>{b.contact_phone}</p>}
      {b.queue && (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="text-lg font-semibold">Fila presencial</h2>
          <p className="mt-3">{b.queue.waiting_count} pessoa(s) aguardando</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Estimativa de espera indisponível. Para entrar na fila, confirme sua presença com a
            equipe.
          </p>
        </section>
      )}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Serviços</h2>
        {!b.services.length && (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum serviço publicado.</p>
        )}
        <ul className="mt-3 divide-y">
          {b.services.map((s) => (
            <li key={s.id} className="flex justify-between gap-4 py-3">
              <div>
                <p>{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.duration_minutes} min</p>
              </div>
              <span>{formatPrice(s.price_cents)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Equipe</h2>
        <ul className="mt-3 space-y-2">
          {b.professionals.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
        {!b.professionals.length && (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum profissional publicado.</p>
        )}
      </section>
      <p className="text-sm text-muted-foreground">
        Para agendar, entre em contato com o estabelecimento. O agendamento pelo site ainda não está
        disponível.
      </p>
    </div>
  );
}
function DemoPublicPage() {
  const b = demoBusiness;
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
