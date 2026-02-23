import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Shield, Upload, Video, Link as LinkIcon, X, Loader2, Users, Newspaper } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { UserManagement } from "@/components/UserManagement";

const categorias = ["Fútbol", "Vóley", "Patín", "Básquet", "Pádel"];

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [videoMode, setVideoMode] = useState<"link" | "upload">("link");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoFileName(file.name);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearVideoFile = () => {
    setVideoFile(null);
    setVideoFileName("");
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setCategoria("");
    setVideoUrl("");
    setVideoMode("link");
    clearImage();
    clearVideoFile();
  };

  const handlePublish = async () => {
    if (!titulo.trim() || !categoria) {
      toast({ title: "Error", description: "Título y categoría son obligatorios.", variant: "destructive" });
      return;
    }

    setPublishing(true);
    let imagen_url: string | null = null;
    let video_url: string | null = null;

    try {
      // Upload image
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

      // Handle video
      if (videoMode === "link" && videoUrl.trim()) {
        video_url = videoUrl.trim();
      } else if (videoMode === "upload" && videoFile) {
        const ext = videoFile.name.split(".").pop();
        const filePath = `videos/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("publicaciones")
          .upload(filePath, videoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("publicaciones")
          .getPublicUrl(filePath);
        video_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("publicaciones").insert({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        categoria,
        imagen_url,
        video_url,
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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>

      <Tabs defaultValue="publicar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="publicar" className="gap-2">
            <Newspaper className="h-4 w-4" />
            Publicar Noticia
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="h-4 w-4" />
            Gestión de Usuarios
          </TabsTrigger>
        </TabsList>

        {/* ── Publicar Noticia ── */}
        <TabsContent value="publicar">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold">Nueva Publicación</h2>

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
              <Label htmlFor="descripcion">Texto</Label>
              <Textarea
                id="descripcion"
                placeholder="Escribe el cuerpo de la noticia..."
                rows={6}
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
              <Label>Foto</Label>
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

            {/* Video - dual mode */}
            <div className="space-y-3">
              <Label>Video</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={videoMode === "link" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setVideoMode("link"); clearVideoFile(); }}
                  className="gap-1.5"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Enlace YouTube
                </Button>
                <Button
                  type="button"
                  variant={videoMode === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setVideoMode("upload"); setVideoUrl(""); }}
                  className="gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Subir archivo
                </Button>
              </div>

              {videoMode === "link" ? (
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-10"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  {videoFileName ? (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate flex-1">{videoFileName}</span>
                      <button onClick={clearVideoFile}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Upload className="h-5 w-5" />
                      Seleccionar video
                    </button>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoFileChange}
                  />
                </>
              )}
            </div>

            {/* Submit */}
            <Button onClick={handlePublish} disabled={publishing} size="lg" className="w-full text-base">
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publicando...
                </>
              ) : (
                "Publicar Noticia"
              )}
            </Button>
          </div>
        </TabsContent>

        {/* ── Gestión de Usuarios ── */}
        <TabsContent value="usuarios">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Gestión de Usuarios</h2>
            <UserManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
