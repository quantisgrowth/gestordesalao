import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrganizationProvider, useOrganization } from "@/components/layout/OrganizationProvider";

const state = vi.hoisted(() => ({ fail: false, calls: [] as { table: string; org?: string }[] }));
vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({ session: { user: { id: "user-1" } }, isAdmin: false }),
  AccessMessage: ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
  SignOutButton: () => <button>Sair</button>,
}));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: (table: string) => {
      let org: string | undefined;
      const chain = {
        select: () => chain,
        eq: (column: string, value: string) => {
          if (column === "organization_id") org = value;
          return chain;
        },
        in: () => chain,
        order: () => chain,
        gte: () => chain,
        lt: () => chain,
        single: () => chain,
        then: (resolve: (result: unknown) => void) => {
          state.calls.push({ table, ...(org ? { org } : {}) });
          const data =
            table === "memberships"
              ? [{ organization_id: "one" }, { organization_id: "two" }]
              : table === "organizations"
                ? ["one", "two"].map((id) => ({
                    id,
                    name: id,
                    slug: id,
                    status: "active",
                    timezone: "America/Sao_Paulo",
                  }))
                : table === "services"
                  ? [
                      {
                        id: `service-${org}`,
                        name: `Serviço ${org}`,
                        duration_minutes: 30,
                        price_cents: 5000,
                      },
                    ]
                  : table === "settings"
                    ? { buffer_minutes: 5 }
                    : [];
          resolve({
            data: state.fail && table === "services" ? null : data,
            error: state.fail && table === "services" ? { message: "permission denied" } : null,
          });
        },
      };
      return chain;
    },
  }),
}));
function Probe() {
  const { organization, services, selectOrganization } = useOrganization();
  return (
    <>
      <h1>Empresa {organization.id}</h1>
      <p>{services[0]?.name}</p>
      <button onClick={() => selectOrganization("two")}>Trocar empresa</button>
    </>
  );
}
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <OrganizationProvider>
        <Probe />
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}
afterEach(() => {
  cleanup();
  state.fail = false;
  state.calls = [];
});
describe("Dados da empresa", () => {
  it("consulta somente o estabelecimento selecionado e limpa a visualização ao trocar", async () => {
    mount();
    expect(await screen.findByText("Serviço one")).toBeInTheDocument();
    for (const call of state.calls.filter(
      (c) => !["memberships", "organizations"].includes(c.table),
    ))
      expect(call.org).toBe("one");
    fireEvent.click(screen.getByText("Trocar empresa"));
    expect(await screen.findByText("Serviço two")).toBeInTheDocument();
    expect(screen.queryByText("Serviço one")).not.toBeInTheDocument();
    expect(state.calls.filter((c) => c.table === "services").map((c) => c.org)).toEqual([
      "one",
      "two",
    ]);
  });
  it("mostra erro de consulta sem substituir dados por exemplos", async () => {
    state.fail = true;
    mount();
    await waitFor(() =>
      expect(screen.getByText("Não foi possível carregar os dados")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Empresa one")).not.toBeInTheDocument();
    expect(screen.queryByText("Estúdio Exemplo")).not.toBeInTheDocument();
  });
});
