import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/inicio" replace />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <p className="text-muted-foreground">
          Bienvenido al panel de administración. Aquí podrás gestionar el contenido del club.
        </p>
      </div>
    </div>
  );
};

export default Admin;
