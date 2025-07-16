export async function autoTranslate(text: string, targetLang: string): Promise<string> {
  const res = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`
  );
  const data = await res.json();
  return data[0][0][0];
}
