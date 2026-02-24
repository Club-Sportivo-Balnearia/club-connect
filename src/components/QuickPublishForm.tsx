import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Send, LogIn } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

const categorias = ["Fútbol", "Vóley", "Patín", "Básquet", "Pádel"];

interface QuickPublishFormProps {
  user: User | null;
  onLoginClick: () => void;
}

export function QuickPublishForm({ user, onLoginClick }: QuickPublishFormProps) {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
        <p className="text-muted-foreground mb-3">
          Inicia sesión o regístrate para compartir noticias con el club
        </p>
        <Button variant="outline" onClick={onLoginClick} className="gap-2">
          <LogIn className="h-4 w-4" />
          Iniciar sesión
        </Button>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setCategoria("");
    clearImage();
  };

  const handlePublish = async () => {
    if (!titulo.trim() || !categoria) {
      toast({ title: "Error", description: "Título y categoría son obligatorios.", variant: "destructive" });
      return;
    }
    const emptyContent = !descripcion.trim() || descripcion === "<p></p>";
    if (emptyContent) {
      toast({ title: "Error", description: "La noticia debe tener contenido.", variant: "destructive" });
      return;
    }

    setPublishing(true);
    let imagen_url: string | null = null;

    try {
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("publicaciones")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("publicaciones")
          .getPublicUrl(filePath);
        imagen_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("publicaciones").insert({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        categoria,
        imagen_url,
        user_id: user.id,
      });

      if (error) throw error;

      toast({ title: "¡Publicado!", description: "La noticia se publicó correctamente." });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["publicaciones"] });
    } catch (err: any) {
      toast({ title: "Error al publicar", description: err.message, variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Send className="h-4 w-4 text-primary" />
        Compartir Noticia
      </h2>

      <div className="space-y-2">
        <Input
          placeholder="Título de la noticia"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <RichTextEditor
        content={descripcion}
        onChange={setDescripcion}
        placeholder="Escribe el cuerpo de la noticia..."
      />

      <div className="flex flex-wrap gap-3">
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {imagePreview ? (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-16 w-auto rounded-lg border object-cover" />
            <button
              onClick={clearImage}
              className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            Foto
          </Button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      <Button onClick={handlePublish} disabled={publishing} className="w-full">
        {publishing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Publicando...
          </>
        ) : (
          "Publicar"
        )}
      </Button>
    </div>
  );
}
