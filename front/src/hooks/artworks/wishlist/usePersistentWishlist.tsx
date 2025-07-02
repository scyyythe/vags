
import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { SellCardProps } from "@/components/user_dashboard/Marketplace/cards/SellCard";

const usePersistentWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<SellCardProps[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
     
      const idRes = await apiClient.get("/wishlist/my-ids/");
      const ids: string[] = idRes.data.ids || [];

      setWishlistIds(ids);

      if (ids.length === 0) {
        setWishlistItems([]);
        setIsLoading(false);
        return;
      }

      const res = await apiClient.post("/art/wishlist/", { ids });
      const mappedItems: SellCardProps[] = res.data.map((art: any) => ({
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
      console.error("❌ Error loading wishlist:", err);
      setError("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return {
    wishlistItems,
    wishlistIds,
    isLoading,
    error,
    refetch: fetchWishlist,
  };
};

export default usePersistentWishlist;
