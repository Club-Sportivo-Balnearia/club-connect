import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "¡Bienvenido!", description: "Has iniciado sesión correctamente." });
        onOpenChange(false);
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

  const reset = () => {
    setEmail("");
    setPassword("");
    setNombre("");
    setIsLogin(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="border-border/30 bg-card/70 backdrop-blur-xl sm:max-w-md shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-primary">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Ingresá con tu email y contraseña" : "Registrate como socio del club"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="modal-nombre">Nombre</Label>
              <Input
                id="modal-nombre"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="modal-email">Email</Label>
            <Input
              id="modal-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-password">Contraseña</Label>
            <Input
              id="modal-password"
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

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-primary hover:underline"
          >
            {isLogin ? "Registrate" : "Iniciá sesión"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
