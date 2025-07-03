import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import useMyWishlist from "@/hooks/artworks/wishlist/useMyWishlist";
import apiClient from "@/utils/apiClient";
import { SellCardProps } from "@/components/user_dashboard/Marketplace/cards/SellCard";

interface WishlistContextType {
  likedItems: Set<string>;
  wishlist: SellCardProps[];
  toggleWishlist: (id: string) => Promise<void>;
  removeFromWishlist: (id: string) => void;
  addToWishlist: (item: SellCardProps) => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { data: wishlist = [], isLoading } = useMyWishlist();
  const queryClient = useQueryClient();

  const likedItems = useMemo(() => new Set(wishlist.map((item) => item.id)), [wishlist]);

  // Toggle wishlist mutation
  const mutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/wishlist/toggle/${id}/`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myWishlist"] });
    },
    onError: (error) => {
      console.error("❌ Error toggling wishlist:", error);
    },
  });

  const toggleWishlist = async (id: string) => {
    await mutation.mutateAsync(id);
  };

  // Manual add: update the query cache
  const addToWishlist = (item: SellCardProps) => {
    queryClient.setQueryData<SellCardProps[]>(["myWishlist"], (prev = []) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev : [item, ...prev];
    });
  };

  // Manual remove: update the query cache
  const removeFromWishlist = (id: string) => {
    queryClient.setQueryData<SellCardProps[]>(["myWishlist"], (prev = []) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        likedItems,
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        addToWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
