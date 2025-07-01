
import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";

interface Artist {
  id: string;
  name: string;
  profile_picture: string;
}

export interface ArtworkDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  discounted_price?: number;
  edition?: string;
  size?: string;
  medium?: string;
  artwork_style?: string;
  year_created?: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  artist: Artist;
  image_urls: string[];
  likes_count: number;
  rating?: number;
  total_reviews?: number;
  review_breakdown?: Record<string, number>;
}

export const useSellArtworkDetail = (id: string | undefined) => {
  const [data, setData] = useState<ArtworkDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchArtwork = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await apiClient.get(`/art/marketplace/${id}/`);
        setData(res.data);
      } catch (err: any) {
        const msg =
          err.response?.data?.detail || "Failed to fetch artwork details.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  return { data, isLoading, error };
};
