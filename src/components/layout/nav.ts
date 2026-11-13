import {
  CalendarDays,
  LayoutDashboard,
  ListOrdered,
  Scissors,
  Settings,
  Smartphone,
  Users,
  Contact,
} from "lucide-react";

export const appNav = [
  { to: "/app", label: "Início", icon: LayoutDashboard },
  { to: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/app/fila", label: "Fila", icon: ListOrdered },
  { to: "/app/clientes", label: "Clientes", icon: Contact },
  { to: "/app/profissionais", label: "Profissionais", icon: Users },
  { to: "/app/servicos", label: "Serviços", icon: Scissors },
  { to: "/app/aplicativos", label: "Aplicativos", icon: Smartphone },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
] as const;
