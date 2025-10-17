import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { autoTranslate } from "@/utils/autoTranslate";

export const ART_CATEGORIES = [
  // Visual Arts
  "Painting",
  "Drawing",
  "Sculpture",
  "Photography",
  "Printmaking",
  "Digital Art",
  "Mixed Media",
  "Illustration",
  // Media Arts
  "3D Modeling and Animation",
  "Videography",
  "Film and Cinema",
  "Interactive Media",
  "Sound Art",
  "Multimedia Installations",
  "Graphic Design",
  "Motion Graphics",

  // Decorative Arts
  "Ceramics",
  "Glassware",
  "Textiles",
  "Furniture Design",
  "Metalwork",
  "Woodwork",
  "Jewelry Design",

  // Applied Arts
  "Industrial Design",
  "Fashion Design",
  "Interior Design",
  "Architecture",
  "Landscape Design",

  // Performing Arts (if you wish to include them)
  "Performance Art",
  "Theater",
  "Dance",
  "Music",
  "Opera",
  "Circus Arts",

  // Literary Arts (optional for artwork platforms)
  "Calligraphy",
  "Poetry",
  "Prose",

  // Traditional and Folk Arts
  "Crafts",
  "Folk Art",
  "Ethnic Art Forms",

  // Other/Contemporary
  "Body Art",
  "Floral Design",
  "Paper Art",
  "Mosaic Art",
] as const;

export const useArtCategories = () => {
  const { language } = useLanguage();
  const [translatedCategories, setTranslatedCategories] = useState<string[]>([...ART_CATEGORIES]);

  useEffect(() => {
    const translateCategories = async () => {
      try {
        const translated = await Promise.all(
          ART_CATEGORIES.map(async (category) => await autoTranslate(category, language.toLowerCase()))
        );
        setTranslatedCategories(translated);
      } catch (error) {
        console.warn("Failed to translate categories:", error);
        // Fallback to original categories if translation fails
        setTranslatedCategories([...ART_CATEGORIES]);
      }
    };

    translateCategories();
  }, [language]);

  return translatedCategories;
};
