import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { CommentsSection } from "@/components/CommentsSection";

interface PostCardProps {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  imagen_url: string | null;
  video_url: string | null;
  fecha: string;
}

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export function PostCard({ id, titulo, descripcion, categoria, imagen_url, video_url, fecha }: PostCardProps) {
  const ytId = video_url ? getYouTubeId(video_url) : null;

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Media */}
      {ytId ? (
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : imagen_url ? (
        <img
          src={imagen_url}
          alt={titulo}
          className="aspect-video w-full object-cover"
          loading="lazy"
        />
      ) : null}

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            {categoria}
          </Badge>
          <time className="text-xs text-muted-foreground">
            {format(new Date(fecha), "d 'de' MMMM, yyyy", { locale: es })}
          </time>
        </div>
        <h3 className="text-lg font-semibold leading-tight">{titulo}</h3>
        {descripcion && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: descripcion }}
          />
        )}
      </div>

      {/* Comments */}
      <CommentsSection publicacionId={id} />
    </article>
  );
}
