import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Shield, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/AuthModal";

const menuItems = [
  { label: "Inicio", to: "/inicio" },
  { label: "Vóley", to: "/voley" },
  { label: "Patín", to: "/patin" },
  { label: "Básquet", to: "/basquet" },
  { label: "Pádel", to: "/padel" },
];

const futbolSubItems = [
  { label: "Primera y reserva", to: "/futbol/primera-reserva" },
  { label: "Femenino", to: "/futbol/femenino" },
  { label: "Inferiores", to: "/futbol/inferiores" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [futbolOpen, setFutbolOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo / Brand */}
          <Link to="/" className="text-lg font-bold tracking-tight text-primary">
            Club Deportivo
          </Link>

          {/* Desktop menu */}
          <div className="hidden items-center gap-1 md:flex">
            {menuItems.slice(0, 1).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-primary"
              >
                {item.label}
              </Link>
            ))}

            {/* Fútbol dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-primary">
                  Fútbol <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {futbolSubItems.map((sub) => (
                  <DropdownMenuItem key={sub.to} asChild>
                    <Link to={sub.to}>{sub.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {menuItems.slice(1).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-primary"
              >
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Shield className="h-3.5 w-3.5" />
                Panel Admin
              </Link>
            )}

            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="ml-2 text-muted-foreground">
                <LogOut className="mr-1 h-3.5 w-3.5" />
                Salir
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)} className="ml-2">
                <LogIn className="mr-1 h-3.5 w-3.5" />
                Iniciar sesión
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-secondary-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border/40 bg-secondary md:hidden">
            <div className="space-y-1 px-4 pb-4 pt-2">
              {menuItems.slice(0, 1).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Fútbol collapsible */}
              <button
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent hover:text-primary"
                onClick={() => setFutbolOpen(!futbolOpen)}
              >
                Fútbol
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", futbolOpen && "rotate-180")} />
              </button>
              {futbolOpen && (
                <div className="ml-4 space-y-1">
                  {futbolSubItems.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}

              {menuItems.slice(1).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Panel Admin
                </Link>
              )}

              {user ? (
                <button
                  className="flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Salir
                </button>
              ) : (
                <button
                  className="flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-primary hover:underline"
                  onClick={() => {
                    setAuthOpen(true);
                    setMobileOpen(false);
                  }}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
