import { NewsFeed } from "@/components/NewsFeed";
import { useParams } from "react-router-dom";

const subcategorias: Record<string, string> = {
  "primera-reserva": "Primera y reserva",
  "femenino": "Femenino",
  "inferiores": "Inferiores",
};

const FutbolPage = () => {
  const { sub } = useParams();
  const subLabel = sub ? subcategorias[sub] : undefined;

  return (
    <NewsFeed
      title={subLabel ? `Fútbol — ${subLabel}` : "Fútbol"}
      categoria="Fútbol"
    />
  );
};

export default FutbolPage;
