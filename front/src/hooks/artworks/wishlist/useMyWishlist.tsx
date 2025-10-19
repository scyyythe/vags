import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";
import { SellCardProps } from "@/components/user_dashboard/Marketplace/cards/SellCard";

const fetchWishlist = async (): Promise<SellCardProps[]> => {
  const token = localStorage.getItem("access_token");
  if (!token) return [];

  const response = await apiClient.get("/wishlist/my/");
  return response.data.map((item: any) => ({
    id: item.id,
    title: item.title,
    price: item.discounted_price ?? item.price,
    originalPrice: item.discounted_price ? item.price : undefined,
    artworkImage: item.image_url?.[0] || "/images/placeholder.jpg",
    additionalImages: item.image_url?.slice(1) || [],
    rating: item.average_rating ?? 0,
    isLiked: true,
    artist: item.artist,
    artistId: item.artist_id,
    profile_picture: item.profile_picture,
    category: item.category,
    edition: item.edition,
    size: item.size,
    yearCreated: item.year_created,
    medium: item.medium,
    description: item.description,
    quantity: item.quantity,
    default_paypal_email: item.default_paypal_email,
    status: item.art_status || "active",
  }));
};

const useMyWishlist = () => {
  return useQuery<SellCardProps[]>({
    queryKey: ["myWishlist"],
    queryFn: fetchWishlist,
  });
};

export default useMyWishlist;
