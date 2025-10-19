import { useEffect, useState, useCallback } from "react";
import apiClient from "@/utils/apiClient";
import { SellCardProps } from "@/components/user_dashboard/Marketplace/cards/SellCard";

const useWishlistArtCards = (wishlistIds: string[]) => {
  const [wishlistItems, setWishlistItems] = useState<SellCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!wishlistIds || wishlistIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/art/wishlist/", { ids: wishlistIds });
      const mappedItems: SellCardProps[] = response.data.map((art: any) => ({
        id: art.id,
        artworkImage: art.image_url?.[0] || "/images/placeholder.jpg",
        additionalImages: art.image_url?.slice(1) || [],
        price: art.discounted_price ?? art.price,
        originalPrice: art.discounted_price ? art.price : undefined,
        title: art.title,
        artist: art.artist,
        artistId: art.artist_id,
        profile_picture: art.profile_picture,
        category: art.category,
        edition: art.edition_type || art.edition || "",
        size: art.size,
        yearCreated: art.year_created,
        medium: art.medium,
        description: art.description,
        quantity: art.quantity,
        default_paypal_email: art.default_paypal_email,
        rating: art.average_rating ?? art.total_ratings ?? 0,
        isLiked: true,
        status: art.art_status || "active",
        onLike: () => {},
        isMarketplace: true,
        isProfileView: false,
        onCardClick: () => {},
      }));
      setWishlistItems(mappedItems);
    } catch (err) {
      console.error("❌ Error fetching wishlist:", err);
      setError("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  }, [wishlistIds]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeLocalItem = useCallback((id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addLocalItem = useCallback(async (id: string) => {
    try {
      const response = await apiClient.get(`/art/${id}/`);
      const data = response.data;
      const newItem: SellCardProps = {
        id: data.id,
        artworkImage: data.image_url?.[0] || "/images/placeholder.jpg",
        additionalImages: data.image_url?.slice(1) || [],
        price: data.discounted_price ?? data.price,
        originalPrice: data.discounted_price ? data.price : undefined,
        title: data.title,
        artist: data.artist,
        artistId: data.artist_id,
        profile_picture: data.profile_picture,
        category: data.category,
        edition: data.edition_type || data.edition || "",
        size: data.size,
        yearCreated: data.year_created,
        medium: data.medium,
        description: data.description,
        quantity: data.quantity,
        default_paypal_email: data.default_paypal_email,
        rating: data.average_rating ?? data.total_ratings ?? 0,
        isLiked: true,
        status: data.art_status || "active",
        onLike: () => {},
        isMarketplace: true,
        isProfileView: false,
        onCardClick: () => {},
      };
      setWishlistItems((prev) => [...prev, newItem]);
    } catch (err) {
      console.error("❌ Failed to add new wishlist item:", err);
    }
  }, []);

  return { wishlistItems, isLoading, error, removeLocalItem, addLocalItem };
};

export default useWishlistArtCards;
