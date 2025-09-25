import { useState, useEffect } from "react";
import { autoTranslate } from "@/utils/autoTranslate";

export function useAutoTranslation(text: string | undefined, lang: string) {
  // Always initialize state — even if text is undefined
  const [translated, setTranslated] = useState(text ?? "");

  useEffect(() => {
    // If no text provided, just reset and exit
    if (!text) {
      setTranslated("");
      return;
    }

    // If language is English, just use the original text
    if (lang.toLowerCase() === "en") {
      setTranslated(text);
      return;
    }

    // Otherwise, run translation
    autoTranslate(text, lang.toLowerCase())
      .then(setTranslated)
      .catch(() => setTranslated(text)); // fallback in case of error
  }, [text, lang]);

  return translated;
}
