import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface WishlistItem {
  id: string;
  image: string;
  title: string;
  price: number;
}

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: WishlistItem[];
  onRemoveFromWishlist: (id: string) => void;
}

const WishlistModal = ({ isOpen, onClose, wishlistItems, onRemoveFromWishlist }: WishlistModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">My Wishlist</DialogTitle>
        </DialogHeader>
        
        {wishlistItems.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <button 
                    onClick={() => onRemoveFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>
                
                <div className="p-4">
                  <p className="text-lg font-semibold text-gray-900 mb-2">₱ {item.price}</p>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-medium">
                    Buy Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WishlistModal;
