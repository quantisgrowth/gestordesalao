import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CatalogEditor } from "@/components/common/CatalogEditor";
import { CustomerEditor } from "@/routes/app.clientes";
import { SettingsEditor } from "@/routes/app.configuracoes";
import { Servicos } from "@/routes/app.servicos";
import { normalizePhone, parsePriceCents } from "@/lib/record-forms";
const state = vi.hoisted(() => ({
  context: {
    organization: {
      id: "org-1",
      name: "Barbearia",
      slug: "barbearia",
      timezone: "America/Sao_Paulo",
      address: null,
      contact_phone: null,
      updated_at: "2026-11-13T03:00:00Z",
    },
    settings: {
      specific_queue_enabled: true,
      any_available_queue_enabled: true,
      online_booking_enabled: true,
      public_page_enabled: false,
      public_queue_enabled: true,
      buffer_minutes: 5,
      call_response_minutes: 5,
      lateness_minutes: 10,
      cancellation_hours: 2,
      minimum_booking_lead_minutes: 60,
      maximum_booking_horizon_days: 30,
      updated_at: "2026-11-13T03:00:00Z",
    },
    allServices: [],
    allProfessionals: [{ id: "pro-1", name: "Profissional Teste", active: true }],
    canManageCatalog: true,
    canManageCustomers: true,
    refresh: vi.fn(),
    professionalById: vi.fn(),
  },
  rpc: vi.fn(),
  duplicate: false,
  zeroRows: false,
  updates: [] as {
    table: string;
    payload: Record<string, unknown>;
    filters: [string, unknown][];
  }[],
}));
vi.mock("@/components/layout/OrganizationProvider", () => ({
  useOrganization: () => state.context,
}));
vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({ session: { user: { id: "user-1" } } }),
}));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (config: unknown) => config }));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    rpc: state.rpc,
    from: (table: string) => {
      let update: (typeof state.updates)[number] | undefined;
      const chain = {
        select: () => chain,
        neq: () => chain,
        limit: () => chain,
        eq: (key: string, value: unknown) => {
          update?.filters.push([key, value]);
          return chain;
        },
        update: (payload: Record<string, unknown>) => {
          update = { table, payload, filters: [] };
          state.updates.push(update);
          return chain;
        },
        maybeSingle: async () => ({
          data: state.zeroRows ? null : { id: "org-1", organization_id: "org-1" },
          error: null,
        }),
        then: (resolve: (value: unknown) => void) =>
          resolve({ data: state.duplicate ? [{ id: "another-customer" }] : [], error: null }),
      };
      return chain;
    },
  }),
}));
function mount(node: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  state.context.canManageCatalog = true;
  state.context.canManageCustomers = true;
  state.duplicate = false;
  state.zeroRows = false;
  state.updates = [];
});
function fillCustomer() {
  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Cliente Teste" } });
  fireEvent.change(screen.getByLabelText("Telefone com DDD"), {
    target: { value: "(15) 99999-9999" },
  });
}
describe("Validação dos cadastros", () => {
  it("converte preços em centavos sem arredondamento binário e rejeita formatos ambíguos", () => {
    expect(parsePriceCents("12,34")).toBe(1234);
    expect(parsePriceCents("0.29")).toBe(29);
    expect(parsePriceCents("0")).toBe(0);
    for (const value of ["", "-1", "1.234", "1.000,00", "NaN", "21474836.48"])
      expect(() => parsePriceCents(value)).toThrow();
  });
  it("normaliza DDD brasileiro e preserva número internacional explícito", () => {
    expect(normalizePhone("(15) 99999-9999")).toBe("+5515999999999");
    expect(normalizePhone("+1 (212) 555-0100")).toBe("+12125550100");
    expect(normalizePhone("5515999999999")).toBe("+5515999999999");
    expect(() => normalizePhone("9999")).toThrow();
  });
});
describe("Gravação de serviços e profissionais", () => {
  it("salva serviço e habilitações juntos, com preço exato e empresa explícita", async () => {
    state.rpc.mockImplementation(async (_name, args) => ({ data: args.p_id, error: null }));
    const saved = vi.fn();
    mount(<CatalogEditor kind="service" initial={null} onClose={vi.fn()} onSaved={saved} />);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Corte" } });
    fireEvent.change(screen.getByLabelText("Preço (R$)"), { target: { value: "12,34" } });
    fireEvent.click(screen.getByLabelText("Profissional Teste"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
    expect(state.rpc).toHaveBeenCalledWith(
      "gs_save_service",
      expect.objectContaining({
        p_organization_id: "org-1",
        p_name: "Corte",
        p_price_cents: 1234,
        p_professional_ids: ["pro-1"],
        p_expected_updated_at: null,
      }),
    );
  });
  it("mostra erro de ativação sem confirmar sucesso quando a função não existe", async () => {
    state.rpc.mockResolvedValue({ data: null, error: { code: "PGRST202" } });
    const saved = vi.fn();
    mount(<CatalogEditor kind="professional" initial={null} onClose={vi.fn()} onSaved={saved} />);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Profissional Novo" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("ativado pelo administrador");
    expect(saved).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nome")).toHaveValue("Profissional Novo");
  });
  it("não mostra o cadastro de serviço para perfil sem gestão de catálogo", () => {
    state.context.canManageCatalog = false;
    mount(<Servicos />);
    expect(screen.queryByRole("button", { name: "Novo serviço" })).not.toBeInTheDocument();
  });
});
describe("Clientes", () => {
  it("exige confirmação de telefone compartilhado antes de salvar", async () => {
    state.duplicate = true;
    state.rpc.mockImplementation(async (_name, args) => ({ data: args.p_id, error: null }));
    const saved = vi.fn();
    mount(<CustomerEditor initial={null} onClose={vi.fn()} onSaved={saved} />);
    fillCustomer();
    fireEvent.click(screen.getByRole("button", { name: "Salvar cliente" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("outro cliente com este telefone");
    expect(state.rpc).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar cliente" }));
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
    expect(state.rpc).toHaveBeenCalledWith(
      "gs_save_customer",
      expect.objectContaining({ p_organization_id: "org-1", p_phone: "+5515999999999" }),
    );
  });
  it("impede duplo envio enquanto a gravação aguarda o servidor", async () => {
    let finish: (value: unknown) => void = () => {};
    state.rpc.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const saved = vi.fn();
    mount(<CustomerEditor initial={null} onClose={vi.fn()} onSaved={saved} />);
    fillCustomer();
    const form = screen.getByLabelText("Nome").closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    await waitFor(() => expect(state.rpc).toHaveBeenCalledTimes(1));
    finish({ data: state.rpc.mock.calls[0]![1].p_id, error: null });
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
  });
  it("mantém o cadastro aberto quando o servidor rejeita o acesso", async () => {
    state.rpc.mockResolvedValue({ data: null, error: { code: "42501" } });
    const saved = vi.fn();
    mount(<CustomerEditor initial={null} onClose={vi.fn()} onSaved={saved} />);
    fillCustomer();
    fireEvent.click(screen.getByRole("button", { name: "Salvar cliente" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("não permite salvar");
    expect(saved).not.toHaveBeenCalled();
  });
});
describe("Configurações", () => {
  it("salva somente colunas permitidas e usa versão para detectar conflito", async () => {
    const saved = vi.fn();
    mount(<SettingsEditor kind="policies" onClose={vi.fn()} onSaved={saved} />);
    fireEvent.change(screen.getByLabelText("Intervalo entre atendimentos (min)"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
    expect(state.updates[0]?.table).toBe("settings");
    expect(state.updates[0]?.payload["buffer_minutes"]).toBe(10);
    expect(state.updates[0]?.filters).toEqual([
      ["organization_id", "org-1"],
      ["updated_at", "2026-11-13T03:00:00Z"],
    ]);
    for (const forbidden of ["call_response_minutes", "remote_queue_enabled", "roles", "slug"])
      expect(state.updates[0]?.payload).not.toHaveProperty(forbidden);
  });
  it("não confirma sucesso se o update não alterou nenhuma linha", async () => {
    state.zeroRows = true;
    const saved = vi.fn();
    mount(<SettingsEditor kind="business" onClose={vi.fn()} onSaved={saved} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("reabra o cadastro");
    expect(saved).not.toHaveBeenCalled();
  });
});
