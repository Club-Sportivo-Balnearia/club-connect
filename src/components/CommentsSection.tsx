import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface Comment {
  id: string;
  contenido: string;
  created_at: string;
  user_id: string;
  autor_nombre?: string;
}

export function CommentsSection({ publicacionId }: { publicacionId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ["comentarios", publicacionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comentarios")
        .select("*")
        .eq("publicacion_id", publicacionId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Fetch author names
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nombre")
        .in("id", userIds);

      const nameMap = new Map(profiles?.map((p) => [p.id, p.nombre]) ?? []);
      return data.map((c) => ({
        ...c,
        autor_nombre: nameMap.get(c.user_id) ?? "Usuario",
      })) as Comment[];
    },
    enabled: open,
  });

  // Realtime subscription
  useEffect(() => {
    if (!open) return;

    const channel = supabase
      .channel(`comentarios-${publicacionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comentarios",
          filter: `publicacion_id=eq.${publicacionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["comentarios", publicacionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, publicacionId, queryClient]);

  const mutation = useMutation({
    mutationFn: async (contenido: string) => {
      const { error } = await supabase.from("comentarios").insert({
        publicacion_id: publicacionId,
        user_id: user!.id,
        contenido,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTexto("");
      queryClient.invalidateQueries({ queryKey: ["comentarios", publicacionId] });
    },
    onError: () => toast.error("Error al enviar el comentario"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    mutation.mutate(texto.trim());
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-1.5 px-5 pb-4 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <MessageCircle className="h-3.5 w-3.5" />
          Comentarios
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t px-5 py-4 space-y-3">
          {/* Comments list */}
          {comments.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-semibold text-foreground">{c.autor_nombre}</span>
                  <span className="ml-2 text-muted-foreground text-xs">
                    {format(new Date(c.created_at), "d MMM, HH:mm", { locale: es })}
                  </span>
                  <p className="text-muted-foreground mt-0.5">{c.contenido}</p>
                </div>
              ))}
            </div>
          )}

          {/* Input or login prompt */}
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe un comentario..."
                className="h-8 text-sm"
              />
              <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={mutation.isPending || !texto.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground italic">Inicia sesión para comentar.</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
