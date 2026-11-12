import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bookingPreview, demoSettings, services, professionals, formatPrice } from "@/data/demo";

export function BookingPreview() {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [professionalId, setProfessionalId] = useState("any");
  const [slot, setSlot] = useState("");
  const service = services.find((item) => item.id === serviceId);
  const eligible = professionals.filter(
    (professional) =>
      professional.status !== "pausa" && professional.serviceIds.includes(serviceId),
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="xl" variant="mint" className="mt-8">
          <CalendarDays className="h-5 w-5" /> Explorar agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prévia de agendamento</DialogTitle>
          <DialogDescription>
            Explore as escolhas com dados fictícios. Nenhuma reserva será criada e não coletamos
            dados pessoais nesta demonstração.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="booking-service">1. Serviço</Label>
            <select
              id="booking-service"
              className="h-12 w-full rounded-md border bg-background px-3 text-sm"
              value={serviceId}
              onChange={(event) => {
                setServiceId(event.target.value);
                setProfessionalId("any");
                setSlot("");
              }}
            >
              {services.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {formatPrice(item.priceCents)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking-professional">2. Profissional</Label>
            <select
              id="booking-professional"
              className="h-12 w-full rounded-md border bg-background px-3 text-sm"
              value={professionalId}
              onChange={(event) => {
                setProfessionalId(event.target.value);
                setSlot("");
              }}
            >
              <option value="any">Qualquer profissional habilitado disponível</option>
              {eligible.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Na versão operacional, “qualquer disponível” terá o profissional definido na
              confirmação. Profissionais em pausa não receberão novas disponibilidades conflitantes.
            </p>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              3. {bookingPreview.dateLabel}: horário ilustrativo
            </legend>
            <div className="flex flex-wrap gap-2">
              {bookingPreview.slots.map((time) => (
                <Button
                  key={time}
                  type="button"
                  className="min-h-11"
                  variant={slot === time ? "default" : "outline"}
                  aria-pressed={slot === time}
                  onClick={() => setSlot(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{bookingPreview.note}</p>
          </fieldset>
          {service && (
            <div
              className="rounded-xl bg-accent p-4 text-sm text-accent-foreground"
              aria-live="polite"
            >
              <p className="font-semibold">
                {service.name} · {formatPrice(service.priceCents)}
              </p>
              <p className="mt-1">
                {service.durationMin} min de serviço + {demoSettings.bufferMinutes} min de
                intervalo.
              </p>
              <p className="mt-1">
                {slot
                  ? `Horário escolhido no exemplo: ${slot}.`
                  : "Escolha um horário para visualizar o resumo."}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Cancelamento ou remarcação pelo cliente: até {demoSettings.cancellationHours} horas
            antes, conforme configuração do estabelecimento. Fora do prazo, entre em contato com a
            equipe.
          </p>
          <Button className="w-full" size="lg" disabled>
            Reservas reais ainda indisponíveis
          </Button>
          <p className="text-xs text-muted-foreground">
            A confirmação real dependerá da validação no servidor, nome, telefone e apresentação do
            aviso de privacidade.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
