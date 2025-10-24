import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import SellCard, { SellCardProps } from "../cards/SellCard";
import { useWishlist } from "./WishlistContext";
import { useIsAuthenticated } from "@/auth/useIsAuthenticated";
import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import useBulkReportStatus from "@/hooks/mutate/report/useReportStatus";
import { getLoggedInUserId } from "@/auth/decode";

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: SellCardProps[];
  onRemoveFromWishlist: (id: string) => void;
  removeLocalItem: (id: string) => void;
}

const WishlistModal = ({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  removeLocalItem,
}: WishlistModalProps) => {
  const { toggleWishlist, likedItems } = useWishlist();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const loggedInUserId = getLoggedInUserId();

  // Translation hooks
  const { language } = useLanguage();
  const myWishlistText = useAutoTranslation("My Wishlist", language);
  const wishlistEmptyText = useAutoTranslation("Your wishlist is empty", language);

  // Get artwork IDs for bulk report status lookup
  const artworkIds = wishlistItems.map((item) => item.id);
  const { data: bulkReportStatus } = useBulkReportStatus(artworkIds);

  // Create lookup map for report status
  const reportStatusMap = useMemo(() => {
    if (!bulkReportStatus) return {};
    return bulkReportStatus;
  }, [bulkReportStatus]);

  if (!isAuthenticated) return null;

  const onCardClick = useCallback(
    (id: string) => {
      if (!id) return;
      navigate(`/viewproduct/${id}/`);
    },
    [navigate]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black bg-opacity-0 fixed inset-0 z-50" />
      <DialogContent
        className="max-w-md md:max-w-5xl max-h-[80vh] rounded-md overflow-y-auto wishlist-scrollbar bg-white dark:bg-gray-800"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">{myWishlistText}</DialogTitle>
        </DialogHeader>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-7 h-7 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-[10px]">{wishlistEmptyText}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {wishlistItems.map((item) => {
              // Ensure required behavior: show marketplace actions + Buy Now
              const normalizedStatus = item.status ?? "active";
              const isOwner = item.artistId === loggedInUserId;

              return (
                <SellCard
                  key={item.id}
                  {...item}
                  status={normalizedStatus}
                  isMarketplace={true}
                  isProfileView={false}
                  isWishlistView={true}
                  isLiked={likedItems.has(item.id)}
                  onLike={() => toggleWishlist(item.id)}
                  onCardClick={() => onCardClick(item.id)}
                  isOwner={isOwner}
                  isReported={reportStatusMap[item.id]?.reported || false}
                  onRelist={undefined}
                  onUnlist={undefined}
                />
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WishlistModal;
