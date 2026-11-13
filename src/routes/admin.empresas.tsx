import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Building2 } from "lucide-react";
import { usePlatform } from "@/components/admin/PlatformProvider";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
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
import { getSupabase } from "@/lib/supabase";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/empresas")({
  head: () => pageHead("Empresas e acessos", "Estabelecimentos cadastrados na plataforma."),
  component: Companies,
});
const statuses = { trial: "Em teste", active: "Ativa", suspended: "Suspensa", closed: "Encerrada" };
const emptyDraft = { name: "", slug: "", email: "", plan: "essencial" };
function Companies() {
  const { companies, refresh } = usePlatform();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const filtered = companies.filter((c) =>
    `${c.name} ${c.slug}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")),
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const slug = draft.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 2) {
      setError("Use de 2 a 60 letras sem acento, números e hífens no identificador.");
      return;
    }
    if (companies.some((c) => c.slug === slug)) {
      setError("Já existe uma empresa com esse identificador.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const { error } = await getSupabase().rpc("gs_create_organization", {
        p_name: draft.name.trim(),
        p_slug: slug,
        p_owner_email: draft.email.trim().toLowerCase(),
        p_plan_code: draft.plan,
      });
      if (error) {
        setError(
          error.code === "23505"
            ? "Este identificador já está em uso."
            : error.code === "42501"
              ? "Seu usuário não tem permissão para cadastrar empresas."
              : error.code === "P0001"
                ? error.message
                : "Não foi possível cadastrar. Verifique a conexão e tente novamente.",
        );
        return;
      }
      setOpen(false);
      setDraft(emptyDraft);
      setMessage(
        "Empresa cadastrada e vinculada ao gestor. Ele já pode entrar com sua conta existente.",
      );
      await refresh();
    } catch {
      setError(
        "Não foi possível confirmar o cadastro. Atualize a lista antes de tentar novamente.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <PageHeader
        title="Empresas e acessos"
        description="Empresas reais cadastradas na plataforma."
        actions={
          <Button
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nova empresa
          </Button>
        }
      />
      {message && (
        <p role="status" className="mb-5 rounded-xl bg-accent p-4 text-sm">
          {message}
        </p>
      )}
      <div className="mb-6 max-w-md">
        <Label htmlFor="company-search">Buscar empresa</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="company-search"
            className="h-12 pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome ou identificador"
          />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((c) => (
          <Panel key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Building2 className="mb-3 h-6 w-6 text-forest" />
                <h2 className="text-lg font-semibold">{c.name}</h2>
                <p className="text-xs text-muted-foreground">/{c.slug}</p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs">{statuses[c.status]}</span>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Plano</dt>
                <dd>
                  {c.plan === "essencial"
                    ? "Essencial"
                    : c.plan === "profissional"
                      ? "Profissional"
                      : (c.plan ?? "Não informado")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ID da empresa</dt>
                <dd className="break-all">{c.id}</dd>
              </div>
            </dl>
          </Panel>
        ))}
      </div>
      {!filtered.length && (
        <p className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          {companies.length
            ? "Nenhuma empresa encontrada."
            : "Nenhuma empresa cadastrada. Cadastre o primeiro estabelecimento."}
        </p>
      )}
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!pending) setOpen(value);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova empresa</DialogTitle>
            <DialogDescription>
              O gestor precisa ter um usuário com e-mail confirmado no Supabase Auth. Este cadastro
              cria a empresa e vincula esse usuário; não envia convite.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da empresa</Label>
              <Input
                id="company-name"
                required
                maxLength={120}
                value={draft.name}
                disabled={pending}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-slug">Identificador</Label>
              <Input
                id="company-slug"
                required
                minLength={2}
                maxLength={60}
                value={draft.slug}
                disabled={pending}
                placeholder="barbearia-avangers"
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-email">E-mail do gestor já cadastrado</Label>
              <Input
                id="owner-email"
                type="email"
                required
                value={draft.email}
                disabled={pending}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-plan">Plano</Label>
              <select
                id="company-plan"
                className="h-12 w-full rounded-md border bg-background px-3"
                value={draft.plan}
                disabled={pending}
                onChange={(e) => setDraft({ ...draft, plan: e.target.value })}
              >
                <option value="essencial">Essencial</option>
                <option value="profissional">Profissional</option>
              </select>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Cadastrando…" : "Cadastrar empresa"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
