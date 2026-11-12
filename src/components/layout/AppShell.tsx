import { Link, Outlet } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { appNav } from "./nav";
import { demoBusiness } from "@/data/demo";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Sidebar desktop/tablet */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex">
        <Link to="/" className="px-2 py-3"><Logo tone="light" /></Link>
        <div className="mt-4 rounded-xl bg-sidebar-accent p-3 text-sm">
          <p className="text-xs opacity-70">Estabelecimento</p>
          <p className="font-semibold text-sidebar-accent-foreground">{demoBusiness.name}</p>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {appNav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }}
              className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground">
              <Icon className="h-5 w-5" /> {label}
            </Link>
          ))}
        </nav>
        <Link to="/estabelecimento/$slug" params={{ slug: "demo" }} className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-sidebar-accent">
          <ExternalLink className="h-4 w-4" /> Ver página pública
        </Link>
      </aside>

      {/* Topo mobile */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-card/90 px-4 backdrop-blur md:hidden">
        <Link to="/"><Logo /></Link>
        <span className="truncate text-sm text-muted-foreground">{demoBusiness.name}</span>
      </header>

      <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 md:px-10 md:pb-10 md:pt-10">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>

      {/* Navegação inferior mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t bg-card md:hidden" aria-label="Navegação principal">
        {appNav.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: true }}
            className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground data-[status=active]:text-forest">
            <Icon className="h-5 w-5" /> <span className="truncate">{label === "Configurações" ? "Ajustes" : label === "Profissionais" ? "Equipe" : label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
