import { Link, Outlet } from "@tanstack/react-router";
import { ExternalLink, Menu, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { appNav } from "./nav";
import { demoBusiness } from "@/data/demo";
const mobileNav = appNav.filter((item) =>
  ["/app", "/app/agenda", "/app/fila", "/app/aplicativos"].includes(item.to),
);
export function AppShell() {
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex">
        <Link to="/" className="px-2 py-3">
          <Logo tone="light" />
        </Link>
        <div className="mt-4 rounded-xl bg-sidebar-accent p-3 text-sm">
          <p className="text-xs opacity-70">Estabelecimento</p>
          <p className="font-semibold text-sidebar-accent-foreground">{demoBusiness.name}</p>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Navegação do salão">
          {appNav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground"
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
        <Link
          to="/estabelecimento/$slug"
          params={{ slug: "demo" }}
          className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-sidebar-accent"
        >
          <ExternalLink className="h-4 w-4" /> Página pública
        </Link>
        <Link
          to="/admin"
          className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs hover:bg-sidebar-accent"
        >
          <ShieldCheck className="h-4 w-4" /> Admin SaaS · demonstração
        </Link>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/90 px-4 backdrop-blur md:hidden">
        <Link to="/">
          <Logo />
        </Link>
        <div className="ml-3 flex min-w-0 items-center gap-2">
          <span className="truncate text-xs text-muted-foreground">{demoBusiness.name}</span>
          <Link
            to="/estabelecimento/$slug"
            params={{ slug: "demo" }}
            className="grid h-11 w-11 shrink-0 place-items-center"
            aria-label="Ver página pública"
          >
            <ExternalLink className="h-5 w-5" />
          </Link>
        </div>
      </header>
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 md:px-10 md:pb-10 md:pt-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Navegação principal"
      >
        {mobileNav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground data-[status=active]:text-forest"
          >
            <Icon className="h-5 w-5" />
            <span>{label === "Aplicativos" ? "Apps" : label}</span>
          </Link>
        ))}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Menu className="h-5 w-5" />
              Mais
            </button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Gestor de Salão</SheetTitle>
              <SheetDescription>Navegue pelas telas da demonstração.</SheetDescription>
            </SheetHeader>
            <nav className="mt-8 space-y-2">
              {appNav.map(({ to, label, icon: Icon }) => (
                <SheetClose asChild key={to}>
                  <Link
                    to={to}
                    className="flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-accent"
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Link
                  to="/admin"
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-accent"
                >
                  <ShieldCheck className="h-5 w-5" />
                  Admin SaaS · demonstração
                </Link>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
