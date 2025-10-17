export async function autoTranslate(text: string, targetLang: string): Promise<string> {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );
    
    if (!res.ok) {
      throw new Error(`Translation API failed with status: ${res.status}`);
    }
    
    const data = await res.json();
    return data[0][0][0];
  } catch (error) {
    console.warn(`Translation failed for "${text}" to ${targetLang}:`, error);
    // Return original text if translation fails
    return text;
  }
}
