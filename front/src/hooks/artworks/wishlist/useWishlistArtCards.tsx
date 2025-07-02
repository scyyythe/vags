
import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { SellCardProps } from "@/components/user_dashboard/Marketplace/cards/SellCard";
// useWishlistArtCards.ts
const useWishlistArtCards = (wishlistIds: string[]) => {
  const [wishlistItems, setWishlistItems] = useState<SellCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    if (wishlistIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/art/wishlist/", { ids: wishlistIds });
      const data = response.data;

      const mappedItems: SellCardProps[] = data.map((art: any) => ({
        id: art.id,
        artworkImage: art.image_url?.[0] || "/images/placeholder.jpg",
        price: art.discounted_price ?? art.price,
        originalPrice: art.discounted_price ? art.price : undefined,
        title: art.title,
        edition: "",
        rating: art.total_ratings,
        isLiked: true,
        onLike: () => {},
        isMarketplace: true,
        onCardClick: () => {},
      }));

      setWishlistItems(mappedItems);
    } catch (err: any) {
      console.error("❌ Error fetching wishlist:", err);
      setError("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [wishlistIds]);

  const removeLocalItem = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  const addLocalItem = async (id: string) => {
    try {
      const response = await apiClient.post("/art/wishlist/", { ids: [id] });
      const data = response.data?.[0];
      if (data) {
        const newItem: SellCardProps = {
          id: data.id,
          artworkImage: data.image_url?.[0] || "/images/placeholder.jpg",
          price: data.discounted_price ?? data.price,
          originalPrice: data.discounted_price ? data.price : undefined,
          title: data.title,
          edition: "",
          rating: data.total_ratings,
          isLiked: true,
          onLike: () => {},
          isMarketplace: true,
          onCardClick: () => {},
        };
        setWishlistItems(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch new wishlist item:", error);
    }
  };

  return { wishlistItems, isLoading, error, removeLocalItem, addLocalItem };
};
export default useWishlistArtCards;