import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/components/auth/AuthProvider";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => pageHead("Redefinir senha", "Defina uma nova senha para sua conta."),
  component: ResetPassword,
});

export function ResetPassword() {
  const auth = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [linkError] = useState(
    () =>
      typeof window !== "undefined" &&
      (new URLSearchParams(window.location.hash.slice(1)).has("error") ||
        new URLSearchParams(window.location.search).has("error")),
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !auth.session) return;
    if (password.length < 8) {
      setError("Use pelo menos 8 caracteres na nova senha.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const { error } = await getSupabase().auth.updateUser({ password });
      if (error) {
        setError(
          error.code === "same_password"
            ? "Escolha uma senha diferente da anterior."
            : error.code === "weak_password"
              ? "A senha não atende aos requisitos de segurança. Use uma senha mais longa, com letras, números e símbolos."
              : "Não foi possível atualizar a senha. Solicite outro link se este tiver expirado.",
        );
        return;
      }
      setPassword("");
      setConfirmation("");
      setDone(true);
      // End this browser's recovery session so the next access uses the new password.
      await getSupabase().auth.signOut({ scope: "local" });
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <Logo />
        <h1 className="text-2xl font-semibold">Redefinir senha</h1>
        {done ? (
          <>
            <p role="status">
              Senha atualizada com sucesso. Você já pode entrar com sua nova senha.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Voltar ao login</Link>
            </Button>
          </>
        ) : !supabaseConfigured ? (
          <p role="alert">A conexão com o Supabase ainda não foi configurada.</p>
        ) : !auth.ready ? (
          <p role="status">Validando link de recuperação…</p>
        ) : linkError || !auth.session ? (
          <>
            <p role="alert">
              Este link é inválido ou expirou. Solicite um novo link de recuperação.
            </p>
            <ForgotPassword email="" />
            <div>
              <Link to="/login" className="text-sm underline">
                Voltar ao login
              </Link>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escolha uma nova senha com pelo menos 8 caracteres.
            </p>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
                className="h-12"
                visibilityLabel="nova senha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                disabled={pending}
                className="h-12"
                visibilityLabel="confirmação de senha"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Salvando…" : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
