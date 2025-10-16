import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { autoTranslate } from "@/utils/autoTranslate";

const MEDIUM_OPTIONS = [
// Traditional mediums
"Acrylic",
"Oil",
"Watercolor",
"Ink",
"Charcoal",
"Pastel",
"Pencil",
"Graphite",
"Chalk",
"Tempera",
"Gouache",

// Mixed media & collage
"Mixed Media",
"Collage",
"Assemblage",

// Sculpture and 3D
"Clay",
"Resin",
"Marble",
"Bronze",
"Wood",
"Metal",
"Stone",
"Glass",
"Plaster",

// Textile and craft
"Textile",
"Embroidery",
"Quilt",
"Yarn",
"Felt",
"Weaving",
"Fiber Art",
"Tapestry",

// Printmaking
"Etching",
"Lithography",
"Screen Print",
"Monotype",
"Linocut",
"Woodcut",

// Photography and digital
"Photography",
"Film",
"Digital Art",
"Digital Painting",
"Pixel Art",
"Generative Art",
"AI Art",
"3D Model",
"AR/VR",
"GIF",
"Video Art",

// Canvas types (as context)
"Canvas",
"Paper",
"Board",
"Panel",

// Other experimental or alternative
"Installation",
"Performance",
"Sound Art",
"Light Art",
"Bio Art",
"Interactive Media",
] as const;

export const useMediumOptions = () => {
  const { language } = useLanguage();
  const [translatedMediums, setTranslatedMediums] = useState<string[]>([...MEDIUM_OPTIONS]);

  useEffect(() => {
    const translateMediums = async () => {
      const translated = await Promise.all(
        MEDIUM_OPTIONS.map(async (medium) => await autoTranslate(medium, language.toLowerCase()))
      );
      setTranslatedMediums(translated);
    };

    translateMediums();
  }, [language]);

  return translatedMediums;
};
