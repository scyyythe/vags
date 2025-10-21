/**
 * Safely extracts the first image URL from artwork data
 * Handles both array and string formats for image_url
 */
export const getArtworkImageUrl = (imageUrl: string | string[] | undefined | null): string => {
  // If it's null or undefined, return placeholder
  if (!imageUrl) {
    return "/pics/placeholder.svg";
  }

  // If it's already a string, return it
  if (typeof imageUrl === "string") {
    return imageUrl || "/pics/placeholder.svg";
  }

  // If it's an array, return the first element or placeholder
  if (Array.isArray(imageUrl)) {
    return imageUrl[0] || "/pics/placeholder.svg";
  }

  // Fallback
  return "/pics/placeholder.svg";
};
