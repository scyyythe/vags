import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { SellCardProps } from "@/components/user_dashboard/Marketplace/cards/SellCard";

const useMyWishlist = () => {
  const [wishlist, setWishlist] = useState<SellCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      const response = await apiClient.get("/wishlist/my/");
      const data = response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.discounted_price ?? item.price,
        originalPrice: item.discounted_price ? item.price : undefined,
        artworkImage: item.image_url?.[0] || "/images/placeholder.jpg",
        rating: item.total_ratings ?? item.likes_count ?? 0,
        isLiked: true,
      }));
      setWishlist(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load wishlist");
      console.error("❌ Wishlist fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return { wishlist, isLoading, error, refetch: fetchWishlist };
};

export default useMyWishlist;
