import { createContext, useContext, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAuth, AccessMessage, SignOutButton } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  localDay,
  localTime,
  type Organization,
  type Professional,
  type Service,
  type Appointment,
  type QueueEntry,
  type Settings,
} from "@/data/organization";

type Data = {
  professionals: Professional[];
  services: Service[];
  appointments: Appointment[];
  queue: QueueEntry[];
  settings: Settings;
  dateLabel: string;
};
type Value = Data & {
  organization: Organization;
  organizations: Organization[];
  selectOrganization: (id: string) => void;
  serviceById: (id: string) => Service | undefined;
  professionalById: (id: string) => Professional | undefined;
};
const Context = createContext<Value | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { session, isAdmin } = useAuth();
  const [selected, setSelected] = useState("");
  const orgs = useQuery({
    queryKey: ["my-organizations", session?.user.id],
    queryFn: async () => {
      const db = getSupabase();
      const memberships = await db
        .from("memberships")
        .select("organization_id")
        .eq("user_id", session!.user.id)
        .eq("active", true);
      if (memberships.error) throw memberships.error;
      if (!memberships.data.length) return [];
      const result = await db
        .from("organizations")
        .select("id,name,slug,status,timezone,address,contact_phone")
        .in(
          "id",
          memberships.data.map((m) => m.organization_id),
        )
        .in("status", ["active", "trial"])
        .order("name");
      if (result.error) throw result.error;
      return result.data as Organization[];
    },
    retry: false,
  });
  const organization = orgs.data?.find((o) => o.id === selected) ?? orgs.data?.[0];
  const day = organization ? localDay(new Date(), organization.timezone) : "";
  const data = useQuery({
    queryKey: ["organization-data", session?.user.id, organization?.id, day],
    enabled: Boolean(organization),
    refetchInterval: 30_000,
    queryFn: async (): Promise<Data> => {
      const db = getSupabase();
      const org = organization!;
      const query = (table: string) => db.from(table).select("*").eq("organization_id", org.id);
      const now = new Date();
      const results = await Promise.all([
        query("professionals").eq("active", true).order("name"),
        query("services").eq("active", true).order("name"),
        query("professional_services").eq("active", true),
        query("appointments")
          .gte("start_at", new Date(now.getTime() - 36 * 3600_000).toISOString())
          .lt("start_at", new Date(now.getTime() + 36 * 3600_000).toISOString())
          .order("start_at"),
        query("queue_entries")
          .in("status", ["waiting", "called", "in_service"])
          .order("priority_rank")
          .order("arrived_at")
          .order("id"),
        db.from("customers").select("id,display_name").eq("organization_id", org.id),
        query("settings").single(),
      ]);
      for (const result of results) if (result.error) throw result.error;
      const [pros, services, links, appointments, queue, customers, settings] = results;
      const customerName = (id: string) =>
        customers!.data!.find((c: { id: string }) => c.id === id)?.display_name ?? "Cliente";
      const statuses = {
        available: "disponivel",
        busy: "atendendo",
        calling: "chamando",
        paused: "pausa",
        offline: "offline",
      } as const;
      return {
        professionals: pros!.data!.map((p) => ({
          id: p.id,
          organizationId: org.id,
          name: p.name,
          role: "Profissional",
          status: statuses[p.availability_status as keyof typeof statuses] ?? "offline",
          initials: p.name
            .split(/\s+/)
            .map((n: string) => n[0])
            .slice(0, 2)
            .join(""),
          serviceIds: links!
            .data!.filter((l) => l.professional_id === p.id)
            .map((l) => l.service_id),
        })),
        services: services!.data!.map((s) => ({
          id: s.id,
          organizationId: org.id,
          name: s.name,
          durationMin: s.duration_minutes,
          priceCents: s.price_cents,
          category: "Serviço",
        })),
        appointments: appointments!
          .data!.filter((a) => localDay(a.start_at, org.timezone) === day)
          .map((a) => ({
            id: a.id,
            time: localTime(a.start_at, org.timezone),
            client: customerName(a.customer_id),
            professionalId: a.professional_id,
            serviceId: a.service_id,
            status: a.status,
          })),
        queue: queue!.data!.map((q) => ({
          id: q.id,
          client: customerName(q.customer_id),
          serviceId: q.service_id,
          preferredProfessionalId: q.preferred_professional_id,
          assignedProfessionalId: q.assigned_professional_id,
          status: q.status,
          arrivedAt: localTime(q.arrived_at, org.timezone),
          calledAt: q.called_at ? localTime(q.called_at, org.timezone) : undefined,
          waitingMin: Math.max(
            0,
            Math.floor(
              (new Date(q.called_at ?? q.started_at ?? now).getTime() -
                new Date(q.arrived_at).getTime()) /
                60_000,
            ),
          ),
        })),
        settings: settings!.data as unknown as Settings,
        dateLabel: new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "full",
          timeZone: org.timezone,
        }).format(now),
      };
    },
    retry: false,
  });
  if (orgs.isError || data.isError)
    return (
      <AccessMessage title="Não foi possível carregar os dados">
        <p>Confira a conexão e as permissões da empresa. Nenhum dado de exemplo será exibido.</p>
        <Button
          onClick={() => {
            void orgs.refetch();
            void data.refetch();
          }}
        >
          Tentar novamente
        </Button>
        <SignOutButton />
      </AccessMessage>
    );
  if (orgs.isPending) return <AccessMessage title="Carregando seus estabelecimentos…" />;
  if (!organization)
    return (
      <AccessMessage title="Nenhum estabelecimento vinculado">
        <p>
          Seu usuário ainda não tem acesso a uma empresa ativa. Peça ao administrador para concluir
          o cadastro e o vínculo.
        </p>
        {isAdmin && <Link to="/admin/empresas">Gerenciar empresas</Link>}
        <SignOutButton />
      </AccessMessage>
    );
  if (!data.data) return <AccessMessage title="Carregando dados do estabelecimento…" />;
  return (
    <Context.Provider
      value={{
        ...data.data,
        organization,
        organizations: orgs.data ?? [],
        selectOrganization: setSelected,
        serviceById: (id) => data.data.services.find((s) => s.id === id),
        professionalById: (id) => data.data.professionals.find((p) => p.id === id),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useOrganization() {
  const value = useContext(Context);
  if (!value) throw new Error("Selecione um estabelecimento para continuar.");
  return value;
}
