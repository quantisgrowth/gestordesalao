import { AlertTriangle } from "lucide-react";
import { appointmentsNeedingAttention, professionalById } from "@/data/demo";

export function OperationalAlert() {
  if (!appointmentsNeedingAttention.length) return null;
  return (
    <aside
      className="mb-6 rounded-2xl border border-forest/30 bg-accent p-4 text-accent-foreground"
      aria-label="Reservas que precisam de atenção"
    >
      <p className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-5 w-5 shrink-0" /> Profissional em pausa: revise as reservas
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {appointmentsNeedingAttention.map((appointment) => (
          <li key={appointment.id}>
            {appointment.time} · {appointment.client} ·{" "}
            {professionalById(appointment.professionalId)?.name}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm">
        A reserva permanece no horário original. A equipe coordena alternativas; ninguém é
        transferido ou cancelado automaticamente.
      </p>
    </aside>
  );
}
