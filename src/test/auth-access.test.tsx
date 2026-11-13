import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, RequireAuth } from "@/components/auth/AuthProvider";
const state = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  admin: false,
  callback: null as ((event: string, session: { user: { id: string } } | null) => void) | null,
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  Navigate: () => <p>Ir para login</p>,
}));
vi.mock("@/lib/supabase", () => ({
  supabaseConfigured: true,
  getSupabase: () => ({
    auth: {
      onAuthStateChange: (callback: typeof state.callback) => {
        state.callback = callback;
        queueMicrotask(() => callback?.("INITIAL_SESSION", state.session));
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getSession: async () => ({ data: { session: state.session }, error: null }),
    },
    rpc: async () => ({ data: state.admin, error: null }),
  }),
}));
afterEach(() => {
  cleanup();
  state.session = null;
  state.admin = false;
  state.callback = null;
});
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <RequireAuth admin>
          <p>Conteúdo administrativo</p>
        </RequireAuth>
      </AuthProvider>
    </QueryClientProvider>,
  );
  return client;
}
describe("Acesso administrativo", () => {
  it("redireciona visitantes sem exibir conteúdo privado", async () => {
    mount();
    expect(await screen.findByText("Ir para login")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument();
  });
  it("bloqueia usuário autenticado sem papel de administrador", async () => {
    state.session = { user: { id: "user-1" } };
    mount();
    expect(await screen.findByText("Acesso exclusivo do administrador")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument();
  });
  it("limpa consultas privadas ao sair da conta", async () => {
    state.session = { user: { id: "user-1" } };
    state.admin = true;
    const client = mount();
    expect(await screen.findByText("Conteúdo administrativo")).toBeInTheDocument();
    client.setQueryData(["private-data", "user-1"], "dados privados");
    act(() => state.callback?.("SIGNED_OUT", null));
    await waitFor(() => expect(screen.getByText("Ir para login")).toBeInTheDocument());
    expect(client.getQueryData(["private-data", "user-1"])).toBeUndefined();
    expect(screen.queryByText("Conteúdo administrativo")).not.toBeInTheDocument();
  });
});
