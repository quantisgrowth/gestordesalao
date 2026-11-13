import { useDeferredValue, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOrganization } from "@/components/layout/OrganizationProvider";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel, StatusPill } from "@/components/common/Panel";
import { SaveFeedback } from "@/components/common/SaveFeedback";
import { useRecordSave } from "@/hooks/use-record-save";
import { getSupabase } from "@/lib/supabase";
import { normalizePhone } from "@/lib/record-forms";
import { pageHead } from "@/lib/seo";
import type { Customer, Appointment, QueueEntry } from "@/data/organization";
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
export const Route = createFileRoute("/app/clientes")({
  head: () => pageHead("Clientes", "Cadastro e histórico dos clientes do estabelecimento."),
  component: Clientes,
});

export function Clientes() {
  const { organization, canManageCustomers } = useOrganization();
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const search = useDeferredValue(query);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [history, setHistory] = useState<Customer | null>(null);
  const [message, setMessage] = useState("");
  const list = useQuery({
    queryKey: ["customers", session?.user.id, organization.id, search, page],
    enabled: canManageCustomers,
    queryFn: async () => {
      let request = getSupabase()
        .from("customers")
        .select("id,display_name,phone_e164,updated_at", { count: "exact" })
        .eq("organization_id", organization.id);
      // Only letters/digits/spaces enter the PostgREST filter expression, never its syntax.
      const text = search
        .trim()
        .replace(/[^\p{L}\p{N} +]/gu, "")
        .slice(0, 100);
      const digits = text.replace(/\D/g, "");
      if (text)
        request = digits
          ? request.or(`display_name.ilike.%${text}%,phone_e164.ilike.%${digits}%`)
          : request.ilike("display_name", `%${text}%`);
      const { data, count, error } = await request
        .order("display_name")
        .order("id")
        .range(page * 50, page * 50 + 49);
      if (error) throw error;
      return { customers: data as Customer[], total: count ?? 0 };
    },
    retry: false,
  });
  if (!canManageCustomers)
    return (
      <Panel title="Acesso restrito">
        <p>O cadastro de clientes está disponível ao proprietário, gestor e recepção.</p>
      </Panel>
    );
  return (
    <>
      <PageHeader
        title="Clientes"
        description="Cadastre, localize e consulte o histórico de atendimento."
        actions={
          <Button
            onClick={() => {
              setSelected(null);
              setEditing(true);
              setMessage("");
            }}
          >
            <UserPlus /> Novo cliente
          </Button>
        }
      />
      <SaveFeedback message={message} />
      <Input
        className="mb-5 max-w-md"
        aria-label="Buscar cliente"
        value={query}
        maxLength={100}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
        placeholder="Buscar por nome ou telefone"
      />
      <Panel>
        {list.isPending ? (
          <p role="status">Carregando clientes…</p>
        ) : list.isError ? (
          <div role="alert">
            <p>Não foi possível carregar os clientes.</p>
            <Button variant="outline" className="mt-3" onClick={() => void list.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            {!list.data?.customers.length && (
              <p className="py-4 text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
            )}
            <ul className="divide-y">
              {list.data?.customers.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium">{c.display_name}</h2>
                    <p className="text-sm text-muted-foreground">{c.phone_e164}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelected(c);
                      setEditing(true);
                      setMessage("");
                    }}
                  >
                    Editar
                  </Button>
                  <Button variant="ghost" onClick={() => setHistory(c)}>
                    Histórico
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p>
                {list.data?.total ?? 0} cliente(s) · Página {page + 1}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 0 || list.isFetching}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={(page + 1) * 50 >= (list.data?.total ?? 0) || list.isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </Panel>
      {editing && (
        <CustomerEditor
          initial={selected}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setMessage("Cliente salvo com sucesso.");
          }}
        />
      )}
      {history && <CustomerHistory customer={history} onClose={() => setHistory(null)} />}
    </>
  );
}

export function CustomerEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { organization, canManageCustomers } = useOrganization();
  const action = useRecordSave();
  const [id] = useState(() => initial?.id ?? crypto.randomUUID());
  const [version] = useState(initial?.updated_at ?? null);
  const [name, setName] = useState(initial?.display_name ?? "");
  const [phone, setPhone] = useState(initial?.phone_e164 ?? "");
  const [duplicate, setDuplicate] = useState(false);
  const [allowShared, setAllowShared] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canManageCustomers) return;
    void action.save(async () => {
      if (!name.trim()) throw new Error("Informe o nome do cliente.");
      const normalized = normalizePhone(phone);
      const similar = await getSupabase()
        .from("customers")
        .select("id")
        .eq("organization_id", organization.id)
        .eq("phone_e164", normalized)
        .neq("id", id)
        .limit(1);
      if (similar.error) throw similar.error;
      if (similar.data.length && !allowShared) {
        setDuplicate(true);
        throw new Error(
          "Já existe outro cliente com este telefone. Confira o cadastro ou confirme que o número é compartilhado.",
        );
      }
      const { data, error } = await getSupabase().rpc("gs_save_customer", {
        p_organization_id: organization.id,
        p_id: id,
        p_name: name.trim(),
        p_phone: normalized,
        p_expected_updated_at: version,
      });
      if (error) throw error;
      if (data !== id)
        throw new Error(
          "Não foi possível confirmar a gravação. Atualize a lista antes de tentar novamente.",
        );
    }, onSaved);
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !action.pending) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>
            Nome e telefone são usados para identificar o cliente nos atendimentos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Nome</Label>
            <Input
              id="customer-name"
              required
              maxLength={100}
              value={name}
              disabled={action.pending}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Telefone com DDD</Label>
            <Input
              id="customer-phone"
              type="tel"
              autoComplete="tel"
              required
              maxLength={30}
              placeholder="(15) 99999-9999"
              value={phone}
              disabled={action.pending}
              onChange={(e) => {
                setPhone(e.target.value);
                setDuplicate(false);
                setAllowShared(false);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Para números de outro país, informe + e o código internacional.
            </p>
          </div>
          {duplicate && (
            <label className="flex items-start gap-3 rounded-xl border p-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={allowShared}
                disabled={action.pending}
                onChange={(e) => setAllowShared(e.target.checked)}
              />
              Confirmei que são pessoas diferentes usando o mesmo telefone.
            </label>
          )}
          <SaveFeedback error={action.error} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={action.pending} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={action.pending || !canManageCustomers}>
              {action.pending ? "Salvando…" : "Salvar cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomerHistory({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { organization, serviceById, professionalById } = useOrganization();
  const { session } = useAuth();
  const history = useQuery({
    queryKey: ["customer-history", session?.user.id, organization.id, customer.id],
    queryFn: async () => {
      const db = getSupabase();
      const [appointments, queue] = await Promise.all([
        db
          .from("appointments")
          .select("id,start_at,service_id,professional_id,status")
          .eq("organization_id", organization.id)
          .eq("customer_id", customer.id)
          .order("start_at", { ascending: false })
          .limit(20),
        db
          .from("queue_entries")
          .select("id,arrived_at,service_id,assigned_professional_id,status")
          .eq("organization_id", organization.id)
          .eq("customer_id", customer.id)
          .order("arrived_at", { ascending: false })
          .limit(20),
      ]);
      if (appointments.error) throw appointments.error;
      if (queue.error) throw queue.error;
      return [
        ...appointments.data.map((a) => ({
          id: a.id,
          date: a.start_at,
          service: a.service_id,
          professional: a.professional_id as string | null,
          status: a.status as Appointment["status"] | QueueEntry["status"],
          source: "Agenda",
        })),
        ...queue.data.map((q) => ({
          id: q.id,
          date: q.arrived_at,
          service: q.service_id,
          professional: q.assigned_professional_id as string | null,
          status: q.status as Appointment["status"] | QueueEntry["status"],
          source: "Fila",
        })),
      ].sort((a, b) => b.date.localeCompare(a.date));
    },
    retry: false,
  });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de {customer.display_name}</DialogTitle>
          <DialogDescription>
            Até 20 registros recentes da agenda e 20 da fila desta empresa.
          </DialogDescription>
        </DialogHeader>
        {history.isPending ? (
          <p>Carregando histórico…</p>
        ) : history.isError ? (
          <div role="alert">
            <p>Não foi possível carregar o histórico.</p>
            <Button variant="outline" onClick={() => void history.refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : !history.data?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum atendimento registrado.</p>
        ) : (
          <ul className="divide-y">
            {history.data.map((row) => (
              <li key={`${row.source}-${row.id}`} className="space-y-1 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: organization.timezone,
                    }).format(new Date(row.date))}{" "}
                    · {row.source}
                  </span>
                  <StatusPill status={row.status} />
                </div>
                <p className="text-sm font-medium">{serviceById(row.service)?.name ?? "Serviço"}</p>
                <p className="text-xs text-muted-foreground">
                  {row.professional
                    ? (professionalById(row.professional)?.name ?? "Profissional")
                    : "Sem profissional atribuído"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
