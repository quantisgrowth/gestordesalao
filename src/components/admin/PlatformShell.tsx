import { Link, Outlet } from "@tanstack/react-router";
import { Building2, LayoutDashboard, Smartphone, ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PlatformProvider } from "./PlatformProvider";
import { RequireAuth, SignOutButton } from "@/components/auth/AuthProvider";

const items = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { to: "/admin/empresas", label: "Empresas e acessos", icon: Building2 },
  { to: "/aplicativos", label: "Aplicativos", icon: Smartphone },
] as const;
export function PlatformShell() {
  return (
    <RequireAuth admin>
      <PlatformProvider>
        <div className="min-h-screen bg-background md:flex">
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-primary p-5 text-primary-foreground md:flex">
            <Link to="/">
              <Logo tone="light" />
            </Link>
            <p className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-mint">
              <ShieldCheck className="h-4 w-4" /> Admin da plataforma
            </p>
            <nav className="mt-5 space-y-2" aria-label="Administração da plataforma">
              {items.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: true }}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm hover:bg-sidebar-accent data-[status=active]:bg-mint data-[status=active]:text-mint-foreground"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </nav>
            <Link to="/app" className="mt-auto flex min-h-12 items-center gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Meu estabelecimento
            </Link>
          </aside>
          <div className="min-w-0 flex-1">
            <header className="border-b bg-card px-4 py-4 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-5 w-5 text-forest" /> Administração do SaaS
                </p>
                <SignOutButton />
                <Link to="/app" className="text-sm text-forest underline">
                  Meu estabelecimento
                </Link>
              </div>
              <nav
                className="mt-4 flex flex-wrap gap-4 text-sm md:hidden"
                aria-label="Administração mobile"
              >
                {items.map(({ to, label }) => (
                  <Link key={to} to={to} className="min-h-11 py-2 text-forest underline">
                    {label}
                  </Link>
                ))}
              </nav>
            </header>
            <main className="mx-auto max-w-6xl p-4 sm:p-8">
              <Outlet />
            </main>
          </div>
        </div>
      </PlatformProvider>
    </RequireAuth>
  );
}
