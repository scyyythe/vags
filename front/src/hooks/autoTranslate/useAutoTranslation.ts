import { useState, useEffect } from "react";
import { autoTranslate } from "@/utils/autoTranslate";

export function useAutoTranslation(text: string, lang: string) {
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (lang.toLowerCase() === "en") {
      setTranslated(text);
      return;
    }

    autoTranslate(text, lang.toLowerCase())
      .then(setTranslated)
      .catch((error) => {
        console.warn(`Auto-translation failed for "${text}" to ${lang}:`, error);
        setTranslated(text); // Fallback to original text
      });
  }, [text, lang]);

  return translated;
}
