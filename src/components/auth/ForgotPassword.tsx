import { useState, type FormEvent } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function ForgotPassword({ email: initialEmail }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: new URL("/redefinir-senha", window.location.origin).href,
      });
      if (error) {
        setError(
          error.status === 429
            ? "Muitas tentativas. Aguarde alguns minutos antes de solicitar outro link."
            : "Não foi possível solicitar o link. Tente novamente em alguns instantes.",
        );
      } else {
        setSent(true);
      }
    } catch {
      setError("Não foi possível conectar. Verifique sua conexão e tente novamente.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Button
        type="button"
        variant="link"
        className="px-0"
        disabled={!supabaseConfigured}
        onClick={() => {
          setEmail(initialEmail);
          setError("");
          setSent(false);
          setOpen(true);
        }}
      >
        Esqueci minha senha
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!pending) setOpen(value);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>
              Informe seu e-mail para receber um link de recuperação.
            </DialogDescription>
          </DialogHeader>
          {sent ? (
            <div className="space-y-4">
              <p role="status" className="text-sm">
                Se houver uma conta cadastrada com esse e-mail, você receberá um link para redefinir
                sua senha. Confira também a caixa de spam.
              </p>
              <Button type="button" className="w-full" onClick={() => setOpen(false)}>
                Voltar ao login
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">E-mail da conta</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  disabled={pending}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Solicitando…" : "Enviar link de recuperação"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
