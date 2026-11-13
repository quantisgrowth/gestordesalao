import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, AccessMessage } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import type { Organization } from "@/data/organization";
import { Button } from "@/components/ui/button";

export type Company = Organization & { plan: string | null };
type Value = { companies: Company[]; refresh: () => Promise<unknown> };
const Context = createContext<Value | null>(null);
export function PlatformProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["platform-companies", session?.user.id],
    queryFn: async () => {
      const db = getSupabase();
      const [orgs, subscriptions] = await Promise.all([
        db
          .from("organizations")
          .select("id,name,slug,status,timezone,address,contact_phone,updated_at")
          .order("created_at", { ascending: false }),
        db.from("organization_subscriptions").select("organization_id,plan_code"),
      ]);
      if (orgs.error) throw orgs.error;
      if (subscriptions.error) throw subscriptions.error;
      return (orgs.data as Organization[]).map((org) => ({
        ...org,
        plan: subscriptions.data.find((s) => s.organization_id === org.id)?.plan_code ?? null,
      }));
    },
    retry: false,
  });
  if (query.isPending) return <AccessMessage title="Carregando empresas…" />;
  if (query.isError)
    return (
      <AccessMessage title="Não foi possível carregar as empresas">
        <p>Verifique a conexão e suas permissões administrativas.</p>
        <Button onClick={() => void query.refetch()}>Tentar novamente</Button>
      </AccessMessage>
    );
  return (
    <Context.Provider value={{ companies: query.data, refresh: query.refetch }}>
      {children}
    </Context.Provider>
  );
}
export function usePlatform() {
  const context = useContext(Context);
  if (!context) throw new Error("Administração indisponível.");
  return context;
}
