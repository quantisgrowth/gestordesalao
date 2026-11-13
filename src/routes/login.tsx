import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => pageHead("Entrar", "Acesse o painel do seu estabelecimento no Gestor de Salão."),
  component: Login,
});

function Login() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error)
        setError(
          error.code === "invalid_credentials"
            ? "E-mail ou senha incorretos."
            : error.code === "email_not_confirmed"
              ? "Confirme seu e-mail antes de entrar."
              : "Não foi possível entrar. Verifique sua conexão e tente novamente.",
        );
    } catch {
      setError("Não foi possível conectar ao serviço de login.");
    } finally {
      setPending(false);
    }
  }
  if (auth.ready && auth.session && !auth.accessLoading && !auth.accessError)
    return <Navigate to={auth.isAdmin ? "/admin" : "/app"} replace />;
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-hero p-12 text-primary-foreground md:flex md:flex-col md:justify-between">
        <Logo tone="light" />
        <h2 className="max-w-sm text-4xl font-bold leading-tight">
          Seu negócio no <span className="text-mint">ritmo certo.</span>
        </h2>
        <p className="text-sm opacity-60">© Gestor de Salão</p>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden">
            <Logo />
          </Link>
          <h1 className="mt-8 text-2xl font-semibold md:mt-0">Entrar</h1>
          <p className="mt-1 text-muted-foreground">Acesse o painel do seu estabelecimento.</p>
          {!supabaseConfigured && (
            <p role="alert" className="mt-6 text-sm text-destructive">
              A conexão com o Supabase ainda não foi configurada.
            </p>
          )}
          {(error || auth.error) && (
            <p role="alert" className="mt-6 text-sm text-destructive">
              {error || auth.error}
            </p>
          )}
          {auth.accessError && (
            <div role="alert" className="mt-6 text-sm text-destructive">
              Não foi possível verificar suas permissões.{" "}
              <button onClick={auth.retryAccess} className="underline">
                Tentar novamente
              </button>
            </div>
          )}
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                className="h-12"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={pending || !supabaseConfigured}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                className="h-12"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending || !supabaseConfigured}
              />
            </div>
            <Button
              type="submit"
              size="xl"
              className="w-full"
              disabled={pending || !supabaseConfigured || auth.accessLoading}
            >
              {pending || auth.accessLoading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
          <Button asChild variant="link" className="mt-4 w-full">
            <Link to="/aplicativos">Ver as prévias dos aplicativos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
