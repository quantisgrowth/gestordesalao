import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Building2, Mail, ShieldCheck } from "lucide-react";
import { usePlatformDemo } from "@/components/admin/DemoPlatformContext";
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
import { demoCompanyForm, type DemoCompany } from "@/data/demo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/empresas")({
  head: () =>
    pageHead("Empresas e acessos", "Cadastro demonstrativo de empresas e gestores da plataforma."),
  component: Companies,
});
const statusLabels = {
  ativa: "Ativa",
  convite_pendente: "Aguardando ativação",
  suspensa: "Suspensa",
} as const;
function Companies() {
  const { companies, addCompany } = usePlatformDemo();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    ...demoCompanyForm,
    plan: "Essencial" as DemoCompany["plan"],
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<DemoCompany | null>(null);
  const filtered = companies.filter((company) =>
    `${company.name} ${company.email} ${company.slug}`
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = draft.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError("Use apenas letras sem acento, números e hífens no identificador.");
      return;
    }
    if (companies.some((company) => company.slug === slug)) {
      setError("Já existe uma empresa com esse identificador nesta demonstração.");
      return;
    }
    if (!draft.name.trim() || !draft.owner.trim()) {
      setError("Informe o nome da empresa e do gestor.");
      return;
    }
    addCompany({
      ...draft,
      name: draft.name.trim(),
      owner: draft.owner.trim(),
      email: draft.email.trim().toLowerCase(),
      slug,
      id: crypto.randomUUID(),
      status: "convite_pendente",
      professionalsCount: 0,
    });
    setMessage(
      "Empresa adicionada somente à demonstração. Nenhum usuário foi criado e nenhum convite foi enviado.",
    );
    setError("");
    setOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Empresas e acessos"
        description="Cada empresa terá seu gestor e sua operação separada."
        actions={
          <Button
            size="lg"
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nova empresa · simular
          </Button>
        }
      />
      {message && (
        <p role="status" className="mb-5 rounded-xl bg-accent p-4 text-sm text-accent-foreground">
          {message}
        </p>
      )}
      <div className="mb-6 max-w-md">
        <Label htmlFor="company-search">Buscar empresa ou login</Label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="company-search"
            className="h-12 pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, identificador ou e-mail fictício"
          />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((company) => (
          <Panel key={company.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-mint">
                  <Building2 className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-semibold">{company.name}</h2>
                <p className="text-xs text-muted-foreground">/{company.slug}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${company.status === "ativa" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {statusLabels[company.status]}
              </span>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Gestor</dt>
                <dd className="mt-1">{company.owner}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Plano ilustrativo</dt>
                <dd className="mt-1">{company.plan}</dd>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Login principal</dt>
                <dd className="mt-1 break-all">{company.email}</dd>
              </div>
            </dl>
            <Button variant="outline" className="mt-5" onClick={() => setSelected(company)}>
              Ver empresa e acesso
            </Button>
          </Panel>
        ))}
      </div>
      {!filtered.length && (
        <p className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Nenhuma empresa encontrada.
        </p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova empresa</DialogTitle>
            <DialogDescription>
              Use dados fictícios para explorar o cadastro. O acesso real será ativado por convite
              para o gestor definir sua senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-company-name">Nome da empresa</Label>
              <Input
                id="new-company-name"
                required
                maxLength={100}
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-company-slug">Identificador da empresa</Label>
              <Input
                id="new-company-slug"
                required
                maxLength={60}
                value={draft.slug}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, slug: event.target.value }))
                }
                aria-describedby="slug-help"
              />
              <p id="slug-help" className="text-xs text-muted-foreground">
                Será usado no link público. Exemplo: novo-salao-exemplo.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-company-owner">Nome do gestor</Label>
              <Input
                id="new-company-owner"
                required
                maxLength={100}
                value={draft.owner}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, owner: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-company-email">Login do gestor (e-mail)</Label>
              <Input
                id="new-company-email"
                type="email"
                required
                maxLength={150}
                autoComplete="off"
                value={draft.email}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, email: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-company-plan">Plano ilustrativo</Label>
              <select
                id="new-company-plan"
                className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                value={draft.plan}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    plan: event.target.value as DemoCompany["plan"],
                  }))
                }
              >
                <option>Essencial</option>
                <option>Profissional</option>
              </select>
            </div>
            <div className="rounded-xl bg-accent p-4 text-sm text-accent-foreground">
              <p className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4" /> Senha definida pelo gestor
              </p>
              <p className="mt-2">
                O fluxo real enviará um convite de uso único para criação da senha. O administrador
                não precisa conhecer nem guardar essa senha.
              </p>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg">
              Adicionar empresa à demonstração
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={selected !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              Dados fictícios e situação do acesso desta empresa.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <p>
                <strong>Gestor:</strong> {selected.owner}
              </p>
              <p className="break-all">
                <strong>Login:</strong> {selected.email}
              </p>
              <p>
                <strong>Senha:</strong> definida pelo gestor via convite seguro.
              </p>
              <p>
                <strong>Situação:</strong> {statusLabels[selected.status]}
              </p>
              <p>
                <strong>Equipe no exemplo:</strong> {selected.professionalsCount} profissionais.
              </p>
              <p className="rounded-xl bg-accent p-3 text-accent-foreground">
                A autenticação real ainda não está conectada. Este cadastro não permite entrar em
                uma conta.
              </p>
              <Button disabled className="w-full">
                <Mail className="mr-2 h-4 w-4" /> Enviar convite · em breve
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
