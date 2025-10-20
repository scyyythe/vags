import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { autoTranslate } from "@/utils/autoTranslate";

const PopularArtworks = () => {
  const { language } = useLanguage();

  const artworks = [
    {
      id: "1",
      name: "Abstract Portrait",
      price: "5000",
      sold: "175k",
      image: "https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=1374&auto=format&fit=crop",
    },
    {
      id: "2",
      name: "Neon Dreams",
      price: "5000",
      sold: "100k",
      image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: "3",
      name: "City Sunset",
      price: "5000",
      sold: "75k",
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1374&auto=format&fit=crop",
    },
  ];

  // State for translated artwork names
  const [translatedArtworks, setTranslatedArtworks] = useState(artworks);

  // Translation hooks for static text
  const popularArtworksText = useAutoTranslation("Popular Artworks", language);
  const soldText = useAutoTranslation("sold", language);
  const viewMoreText = useAutoTranslation("View more", language);

  // Effect to translate artwork names
  useEffect(() => {
    const translateArtworkNames = async () => {
      try {
        if (language.toLowerCase() !== "en") {
          const translated = await Promise.all(
            artworks.map(async (artwork) => ({
              ...artwork,
              name: await autoTranslate(artwork.name, language.toLowerCase())
            }))
          );
          setTranslatedArtworks(translated);
        } else {
          setTranslatedArtworks(artworks);
        }
      } catch (error) {
        console.warn("Failed to translate artwork names:", error);
        // Fallback to original data
        setTranslatedArtworks(artworks);
      }
    };

    translateArtworkNames();
  }, [language]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">{popularArtworksText}</h2>
      <div className="space-y-4">
        {translatedArtworks.map((artwork) => (
          <div key={artwork.id} className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden">
              <img
                src={artwork.image}
                alt={artwork.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">{artwork.name}</h3>
              <div className="text-xs text-muted-foreground">₱ {artwork.price}</div>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              <div className="font-medium text-foreground">{artwork.sold}</div>
              <div className="text-gray-500">{soldText}</div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full text-center text-sm mt-4 text-muted-foreground hover:text-foreground transition-colors">
        {viewMoreText}
      </button>
    </div>
  );
};

export default PopularArtworks;
