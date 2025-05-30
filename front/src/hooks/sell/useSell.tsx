import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/apiClient";

export interface useSell {
  id: string;
  artworkImage: string;
  price: number;
  originalPrice: number;
  title: string;
  isMarketplace?: boolean;
}

