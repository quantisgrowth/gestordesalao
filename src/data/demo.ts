/**
 * DADOS FICTÍCIOS DE DEMONSTRAÇÃO.
 * Nenhum nome ou dado aqui pertence a pessoas reais.
 * Substituir por consultas ao backend quando ele for conectado.
 */
export type Professional = { id: string; name: string; role: string; status: "disponivel" | "atendendo" | "pausa"; initials: string };
export type Service = { id: string; name: string; durationMin: number; priceCents: number; category: string };
export type Appointment = { id: string; time: string; client: string; serviceId: string; professionalId: string; status: "confirmado" | "pendente" | "concluido" };
export type QueueEntry = { id: string; client: string; serviceId: string; waitingMin: number; position: number };

export const demoBusiness = {
  name: "Estúdio Exemplo",
  slug: "demo",
  tagline: "Cortes, barba e cuidados — ambiente de demonstração",
  address: "Rua Fictícia, 123 — Bairro Modelo",
  hours: "Ter a Sáb · 9h às 19h",
};

export const professionals: Professional[] = [
  { id: "p1", name: "Profissional A", role: "Barbeiro(a)", status: "atendendo", initials: "PA" },
  { id: "p2", name: "Profissional B", role: "Cabeleireiro(a)", status: "disponivel", initials: "PB" },
  { id: "p3", name: "Profissional C", role: "Manicure", status: "disponivel", initials: "PC" },
  { id: "p4", name: "Profissional D", role: "Barbeiro(a)", status: "pausa", initials: "PD" },
];

export const services: Service[] = [
  { id: "s1", name: "Corte de cabelo", durationMin: 40, priceCents: 5000, category: "Cabelo" },
  { id: "s2", name: "Barba completa", durationMin: 30, priceCents: 3500, category: "Barba" },
  { id: "s3", name: "Corte + barba", durationMin: 60, priceCents: 7500, category: "Combo" },
  { id: "s4", name: "Escova", durationMin: 45, priceCents: 6000, category: "Cabelo" },
  { id: "s5", name: "Manicure", durationMin: 40, priceCents: 4000, category: "Unhas" },
];

export const appointments: Appointment[] = [
  { id: "a1", time: "09:00", client: "Cliente 01", serviceId: "s1", professionalId: "p1", status: "concluido" },
  { id: "a2", time: "10:00", client: "Cliente 02", serviceId: "s3", professionalId: "p1", status: "confirmado" },
  { id: "a3", time: "10:30", client: "Cliente 03", serviceId: "s4", professionalId: "p2", status: "confirmado" },
  { id: "a4", time: "11:15", client: "Cliente 04", serviceId: "s5", professionalId: "p3", status: "pendente" },
  { id: "a5", time: "14:00", client: "Cliente 05", serviceId: "s2", professionalId: "p4", status: "confirmado" },
  { id: "a6", time: "15:30", client: "Cliente 06", serviceId: "s1", professionalId: "p2", status: "pendente" },
];

export const queue: QueueEntry[] = [
  { id: "q1", client: "Cliente 07", serviceId: "s1", waitingMin: 18, position: 1 },
  { id: "q2", client: "Cliente 08", serviceId: "s2", waitingMin: 9, position: 2 },
  { id: "q3", client: "Cliente 09", serviceId: "s3", waitingMin: 3, position: 3 },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const professionalById = (id: string) => professionals.find((p) => p.id === id);
export const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
