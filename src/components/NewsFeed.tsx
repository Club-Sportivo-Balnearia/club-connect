import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper } from "lucide-react";
import { QuickPublishForm } from "@/components/QuickPublishForm";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";

interface NewsFeedProps {
  categoria?: string;
  title: string;
  subtitle?: string;
  logoSrc?: string;
}

export function NewsFeed({ categoria, title, subtitle, logoSrc }: NewsFeedProps) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const { data: posts, isLoading } = useQuery({
    queryKey: ["publicaciones", categoria],
    queryFn: async () => {
      let query = supabase
        .from("publicaciones")
        .select("*")
        .order("fecha", { ascending: false });

      if (categoria) {
        query = query.eq("categoria", categoria);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            {logoSrc && (
              <img src={logoSrc} alt={title} className="h-12 w-12 object-contain rounded" />
            )}
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Quick publish form */}
        <div className="mb-8">
          <QuickPublishForm user={user} onLoginClick={() => setAuthOpen(true)} />
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !posts?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">
              Aún no hay noticias{categoria ? ` en ${categoria}` : ""}.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
