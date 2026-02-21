import { NewsFeed } from "@/components/NewsFeed";

const categoriaMap: Record<string, { title: string; cat: string }> = {
  voley: { title: "Vóley", cat: "Vóley" },
  patin: { title: "Patín", cat: "Patín" },
  basquet: { title: "Básquet", cat: "Básquet" },
  padel: { title: "Pádel", cat: "Pádel" },
};

export function DeportePage({ deporte }: { deporte: string }) {
  const info = categoriaMap[deporte];
  if (!info) return null;
  return <NewsFeed title={info.title} categoria={info.cat} />;
}
