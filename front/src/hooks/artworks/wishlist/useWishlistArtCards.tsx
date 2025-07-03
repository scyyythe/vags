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
        price: art.discounted_price ?? art.price,
        originalPrice: art.discounted_price ? art.price : undefined,
        title: art.title,
        edition: art.edition_type || "",
        rating: art.total_ratings,
        isLiked: true,
        onLike: () => {},
        isMarketplace: true,
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
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const addLocalItem = useCallback(async (id: string) => {
    try {
      const response = await apiClient.get(`/art/${id}/`);
      const data = response.data;
      const newItem: SellCardProps = {
        id: data.id,
        artworkImage: data.image_url?.[0] || "/images/placeholder.jpg",
        price: data.discounted_price ?? data.price,
        originalPrice: data.discounted_price ? data.price : undefined,
        title: data.title,
        edition: data.edition_type || "",
        rating: data.total_ratings,
        isLiked: true,
        onLike: () => {},
        isMarketplace: true,
        onCardClick: () => {},
      };
      setWishlistItems(prev => [...prev, newItem]);
    } catch (err) {
      console.error("❌ Failed to add new wishlist item:", err);
    }
  }, []);

  return { wishlistItems, isLoading, error, removeLocalItem, addLocalItem };
};

export default useWishlistArtCards;
