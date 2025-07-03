import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { SellCardProps } from "@/components/user_dashboard/Marketplace/cards/SellCard";

const fetchWishlist = async (): Promise<SellCardProps[]> => {
  const response = await apiClient.get("/wishlist/my/");
  return response.data.map((item: any) => ({
    id: item.id,
    title: item.title,
    price: item.discounted_price ?? item.price,
    originalPrice: item.discounted_price ? item.price : undefined,
    artworkImage: item.image_url?.[0] || "/images/placeholder.jpg",
    rating: item.total_ratings ?? item.likes_count ?? 0,
    isLiked: true,
  }));
};

const useMyWishlist = () => {
  const token = localStorage.getItem("access_token");

  return useQuery({
    queryKey: ["myWishlist"],
    queryFn: fetchWishlist,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

export default useMyWishlist;
