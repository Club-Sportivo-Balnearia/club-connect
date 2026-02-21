import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Shield, Upload, Video, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const categorias = [
  "Fútbol",
  "Vóley",
  "Patín",
  "Básquet",
  "Pádel",
];

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/inicio" replace />;

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
    setVideoUrl("");
    clearImage();
  };

  const handlePublish = async () => {
    if (!titulo.trim() || !categoria) {
      toast({ title: "Error", description: "Título y categoría son obligatorios.", variant: "destructive" });
      return;
    }

    setPublishing(true);
    let imagen_url: string | null = null;

    try {
      // Upload image if present
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
        video_url: videoUrl.trim() || null,
        user_id: user.id,
      });

      if (error) throw error;

      toast({ title: "¡Publicado!", description: "La noticia se publicó correctamente." });
      resetForm();
    } catch (err: any) {
      toast({ title: "Error al publicar", description: err.message, variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold">Publicar Noticia</h2>

        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            placeholder="Título de la noticia"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            placeholder="Escribe la descripción de la noticia..."
            rows={5}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un deporte" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Imagen */}
        <div className="space-y-2">
          <Label>Imagen</Label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-40 w-auto rounded-lg border object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-32 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Upload className="h-5 w-5" />
              Subir imagen
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Video URL */}
        <div className="space-y-2">
          <Label htmlFor="video">Enlace de video (YouTube)</Label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="video"
              placeholder="https://www.youtube.com/watch?v=..."
              className="pl-10"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <Button onClick={handlePublish} disabled={publishing} className="w-full">
          {publishing ? "Publicando..." : "Publicar Noticia"}
        </Button>
      </div>
    </div>
  );
};

export default Admin;
