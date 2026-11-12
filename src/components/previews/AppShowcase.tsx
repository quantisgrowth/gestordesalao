import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  Home,
  ListOrdered,
  UserRound,
  Signal,
  BatteryFull,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/common/Panel";
import {
  appointments,
  professionals,
  queue,
  services,
  serviceById,
  professionalById,
  demoBusiness,
  demoClientProfile,
  publicQueueSnapshot,
  bookingPreview,
  demoSettings,
  formatPrice,
} from "@/data/demo";

type Screen = "inicio" | "agenda" | "fila" | "perfil";
const screens = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "fila", label: "Fila", icon: ListOrdered },
  { id: "perfil", label: "Perfil", icon: UserRound },
] as const;

function Phone({
  audience,
  title,
  children,
  screen,
  onScreen,
}: {
  audience: "cliente" | "gestor";
  title: string;
  children: ReactNode;
  screen: Screen;
  onScreen: (screen: Screen) => void;
}) {
  return (
    <article className="mx-auto w-full max-w-[360px]">
      <h2 className="mb-3 text-center text-lg font-semibold">{title}</h2>
      <div className="overflow-hidden rounded-[2.5rem] border-[8px] border-primary bg-card shadow-card">
        <div
          className="flex items-center justify-between bg-primary px-5 pb-3 pt-2 text-xs text-primary-foreground"
          aria-hidden="true"
        >
          <span>{demoBusiness.scenarioTime}</span>
          <span className="flex gap-2">
            <Signal className="h-3.5 w-3.5" />
            <BatteryFull className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="flex h-[620px] max-h-[80dvh] min-h-[460px] flex-col">
          <div className="border-b bg-accent px-4 py-2 text-center text-[11px] font-medium text-accent-foreground">
            Aplicativo do {audience} · demonstração
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background p-4"
            aria-label={`Tela do aplicativo do ${audience}`}
          >
            {children}
          </div>
          <nav
            className="grid shrink-0 grid-cols-4 border-t bg-card p-1"
            aria-label={`Navegação do aplicativo do ${audience}`}
          >
            {screens.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={screen === id}
                onClick={() => onScreen(id)}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${screen === id ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {audience === "gestor" && id === "perfil"
                  ? "Equipe"
                  : audience === "cliente" && id === "agenda"
                    ? "Agendar"
                    : label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </article>
  );
}

function MiniCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border bg-card p-4 shadow-card">{children}</div>;
}

function ClientApp() {
  const [screen, setScreen] = useState<Screen>("inicio");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [time, setTime] = useState("");
  const appointment = appointments.find((item) => item.id === demoClientProfile.appointmentId);
  const service = serviceById(serviceId);
  const range = publicQueueSnapshot.waitRange;
  return (
    <Phone audience="cliente" title="Aplicativo do cliente" screen={screen} onScreen={setScreen}>
      <p className="text-xs text-muted-foreground">{demoBusiness.name}</p>
      <h3 className="mt-1 text-xl font-semibold">
        {screen === "inicio"
          ? `Olá, ${demoClientProfile.name}`
          : screen === "agenda"
            ? "Escolha seu atendimento"
            : screen === "fila"
              ? "Como está a espera?"
              : "Seu perfil"}
      </h3>
      {screen === "inicio" && (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
            <p className="text-sm opacity-80">Cuide de você. A gente organiza o horário.</p>
            <Button variant="mint" className="mt-4 w-full" onClick={() => setScreen("agenda")}>
              Explorar agendamento
            </Button>
          </div>
          {appointment && (
            <MiniCard>
              <p className="text-xs text-muted-foreground">Seu próximo atendimento · exemplo</p>
              <p className="mt-2 font-semibold">{serviceById(appointment.serviceId)?.name}</p>
              <p className="mt-1 text-sm">
                {appointment.time} · {professionalById(appointment.professionalId)?.name}
              </p>
              <div className="mt-3">
                <StatusPill status={appointment.status} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Registro fictício para visualizar a jornada.
              </p>
            </MiniCard>
          )}
          <button
            className="w-full rounded-2xl border bg-card p-4 text-left"
            onClick={() => setScreen("fila")}
          >
            <p className="font-semibold">Consultar a fila</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {publicQueueSnapshot.waitingCount} pessoas aguardando ·{" "}
              {range ? `~ ${range.min}–${range.max} min` : "Estimativa indisponível"}
            </p>
          </button>
        </div>
      )}
      {screen === "agenda" && (
        <div className="mt-5 space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Serviço</legend>
            <div className="space-y-2">
              {services.map((item) => (
                <button
                  key={item.id}
                  aria-pressed={serviceId === item.id}
                  onClick={() => {
                    setServiceId(item.id);
                    setTime("");
                  }}
                  className={`flex min-h-14 w-full items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm ${serviceId === item.id ? "border-forest bg-accent" : "bg-card"}`}
                >
                  <span>
                    {item.name}
                    <span className="block text-xs text-muted-foreground">
                      {item.durationMin} min
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold">{formatPrice(item.priceCents)}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">{bookingPreview.dateLabel}</legend>
            <div className="flex flex-wrap gap-2">
              {bookingPreview.slots.map((slot) => (
                <Button
                  key={slot}
                  size="sm"
                  variant={time === slot ? "default" : "outline"}
                  aria-pressed={time === slot}
                  onClick={() => setTime(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </fieldset>
          <p className="text-xs text-muted-foreground">{bookingPreview.note}</p>
          {time && service && (
            <MiniCard>
              <p className="text-sm font-semibold">
                {service.name} · {time}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {service.durationMin} min + {demoSettings.bufferMinutes} min de intervalo. A
                confirmação real definirá um profissional habilitado disponível.
              </p>
            </MiniCard>
          )}
          <Button className="w-full" disabled>
            Reserva real em breve
          </Button>
        </div>
      )}
      {screen === "fila" && (
        <div className="mt-5 space-y-4">
          <MiniCard>
            <p className="text-sm text-muted-foreground">Pessoas aguardando</p>
            <p className="mt-2 font-display text-4xl font-semibold">
              {publicQueueSnapshot.waitingCount}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">Espera estimada ilustrativa</p>
            <p className="mt-1 text-xl font-semibold">
              {range ? `~ ${range.min}–${range.max} min` : "Indisponível"}
            </p>
          </MiniCard>
          <p className="rounded-xl bg-accent p-4 text-sm text-accent-foreground">
            Para entrar na fila, confirme sua chegada no salão. A consulta pelo celular não garante
            lugar.
          </p>
          <p className="text-xs text-muted-foreground">
            Sem nomes de outros clientes. Referência fixa: {publicQueueSnapshot.updatedLabel}. A
            espera pode variar.
          </p>
        </div>
      )}
      {screen === "perfil" && (
        <div className="mt-5 space-y-4">
          <MiniCard>
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint font-display font-bold">
              {demoClientProfile.initials}
            </span>
            <p className="mt-3 font-semibold">{demoClientProfile.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Perfil fictício. Nenhuma conta de cliente está conectada.
            </p>
          </MiniCard>
          <MiniCard>
            <p className="text-sm font-semibold">Cancelamento e remarcação</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Até {demoSettings.cancellationHours} horas antes, conforme a política do salão. Fora
              do prazo, fale com a equipe.
            </p>
            <Button variant="outline" className="mt-4 w-full" disabled>
              Gerenciar reserva · em breve
            </Button>
          </MiniCard>
        </div>
      )}
    </Phone>
  );
}

function ManagerApp() {
  const [screen, setScreen] = useState<Screen>("inicio");
  const upcoming = appointments.filter(
    (item) => item.status === "confirmed" || item.status === "checked_in",
  );
  return (
    <Phone audience="gestor" title="Aplicativo do gestor" screen={screen} onScreen={setScreen}>
      <p className="text-xs text-muted-foreground">{demoBusiness.name}</p>
      <h3 className="mt-1 text-xl font-semibold">
        {screen === "inicio"
          ? "Seu salão hoje"
          : screen === "agenda"
            ? "Agenda da equipe"
            : screen === "fila"
              ? "Fila presencial"
              : "Sua equipe"}
      </h3>
      {screen === "inicio" && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MiniCard>
              <CalendarDays className="h-4 w-4 text-forest" />
              <p className="mt-2 text-2xl font-semibold">{appointments.length}</p>
              <p className="text-xs text-muted-foreground">Agendamentos</p>
            </MiniCard>
            <MiniCard>
              <ListOrdered className="h-4 w-4 text-forest" />
              <p className="mt-2 text-2xl font-semibold">
                {queue.filter((entry) => entry.status === "waiting").length}
              </p>
              <p className="text-xs text-muted-foreground">Aguardando</p>
            </MiniCard>
          </div>
          <div className="rounded-2xl border border-forest/30 bg-accent p-4">
            <p className="text-sm font-semibold">Uma reserva precisa de atenção</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Há profissional em pausa. Confira a agenda e coordene alternativas.
            </p>
            <Button className="mt-3 w-full" variant="outline" onClick={() => setScreen("agenda")}>
              Ver agenda
            </Button>
          </div>
          <Button className="w-full" variant="mint" onClick={() => setScreen("fila")}>
            Ver fila presencial
          </Button>
          <p className="text-xs text-muted-foreground">
            {demoBusiness.scenarioLabel}. Sem atualização em tempo real nesta prévia.
          </p>
        </div>
      )}
      {screen === "agenda" && (
        <div className="mt-5 space-y-3">
          {upcoming.map((item) => (
            <MiniCard key={item.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{item.time}</p>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-2 text-sm">{item.client}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {serviceById(item.serviceId)?.name} · {professionalById(item.professionalId)?.name}
              </p>
              {professionalById(item.professionalId)?.status === "pausa" && (
                <p className="mt-3 rounded-lg bg-accent p-2 text-xs text-accent-foreground">
                  Profissional em pausa. Reserva preservada.
                </p>
              )}
            </MiniCard>
          ))}
          <Button className="w-full" disabled>
            Novo agendamento · em breve
          </Button>
        </div>
      )}
      {screen === "fila" && (
        <div className="mt-5 space-y-3">
          {queue.map((entry) => (
            <MiniCard key={entry.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{entry.client}</p>
                <StatusPill status={entry.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {serviceById(entry.serviceId)?.name}
              </p>
              <p className="mt-2 text-xs">
                {entry.preferredProfessionalId
                  ? professionalById(entry.preferredProfessionalId)?.name
                  : "Qualquer habilitado disponível"}
              </p>
              <Button className="mt-3 w-full" size="sm" disabled>
                {entry.status === "called" ? "Iniciar atendimento" : "Chamar cliente"}
              </Button>
            </MiniCard>
          ))}
          <p className="text-xs text-muted-foreground">
            Somente chegada presencial; chamadas e mudanças de estado serão implementadas na etapa
            operacional.
          </p>
        </div>
      )}
      {screen === "perfil" && (
        <div className="mt-5 space-y-3">
          {professionals.map((professional) => (
            <MiniCard key={professional.id}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-xs font-bold">
                  {professional.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{professional.name}</p>
                  <p className="text-xs text-muted-foreground">{professional.role}</p>
                </div>
              </div>
              <div className="mt-3">
                <StatusPill status={professional.status} />
              </div>
            </MiniCard>
          ))}
          <p className="text-xs text-muted-foreground">
            O gestor acessará apenas os dados da sua empresa. O proprietário poderá também atuar
            como profissional.
          </p>
        </div>
      )}
    </Phone>
  );
}

export function AppShowcase() {
  return (
    <div>
      <div className="mb-6 rounded-2xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
        Explore as telas dentro dos celulares. São prévias navegáveis na web, com dados fictícios;
        não são aplicativos instaláveis nem contas autenticadas.
      </div>
      <Tabs defaultValue="comparar">
        <TabsList className="mb-8 flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent">
          <TabsTrigger
            value="comparar"
            className="min-h-11 border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Comparar aplicativos
          </TabsTrigger>
          <TabsTrigger
            value="cliente"
            className="min-h-11 border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <UserRound className="mr-2 h-4 w-4" /> Cliente
          </TabsTrigger>
          <TabsTrigger
            value="gestor"
            className="min-h-11 border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Scissors className="mr-2 h-4 w-4" /> Gestor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="comparar">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <ClientApp />
            <ManagerApp />
          </div>
        </TabsContent>
        <TabsContent value="cliente">
          <ClientApp />
        </TabsContent>
        <TabsContent value="gestor">
          <ManagerApp />
        </TabsContent>
      </Tabs>
    </div>
  );
}
