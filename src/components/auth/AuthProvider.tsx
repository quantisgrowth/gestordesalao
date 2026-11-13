import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type Auth = {
  session: Session | null;
  ready: boolean;
  error: string;
  isAdmin: boolean;
  accessLoading: boolean;
  accessError: boolean;
  retryAccess: () => void;
};
const Context = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const cache = useQueryClient();
  const userId = useRef<string | undefined>(undefined);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }
    const supabase = getSupabase();
    // The callback is synchronous: database calls happen in a separate query below.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      if (userId.current !== next?.user.id) cache.clear();
      userId.current = next?.user.id;
      setError("");
      setSession(next);
      setReady(true);
    });
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data, error: failure }) => {
        if (!active) return;
        if (failure) setError("Não foi possível recuperar a sessão. Entre novamente.");
        // Session state is owned by the SDK event, preventing a stale response after logout.
        setReady(true);
      })
      .catch(() => {
        if (active) {
          setError("Não foi possível conectar ao serviço de autenticação.");
          setReady(true);
        }
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [cache]);
  const access = useQuery({
    queryKey: ["platform-access", session?.user.id],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await getSupabase().rpc("gs_is_platform_admin");
      if (error) throw error;
      return data === true;
    },
    retry: false,
  });
  return (
    <Context.Provider
      value={{
        session,
        ready,
        error,
        isAdmin: access.data === true,
        accessLoading: Boolean(session) && access.isPending,
        accessError: access.isError,
        retryAccess: () => {
          void access.refetch();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("Autenticação indisponível.");
  return value;
}

export function AccessMessage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}

export function RequireAuth({ admin = false, children }: { admin?: boolean; children: ReactNode }) {
  const auth = useAuth();
  if (!supabaseConfigured)
    return (
      <AccessMessage title="Conexão pendente">
        <p>Configure a conexão com o Supabase para acessar os dados da sua empresa.</p>
        <Link to="/login">Voltar ao login</Link>
      </AccessMessage>
    );
  if (!auth.ready) return <AccessMessage title="Verificando acesso…" />;
  if (!auth.session) return <Navigate to="/login" replace />;
  if (auth.accessLoading) return <AccessMessage title="Verificando permissões…" />;
  if (auth.accessError)
    return (
      <AccessMessage title="Não foi possível verificar o acesso">
        <p>Confira sua conexão e a instalação das funções do banco.</p>
        <Button onClick={auth.retryAccess}>Tentar novamente</Button>
        <SignOutButton />
      </AccessMessage>
    );
  if (admin && !auth.isAdmin)
    return (
      <AccessMessage title="Acesso exclusivo do administrador">
        <Link to="/app">Ir para meu estabelecimento</Link>
        <SignOutButton />
      </AccessMessage>
    );
  return children;
}

export function SignOutButton() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function signOut() {
    setPending(true);
    const { error } = await getSupabase().auth.signOut();
    setPending(false);
    if (error) setError("Não foi possível sair. Tente novamente.");
  }
  return (
    <div>
      <Button variant="outline" disabled={pending} onClick={() => void signOut()}>
        {pending ? "Saindo…" : "Sair da conta"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
