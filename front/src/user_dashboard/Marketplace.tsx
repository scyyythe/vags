import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import CategoryFilter from "@/components/user_dashboard/Marketplace/category_filter/CategoryFilter";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import TopSellers from "@/components/user_dashboard/Marketplace/top_seller/TopSellersPreview";
import WishlistModal from "@/components/user_dashboard/Marketplace/wishlist/WishlistModal";
import SellCard from "@/components/user_dashboard/Marketplace/cards/SellCard";
import { useWishlist } from "@/components/user_dashboard/Marketplace/wishlist/WishlistContext";
import { toast } from "sonner";
import SellCardSkeleton from "@/components/skeletons/marketplace/SellCardSkeleton";
import useFollowedArtworksOnSale from "@/hooks/artworks/follow_artworks/useFollowedArtworksOnSale";
import useWishlistArtCards from "@/hooks/artworks/wishlist/useWishlistArtCards";
import { ChevronDown } from "lucide-react";
import { useTrendingArtworks } from "@/hooks/artworks/sell/useTrendingArtworks";
import { getLoggedInUserId } from "@/auth/decode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import useFetchArtCards from "@/hooks/artworks/sell/useFetchArtCards";
import type { SellCardProps as Artwork } from "@/components/user_dashboard/Marketplace/cards/SellCard";
import ActiveAccountOnly from "@/components/auth/ActiveAccountOnly";
import useBulkReportStatus from "@/hooks/mutate/report/useReportStatus";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useRelistArtwork } from "@/hooks/artworks/relist/useRelistArtwork";
import useMarkArtworkAsUnlisted from "@/hooks/purchase/useMarkArtworkAsUnlisted";
import { useCheckPaymentAccounts } from "@/hooks/accounts/useCheckPaymentAccounts";
import PaymentSetupPopup from "@/components/user_dashboard/Marketplace/cards/PaymentSetupPopup";

const Marketplace = () => {
  const queryClient = useQueryClient();
  const loggedInUserId = getLoggedInUserId();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedArtCategory, setSelectedArtCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [selectedEdition, setSelectedEdition] = useState("All");
  const [reportedArtworks, setReportedArtworks] = useState<Set<string>>(new Set());
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isPaymentSetupPopupOpen, setIsPaymentSetupPopupOpen] = useState(false);
  const { data: trendingArtworks = [] } = useTrendingArtworks();
  const { hasPaymentAccounts, loading: paymentAccountsLoading } = useCheckPaymentAccounts();

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  // Translation hooks
  const { language } = useLanguage();
  const marketplaceText = useAutoTranslation("Marketplace", language);
  const wishlistText = useAutoTranslation("Wishlist", language);
  const sellText = useAutoTranslation("Sell", language);
  const latestText = useAutoTranslation("Latest", language);
  const priceLowToHighText = useAutoTranslation("Price: Low to High", language);
  const priceHighToLowText = useAutoTranslation("Price: High to Low", language);
  const mostPopularText = useAutoTranslation("Most Popular", language);
  const original1of1Text = useAutoTranslation("Original (1 of 1)", language);
  const limitedEditionText = useAutoTranslation("Limited Edition", language);
  const openEditionText = useAutoTranslation("Open Edition", language);
  const removedFromWishlistText = useAutoTranslation("Removed from wishlist", language);
  const errorLoadingFollowedText = useAutoTranslation("Error loading followed artworks. Please try again.", language);
  const noArtworksFromFollowingsText = useAutoTranslation("No artworks from your followings yet.", language);
  const noArtworksMatchFiltersText = useAutoTranslation("No artworks match your current filters.", language);
  const retryText = useAutoTranslation("Retry", language);
  const errorLoadingArtworksText = useAutoTranslation("Error loading artworks. Please try again.", language);
  const noArtworksFoundText = useAutoTranslation("No artworks found for this filter.", language);

  const {
    data: followedArtworksData,
    isLoading: isFollowedLoading,
    error: followedError,
    refetch: refetchFollowed,
  } = useFollowedArtworksOnSale(1, selectedCategoryFilter === "Following");

  const categories = ["All", "Trending", "Following"];
  const navigate = useNavigate();

  const sortOptions = [
    { value: "Latest", label: latestText },
    { value: "Price: Low to High", label: priceLowToHighText },
    { value: "Price: High to Low", label: priceHighToLowText },
    { value: "Most Popular", label: mostPopularText },
  ];
  const editionOptions = [
    { value: "Original (1 of 1)", label: original1of1Text },
    { value: "Limited Edition", label: limitedEditionText },
    { value: "Open Edition", label: openEditionText },
  ];

  const [showWishlist, setShowWishlist] = useState(false);
  const { data: artCards, isLoading, error, refetch } = useFetchArtCards();

  // Ensure artCards is always an array
  const safeArtCards = Array.isArray(artCards) ? artCards : [];

  // Background refetching using useQueryClient
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startRefetching = () => {
      interval = setInterval(() => {
        queryClient.refetchQueries({
          queryKey: ["marketplace-art-cards"],
        });
      }, 30000); // Refetch every 30 seconds
    };

    const stopRefetching = () => {
      if (interval) {
        clearInterval(interval);
      }
    };

    // Start refetching when component mounts
    startRefetching();

    // Stop refetching when tab becomes inactive, resume when active
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRefetching();
      } else {
        startRefetching();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopRefetching();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  // Get artwork IDs for bulk report status lookup
  const artworkIds = safeArtCards.map((art) => art.id);
  const { data: bulkReportStatus } = useBulkReportStatus(artworkIds);

  // Create lookup map for report status
  const reportStatusMap = React.useMemo(() => {
    if (!bulkReportStatus) return {};
    return bulkReportStatus;
  }, [bulkReportStatus]);

  const { wishlist, likedItems, removeFromWishlist, toggleWishlist, isLoading: wishlistApiLoading } = useWishlist();

  // Hooks for unlisting and relisting
  const { mutate: relistArtwork, isPending: isRelisting } = useRelistArtwork();
  const markAsUnlistedMutation = useMarkArtworkAsUnlisted();
  const handleCategorySelect = (category: string) => setSelectedCategoryFilter(category);
  const handleArtCategoryChange = (category: string) => setSelectedArtCategory(category);
  const handleSortChange = (option: string) => setSelectedSort(option);

  const filteredArtCards = React.useMemo(() => {
    let filtered =
      selectedCategoryFilter === "Following"
        ? (followedArtworksData?.artworks ?? []).filter((art: any) => {
            // Only show artworks that are onSale and Public
            const status = (art.art_status || "").toLowerCase();
            const visibility = (art.visibility || "").toLowerCase();

            // Explicitly exclude sold artworks
            if (status === "sold") return false;

            // Only include onSale artworks (handle both "onSale" and "onsale" cases)
            if (status !== "onsale" && status !== "active") return false;

            // Only include Public artworks
            if (visibility !== "public") return false;

            // Additional filters
            if (
              selectedArtCategory !== "All" &&
              art.category?.trim().toLowerCase() !== selectedArtCategory.trim().toLowerCase()
            )
              return false;
            if (selectedEdition !== "All" && art.edition !== selectedEdition) return false;
            return true;
          })
        : selectedCategoryFilter === "Trending"
        ? (trendingArtworks ?? []).filter((artwork: any) => {
            // Only show artworks that are onSale and Public
            const status = (artwork.art_status || "").toLowerCase();
            const visibility = (artwork.visibility || "").toLowerCase();

            // Explicitly exclude sold artworks
            if (status === "sold") return false;

            // Only include onSale artworks (handle both "onSale" and "onsale" cases)
            if (status !== "onsale" && status !== "active") return false;

            // Only include Public artworks
            if (visibility !== "public") return false;

            // Additional filters
            if (
              selectedArtCategory !== "All" &&
              artwork.category?.trim().toLowerCase() !== selectedArtCategory.trim().toLowerCase()
            )
              return false;
            if (selectedEdition !== "All" && artwork.edition !== selectedEdition) return false;
            return true;
          })
        : safeArtCards.filter((artwork: any) => {
            // Only show artworks that are onSale and Public
            const status = (artwork.art_status || "").toLowerCase();
            const visibility = (artwork.visibility || "").toLowerCase();

            // Explicitly exclude sold artworks
            if (status === "sold") return false;

            // Only include onSale artworks (handle both "onSale" and "onsale" cases)
            if (status !== "onsale") return false;

            // Only include Public artworks
            if (visibility !== "public") return false;

            // Additional filters
            if (
              selectedArtCategory !== "All" &&
              artwork.category?.trim().toLowerCase() !== selectedArtCategory.trim().toLowerCase()
            )
              return false;
            if (selectedEdition !== "All" && artwork.edition !== selectedEdition) return false;

            return true;
          });

    // Apply search filter
    if (searchQuery?.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter((artwork: any) => {
        const title = (artwork.title || "").toLowerCase();
        const artist = (artwork.artist || "").toLowerCase();
        return title.includes(queryLower) || artist.includes(queryLower);
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (selectedSort === "Price: Low to High") {
        return (a.discounted_price ?? a.price) - (b.discounted_price ?? b.price);
      } else if (selectedSort === "Price: High to Low") {
        return (b.discounted_price ?? b.price) - (a.discounted_price ?? a.price);
      } else if (selectedSort === "Most Popular") {
        return (b.total_ratings ?? 0) - (a.total_ratings ?? 0);
      } else {
        return 0;
      }
    });
  }, [
    selectedCategoryFilter,
    followedArtworksData,
    trendingArtworks,
    safeArtCards,
    selectedArtCategory,
    selectedEdition,
    searchQuery,
    selectedSort,
  ]);

  const handleCardClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    navigate(`/viewproduct/${artwork.id}/`, { state: { artistId: artwork.artistId } });
  };

  const handleSellClick = () => navigate("/sell");

  const handleLike = async (id: string) => {
    await toggleWishlist(id);
    // Invalidate wishlist queries to update UI immediately
    queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    queryClient.invalidateQueries({ queryKey: ["wishlist-art-cards"] });
  };

  const handleRemoveFromWishlistModal = (id: string) => {
    removeFromWishlist(id);
    // Invalidate wishlist queries to update UI immediately
    queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    queryClient.invalidateQueries({ queryKey: ["wishlist-art-cards"] });
    toast(removedFromWishlistText, {
      closeButton: true,
    });
  };

  const handleWishlistClick = () => setShowWishlist(true);


  // Handler functions for unlisting and relisting
  const handleRelist = (id: string) => {
    // Optimistic update: immediately add the artwork back to the UI
    // We need to get the artwork data from the user's own artworks first
    queryClient.setQueryData(["my-sell-art-cards"], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((artwork: any) => {
        if (artwork.id === id) {
          return { ...artwork, art_status: "onsale", visibility: "Public" };
        }
        return artwork;
      });
    });

    relistArtwork(id, {
      onSuccess: () => {
        // Show success message
        toast.success("Artwork relisted successfully!", {
          closeButton: true,
        });

        // Refetch all relevant queries to ensure data is up to date
        queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });
        queryClient.refetchQueries({ queryKey: ["trending-artworks"] });
        queryClient.refetchQueries({ queryKey: ["followedArtworks"] });
        queryClient.refetchQueries({ queryKey: ["my-sell-art-cards"] });
        queryClient.refetchQueries({ queryKey: ["user-sell-art-cards"] });
      },
      onError: (error) => {
        console.error("Failed to relist artwork:", error);
        const errorMessage = error?.response?.data?.detail || "Failed to relist artwork. Please try again.";
        toast.error(errorMessage);
        // If the mutation fails, refetch to restore the correct data
        queryClient.refetchQueries({ queryKey: ["my-sell-art-cards"] });
      },
    });
  };

  const handleUnlist = (id: string) => {
    // Optimistic update: immediately remove the artwork from the UI
    queryClient.setQueryData(["marketplace-art-cards"], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.filter((artwork: any) => artwork.id !== id);
    });

    // Also update trending artworks if it exists there
    queryClient.setQueryData(["trending-artworks"], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.filter((artwork: any) => artwork.id !== id);
    });

    // Also update followed artworks if it exists there
    queryClient.setQueryData(["followedArtworks"], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        artworks: oldData.artworks?.filter((artwork: any) => artwork.id !== id) || []
      };
    });

    markAsUnlistedMutation.mutate(id, {
      onSuccess: () => {
        // Refetch all relevant queries to ensure data is up to date
        queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });
        queryClient.refetchQueries({ queryKey: ["trending-artworks"] });
        queryClient.refetchQueries({ queryKey: ["followedArtworks"] });
        queryClient.refetchQueries({ queryKey: ["my-sell-art-cards"] });
        queryClient.refetchQueries({ queryKey: ["user-sell-art-cards"] });
      },
      onError: () => {
        // If the mutation fails, refetch to restore the correct data
        queryClient.refetchQueries({ queryKey: ["marketplace-art-cards"] });
        queryClient.refetchQueries({ queryKey: ["trending-artworks"] });
        queryClient.refetchQueries({ queryKey: ["followedArtworks"] });
      },
    });
  };
  // Refetch followed artworks when switching to Following tab
  useEffect(() => {
    if (selectedCategoryFilter === "Following") {
      refetchFollowed();
    }
  }, [selectedCategoryFilter, refetchFollowed]);

  // Real-time updates: Listen for new artwork uploads
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'new-artwork-uploaded') {
        // Refetch marketplace data when new artwork is uploaded
        refetch();
        // Clear the storage event
        localStorage.removeItem('new-artwork-uploaded');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refetch]);

  // Also listen for custom events (for same-tab updates)
  useEffect(() => {
    const handleNewArtwork = () => {
      refetch();
    };

    window.addEventListener('new-artwork-uploaded', handleNewArtwork);
    return () => window.removeEventListener('new-artwork-uploaded', handleNewArtwork);
  }, [refetch]);

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-900">
      <div className="flex flex-col flex-1 bg-background dark:bg-gray-900">
        <Header />
        <div className="flex-1 container mx-auto px-4 sm:px-6 pt-20">
          <ActiveAccountOnly>
            <TopSellers />

            {/* Marketplace Filters */}
            <div className="mb-6">
              {/* Title + Wishlist + Mobile Sell */}
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-md font-bold text-gray-900 dark:text-white">{marketplaceText}</h1>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWishlistClick}
                    className="text-[10px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
                  >
                    {wishlistText}
                  </button>
                  <div
                    onClick={handleWishlistClick}
                    className="relative w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer"
                  >
                    <img
                      src="https://img.icons8.com/puffy-filled/32/BF0101/like.png"
                      alt="Wishlist Icon"
                      className="w-3.5 h-3.5"
                    />
                    {likedItems.size > 0 && (
                      <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                        {likedItems.size}
                      </span>
                    )}
                  </div>

                  {/* Mobile Sell button */}
                  <button
                    className="sm:hidden py-1 px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                    onClick={handleSellClick}
                  >
                    <i className="bx bx-plus text-xs"></i> {sellText}
                  </button>
                </div>
              </div>

              {/* SUBHEADER */}
              <div className="w-full flex items-center justify-between gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {/* Left side */}
                <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} />

                {/* Right side */}
                <div className="flex items-center gap-3 ml-auto">
                  <ArtCategorySelect selectedCategory={selectedArtCategory} onChange={handleArtCategoryChange} />

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex py-1 px-2.5 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 gap-2">
                        <i className="bx bx-sort text-xs dark:text-gray-300"></i>
                        <span className="text-[10px] dark:text-gray-100">
                          {sortOptions.find((opt) => opt.value === selectedSort)?.label || selectedSort}
                        </span>
                        <ChevronDown className="w-3 h-3 relative top-0.5 dark:text-gray-300" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white dark:bg-gray-800 dark:border-gray-600 z-0">
                      {sortOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          className="text-[10px] dark:text-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleSortChange(option.value)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="dark:bg-gray-600" />
                      {editionOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          className="text-[10px] dark:text-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setSelectedEdition(option.value)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    className="hidden sm:flex py-1 px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full items-center gap-1"
                    onClick={handleSellClick}
                  >
                    <i className="bx bx-plus text-xs"></i> {sellText}
                  </button>
                </div>
              </div>
            </div>

            {/* Marketplace Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
              {isLoading || (selectedCategoryFilter === "Following" && isFollowedLoading) ? (
                <>
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <SellCardSkeleton key={idx} />
                  ))}
                </>
              ) : (
                <>
                  {selectedCategoryFilter === "Following" && filteredArtCards.length === 0 && !isFollowedLoading && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-xs text-gray-500 mb-2">
                        {followedError
                          ? errorLoadingFollowedText
                          : followedArtworksData?.artworks?.length === 0
                          ? noArtworksFromFollowingsText
                          : noArtworksMatchFiltersText}
                      </p>
                      {followedError && (
                        <button
                          onClick={() => refetchFollowed()}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          {retryText}
                        </button>
                      )}
                    </div>
                  )}
                  {selectedCategoryFilter !== "Following" && filteredArtCards.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-xs text-gray-500 mb-2">
                        {error ? errorLoadingArtworksText : noArtworksFoundText}
                      </p>
                      {error && (
                        <button
                          onClick={() => refetch()}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          {retryText}
                        </button>
                      )}
                    </div>
                  )}
                  {filteredArtCards.map((artwork) => {
                    const isOwner = artwork.artistId === loggedInUserId;

                    return (
                      <SellCard
                        key={artwork.id}
                        id={artwork.id}
                        category={artwork.category}
                        artist={artwork.artist}
                        artistId={artwork.artist_id}
                        edition={artwork.edition}
                        description={artwork.description}
                        size={artwork.size}
                        default_paypal_email={artwork.default_paypal_email}
                        additionalImages={artwork.image_url?.slice(1) || []}
                        profile_picture={artwork.profile_picture}
                        yearCreated={artwork.year_created}
                        medium={artwork.medium}
                        artworkImage={artwork.image_url?.[0] || "/images/placeholder.jpg"}
                        price={artwork.discounted_price ?? artwork.price}
                        originalPrice={artwork.discounted_price ? artwork.price : undefined}
                        title={artwork.title}
                        rating={artwork.average_rating}
                        isLiked={likedItems.has(artwork.id)}
                        onLike={() => handleLike(artwork.id)}
                        isMarketplace={true}
                        isProfileView={false}
                        status={artwork.art_status || "active"}
                        quantity={artwork.quantity}
                        isWishlistView={true}
                        onCardClick={() => handleCardClick(artwork)}
                        isReported={reportStatusMap[artwork.id]?.reported || false}
                        isOwner={isOwner}
                        onRelist={isOwner ? () => handleRelist(artwork.id) : undefined}
                        onUnlist={isOwner ? () => handleUnlist(artwork.id) : undefined}
                        onPaymentSetupClick={() => setIsPaymentSetupPopupOpen(true)}
                      />
                    );
                  })}
                </>
              )}
            </div>
          </ActiveAccountOnly>
        </div>
      </div>

      <Footer />

      {wishlistApiLoading ? (
        <SellCardSkeleton />
      ) : (
        <WishlistModal
          isOpen={showWishlist}
          onClose={() => setShowWishlist(false)}
          wishlistItems={wishlist}
          onRemoveFromWishlist={handleRemoveFromWishlistModal}
          removeLocalItem={() => {}}
        />
      )}

      <PaymentSetupPopup
        isOpen={isPaymentSetupPopupOpen}
        onClose={() => setIsPaymentSetupPopupOpen(false)}
      />
    </div>
  );
};

export default Marketplace;
