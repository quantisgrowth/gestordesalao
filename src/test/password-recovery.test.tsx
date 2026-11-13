import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { ResetPassword } from "@/routes/redefinir-senha";
const state = vi.hoisted(() => ({
  session: { user: { id: "user-1" } } as { user: { id: string } } | null,
  reset: vi.fn(),
  update: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/supabase", () => ({
  supabaseConfigured: true,
  getSupabase: () => ({
    auth: { resetPasswordForEmail: state.reset, updateUser: state.update, signOut: state.signOut },
  }),
}));
vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({ ready: true, session: state.session }),
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  state.session = { user: { id: "user-1" } };
  window.history.replaceState(null, "", "/");
});
describe("Recuperação de senha", () => {
  it("permite mostrar e ocultar a senha sem submeter o formulário", () => {
    const submit = vi.fn();
    render(
      <form onSubmit={submit}>
        <label htmlFor="password">Senha</label>
        <PasswordInput id="password" defaultValue="SenhaExemplo123" />
      </form>,
    );
    const input = screen.getByLabelText("Senha");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("SenhaExemplo123");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(input).toHaveAttribute("type", "password");
    expect(submit).not.toHaveBeenCalled();
  });
  it("solicita o link para o e-mail informado e a rota de redefinição", async () => {
    state.reset.mockResolvedValue({ error: null });
    render(<ForgotPassword email="felipe@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: "Esqueci minha senha" }));
    expect(screen.getByLabelText("E-mail da conta")).toHaveValue("felipe@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Enviar link de recuperação" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Se houver uma conta cadastrada");
    expect(state.reset).toHaveBeenCalledWith("felipe@example.com", {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
  });
  it("trata limite de envio sem afirmar que o e-mail foi enviado", async () => {
    state.reset.mockResolvedValue({ error: { status: 429 } });
    render(<ForgotPassword email="felipe@example.com" />);
    fireEvent.click(screen.getByRole("button", { name: "Esqueci minha senha" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar link de recuperação" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Muitas tentativas");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  it("bloqueia redefinição sem uma sessão válida", () => {
    state.session = null;
    render(<ResetPassword />);
    expect(screen.getByRole("alert")).toHaveTextContent("inválido ou expirou");
    expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
    expect(state.update).not.toHaveBeenCalled();
  });
  it("rejeita link expirado mesmo se houver sessão anterior", () => {
    window.history.replaceState(
      null,
      "",
      "/redefinir-senha#error=access_denied&error_code=otp_expired",
    );
    render(<ResetPassword />);
    expect(screen.getByRole("alert")).toHaveTextContent("inválido ou expirou");
    expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
  });
  it("exige confirmação igual antes de atualizar", () => {
    render(<ResetPassword />);
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "NovaSenha123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
      target: { value: "OutraSenha123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
    expect(screen.getByRole("alert")).toHaveTextContent("não coincidem");
    expect(state.update).not.toHaveBeenCalled();
  });
  it("atualiza a senha e encerra a sessão local após sucesso", async () => {
    state.update.mockResolvedValue({ error: null });
    state.signOut.mockResolvedValue({ error: null });
    render(<ResetPassword />);
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "NovaSenha123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
      target: { value: "NovaSenha123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Senha atualizada com sucesso");
    expect(state.update).toHaveBeenCalledWith({ password: "NovaSenha123" });
    expect(state.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("mantém o formulário aberto quando o servidor rejeita a senha", async () => {
    state.update.mockResolvedValue({ error: { code: "weak_password" } });
    render(<ResetPassword />);
    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "NovaSenha123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
      target: { value: "NovaSenha123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("não atende aos requisitos");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(state.signOut).not.toHaveBeenCalled();
  });
});
