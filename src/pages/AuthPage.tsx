import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { NewsFeed } from "@/components/NewsFeed";

const AuthPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {user ? (
        <NewsFeed title="Últimas Noticias" subtitle="Todas las novedades del club deportivo" />
      ) : (
        <div
          className="relative min-h-[calc(100vh-4rem)] bg-cover bg-center"
          style={{ backgroundImage: "url('/fondo_de_sportivo.png')" }}
        >
          <div className="absolute inset-0 bg-secondary/75" />
          <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl lg:text-6xl">
                Club Deportivo
              </h1>
              <p className="mt-4 text-lg text-secondary-foreground/80 sm:text-xl">
                Bienvenido al club. Iniciá sesión para ver las últimas noticias, resultados y novedades de todas nuestras disciplinas deportivas.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthPage;
