export type OrgRole = "owner" | "manager" | "receptionist" | "professional";
export type Organization = {
  id: string;
  name: string;
  slug: string;
  status: "trial" | "active" | "suspended" | "closed";
  timezone: string;
  address: string | null;
  contact_phone: string | null;
  updated_at: string;
};
export type Professional = {
  id: string;
  organizationId: string;
  name: string;
  role: string;
  status: "disponivel" | "atendendo" | "chamando" | "pausa" | "offline";
  initials: string;
  serviceIds: string[];
  active: boolean;
  updatedAt: string;
};
export type Service = {
  id: string;
  organizationId: string;
  name: string;
  durationMin: number;
  priceCents: number;
  category: string;
  professionalIds: string[];
  active: boolean;
  updatedAt: string;
};
export type Appointment = {
  id: string;
  time: string;
  client: string;
  serviceId: string;
  professionalId: string;
  status: "confirmed" | "checked_in" | "in_service" | "completed" | "cancelled" | "no_show";
};
export type QueueEntry = {
  id: string;
  client: string;
  serviceId: string;
  preferredProfessionalId: string | null;
  assignedProfessionalId: string | null;
  status: "waiting" | "called" | "in_service" | "completed" | "left" | "no_show" | "cancelled";
  arrivedAt: string;
  calledAt: string | undefined;
  waitingMin: number;
};
export type Settings = {
  specific_queue_enabled: boolean;
  any_available_queue_enabled: boolean;
  online_booking_enabled: boolean;
  public_page_enabled: boolean;
  public_queue_enabled: boolean;
  buffer_minutes: number;
  call_response_minutes: number;
  lateness_minutes: number;
  cancellation_hours: number;
  minimum_booking_lead_minutes: number;
  maximum_booking_horizon_days: number;
  updated_at: string;
};
export function localDay(value: string | Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
export function localTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export type Customer = { id: string; display_name: string; phone_e164: string; updated_at: string };
