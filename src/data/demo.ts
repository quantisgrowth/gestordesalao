/**
 * CENÁRIO FICTÍCIO E FIXO DE DEMONSTRAÇÃO.
 * Não representa disponibilidade real, reserva confirmada ou previsão calculada.
 * Substituir por consultas autorizadas ao backend na etapa de persistência.
 */
export type ProfessionalStatus = "disponivel" | "atendendo" | "chamando" | "pausa";
export type AppointmentStatus =
  "confirmed" | "checked_in" | "in_service" | "completed" | "cancelled" | "no_show";
export type QueueStatus =
  "waiting" | "called" | "in_service" | "completed" | "left" | "no_show" | "cancelled";
export type Professional = {
  organizationId: string;
  id: string;
  name: string;
  role: string;
  status: ProfessionalStatus;
  initials: string;
  serviceIds: string[];
};
export type Service = {
  organizationId: string;
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
  category: string;
};
export type Appointment = {
  organizationId: string;
  id: string;
  time: string;
  client: string;
  serviceId: string;
  professionalId: string;
  status: AppointmentStatus;
};
export type QueueEntry = {
  organizationId: string;
  id: string;
  client: string;
  serviceId: string;
  waitingMin: number;
  preferredProfessionalId: string | null;
  assignedProfessionalId: string | null;
  status: QueueStatus;
  arrivedAt: string;
  calledAt?: string;
};

export const demoBusiness = {
  id: "empresa-demo-1",
  name: "Estúdio Exemplo",
  slug: "demo",
  tagline: "Cortes, barba e cuidados — ambiente de demonstração",
  address: "Rua Fictícia, 123 — Bairro Modelo",
  hours: "Ter a Sáb · 9h às 19h",
  scenarioLabel: "Cenário ilustrativo de quinta-feira, às 10h",
  scenarioTime: "10:00",
};

export const demoSettings = {
  specificQueueEnabled: true,
  anyAvailableQueueEnabled: true,
  onlineBookingEnabled: true,
  bufferMinutes: 5,
  callResponseMinutes: 5,
  latenessMinutes: 10,
  cancellationHours: 2,
};

export const professionals: Professional[] = [
  {
    id: "p1",
    organizationId: demoBusiness.id,
    name: "Profissional A",
    role: "Barbeiro(a)",
    status: "atendendo",
    initials: "PA",
    serviceIds: ["s1", "s2", "s3"],
  },
  {
    id: "p2",
    organizationId: demoBusiness.id,
    name: "Profissional B",
    role: "Cabeleireiro(a)",
    status: "disponivel",
    initials: "PB",
    serviceIds: ["s1", "s4"],
  },
  {
    id: "p3",
    organizationId: demoBusiness.id,
    name: "Profissional C",
    role: "Manicure",
    status: "chamando",
    initials: "PC",
    serviceIds: ["s5"],
  },
  {
    id: "p4",
    organizationId: demoBusiness.id,
    name: "Profissional D",
    role: "Barbeiro(a)",
    status: "pausa",
    initials: "PD",
    serviceIds: ["s1", "s2", "s3"],
  },
];

export const services: Service[] = [
  {
    id: "s1",
    organizationId: demoBusiness.id,
    name: "Corte de cabelo",
    durationMin: 40,
    priceCents: 5000,
    category: "Cabelo",
  },
  {
    id: "s2",
    organizationId: demoBusiness.id,
    name: "Barba completa",
    durationMin: 30,
    priceCents: 3500,
    category: "Barba",
  },
  {
    id: "s3",
    organizationId: demoBusiness.id,
    name: "Corte + barba",
    durationMin: 60,
    priceCents: 7500,
    category: "Combo",
  },
  {
    id: "s4",
    organizationId: demoBusiness.id,
    name: "Escova",
    durationMin: 45,
    priceCents: 6000,
    category: "Cabelo",
  },
  {
    id: "s5",
    organizationId: demoBusiness.id,
    name: "Manicure",
    durationMin: 40,
    priceCents: 4000,
    category: "Unhas",
  },
];

export const appointments: Appointment[] = [
  {
    id: "a1",
    organizationId: demoBusiness.id,
    time: "09:00",
    client: "Cliente 01",
    serviceId: "s1",
    professionalId: "p1",
    status: "completed",
  },
  {
    id: "a2",
    organizationId: demoBusiness.id,
    time: "10:00",
    client: "Cliente 02",
    serviceId: "s3",
    professionalId: "p1",
    status: "in_service",
  },
  {
    id: "a3",
    organizationId: demoBusiness.id,
    time: "10:30",
    client: "Cliente 03",
    serviceId: "s4",
    professionalId: "p2",
    status: "confirmed",
  },
  {
    id: "a4",
    organizationId: demoBusiness.id,
    time: "11:15",
    client: "Cliente 04",
    serviceId: "s5",
    professionalId: "p3",
    status: "confirmed",
  },
  {
    id: "a5",
    organizationId: demoBusiness.id,
    time: "14:00",
    client: "Cliente 05",
    serviceId: "s2",
    professionalId: "p4",
    status: "confirmed",
  },
  {
    id: "a6",
    organizationId: demoBusiness.id,
    time: "15:30",
    client: "Cliente 06",
    serviceId: "s1",
    professionalId: "p2",
    status: "confirmed",
  },
];

export const queue: QueueEntry[] = [
  {
    id: "q1",
    organizationId: demoBusiness.id,
    client: "Cliente 07",
    serviceId: "s1",
    waitingMin: 18,
    preferredProfessionalId: "p1",
    assignedProfessionalId: null,
    status: "waiting",
    arrivedAt: "09:42",
  },
  {
    id: "q2",
    organizationId: demoBusiness.id,
    client: "Cliente 08",
    serviceId: "s2",
    waitingMin: 9,
    preferredProfessionalId: null,
    assignedProfessionalId: null,
    status: "waiting",
    arrivedAt: "09:51",
  },
  {
    id: "q3",
    organizationId: demoBusiness.id,
    client: "Cliente 09",
    serviceId: "s5",
    waitingMin: 3,
    preferredProfessionalId: null,
    assignedProfessionalId: "p3",
    status: "called",
    arrivedAt: "09:57",
    calledAt: "09:59",
  },
];

// Projeção pública agregada: sem nomes, telefones ou posição individual.
// Faixa ilustrativa deliberadamente não é calculada a partir do tempo já aguardado.
export const publicQueueSnapshot = {
  waitingCount: queue.filter((entry) => entry.status === "waiting").length,
  calledCount: queue.filter((entry) => entry.status === "called").length,
  waitRange: { min: 60, max: 110 } as { min: number; max: number } | null,
  updatedLabel: "10h — horário fixo da demonstração",
};

export const bookingPreview = {
  dateLabel: "Dia de exemplo",
  slots: ["11:30", "13:00", "15:00"],
  note: "Horários fictícios, sem consulta à disponibilidade real.",
};

export const serviceById = (id: string) => services.find((service) => service.id === id);
export const professionalById = (id: string) =>
  professionals.find((professional) => professional.id === id);
export const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const appointmentsNeedingAttention = appointments.filter(
  (appointment) =>
    professionalById(appointment.professionalId)?.status === "pausa" &&
    ["confirmed", "checked_in"].includes(appointment.status),
);

// Organizações fictícias do showroom SaaS. Não são contas reais nem vínculos de autenticação.
export type DemoCompany = {
  id: string;
  name: string;
  slug: string;
  owner: string;
  email: string;
  plan: "Essencial" | "Profissional";
  status: "ativa" | "convite_pendente" | "suspensa";
  professionalsCount: number;
};
export const demoCompanies: DemoCompany[] = [
  {
    id: "empresa-demo-1",
    name: demoBusiness.name,
    slug: demoBusiness.slug,
    owner: "Gestor de exemplo A",
    email: "gestor.a@example.test",
    plan: "Profissional",
    status: "ativa",
    professionalsCount: professionals.length,
  },
  {
    id: "empresa-demo-2",
    name: "Salão Modelo",
    slug: "salao-modelo",
    owner: "Gestora de exemplo B",
    email: "gestora.b@example.test",
    plan: "Essencial",
    status: "convite_pendente",
    professionalsCount: 0,
  },
  {
    id: "empresa-demo-3",
    name: "Barbearia Conceito",
    slug: "barbearia-conceito",
    owner: "Gestor de exemplo C",
    email: "gestor.c@example.test",
    plan: "Essencial",
    status: "suspensa",
    professionalsCount: 2,
  },
];
export const demoClientProfile = { name: "Cliente 03", appointmentId: "a3", initials: "C3" };
export const demoCompanyForm = {
  name: "Novo Salão Exemplo",
  slug: "novo-salao-exemplo",
  owner: "Gestor de exemplo",
  email: "novo.gestor@example.test",
};
