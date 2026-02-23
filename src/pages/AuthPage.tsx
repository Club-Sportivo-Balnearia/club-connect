import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { NewsFeed } from "@/components/NewsFeed";

const AuthPage = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Authenticated: show navbar + news feed
  if (user) {
    return (
      <>
        <Navbar />
        <NewsFeed title="Últimas Noticias" subtitle="Todas las novedades del club deportivo" />
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "¡Bienvenido!", description: "Has iniciado sesión correctamente." });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nombre } },
        });
        if (error) throw error;
        toast({
          title: "Registro exitoso",
          description: "Revisa tu email para confirmar tu cuenta.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Not authenticated: two-column hero
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/fondo_de_sportivo.png')" }}
    >
      <div className="absolute inset-0 bg-secondary/75" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-4 py-16 lg:flex-row lg:gap-16">
        {/* Left: Welcome */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Club Deportivo
          </h1>
          <p className="mt-4 max-w-lg text-lg text-secondary-foreground/80 sm:text-xl">
            Bienvenido al club. Accedé para ver las últimas noticias, resultados y novedades de todas nuestras disciplinas deportivas.
          </p>
        </div>

        {/* Right: Auth form */}
        <div className="w-full max-w-md flex-shrink-0">
          <Card className="border-border/40 bg-card/90 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                {isLogin ? "Iniciar sesión" : "Crear cuenta"}
              </CardTitle>
              <CardDescription>
                {isLogin ? "Ingresá con tu email y contraseña" : "Registrate como socio del club"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLogin ? "Iniciar sesión" : "Registrarse"}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {isLogin ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-primary hover:underline"
                >
                  {isLogin ? "Registrate" : "Iniciá sesión"}
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
