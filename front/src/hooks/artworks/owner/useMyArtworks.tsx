import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

interface Artwork {
  id: string;
  title: string;
  artistName: string;
  artist_id: string;
  artist: string;
  description: string;
  category: string;
  medium: string;
  status: string;
  price: number;
  visibility: string;
  created_at: string;
  image_url: string;
  likes_count: number;
  artistImage: string;
  style: string;
  datePosted: string;
  artworkImage: string;
  likesCount: number;
}
const fetchMyArtworks = async (currentPage: number): Promise<Artwork[]> => {
  const response = await apiClient.get("art/list/created-by-me/", {
    params: { page: currentPage, limit: 20 },
  });

  console.log(response.data);

  return response.data.map((artwork: Artwork) => ({
    id: artwork.id,
    title: artwork.title,
    artistName: artwork.artist,
    artistId: artwork.artist_id,
    artistImage: "",
    description: artwork.description,
    style: artwork.category,
    medium: artwork.medium,
    status: artwork.status,
    price: artwork.price,
    visibility: artwork.visibility,
    datePosted: new Date(artwork.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    artworkImage: artwork.image_url,
    likesCount: artwork.likes_count,
  }));
};

const useMyArtworks = (currentPage: number) => {
  return useQuery({
    queryKey: ["myArtworks", currentPage],
    queryFn: () => fetchMyArtworks(currentPage),
    staleTime: 1000 * 60 * 5,
  });
};

export default useMyArtworks;
