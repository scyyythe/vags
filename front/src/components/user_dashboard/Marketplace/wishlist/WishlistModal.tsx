import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import SellCard, { SellCardProps } from "../cards/SellCard";
import { useWishlist } from "./WishlistContext";
import { useIsAuthenticated } from "@/auth/useIsAuthenticated";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: SellCardProps[];
  onRemoveFromWishlist: (id: string) => void;
    removeLocalItem: (id: string) => void; 
}

const WishlistModal = ({ isOpen, onClose, wishlistItems, onRemoveFromWishlist, removeLocalItem, }: WishlistModalProps) => {
  const { toggleWishlist } = useWishlist();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  
    if (!isAuthenticated) return null;
  const onCardClick = useCallback((id: string) => {
    if (!id) return;
    navigate(`/viewproduct/${id}/`);
  }, [navigate]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black bg-opacity-0 fixed inset-0 z-50" />
        <DialogContent
          className="max-w-md md:max-w-5xl max-h-[80vh] rounded-md overflow-y-auto wishlist-scrollbar"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">My Wishlist</DialogTitle>
          </DialogHeader>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-7 h-7 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-[10px]">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {wishlistItems.map((item) => (
                <SellCard
                    onCardClick={() => onCardClick(item.id)}
                  key={item.id}
                  {...item}
                  
               onLike={() => toggleWishlist(item.id)}
                />
              ))}
            </div>
          )}
        </DialogContent>
    </Dialog>
  );
};

export default WishlistModal;