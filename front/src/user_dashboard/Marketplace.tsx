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

const Marketplace = () => {
  const loggedInUserId = getLoggedInUserId();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedArtCategory, setSelectedArtCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [selectedEdition, setSelectedEdition] = useState("All");
  const [reportedArtworks, setReportedArtworks] = useState<Set<string>>(new Set());
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const { data: trendingArtworks = [] } = useTrendingArtworks();

  const {
    data: followedArtworksData,
    isLoading: isFollowedLoading,
    error: followedError,
    refetch: refetchFollowed,
  } = useFollowedArtworksOnSale(1, selectedCategoryFilter === "Following");

  const categories = ["All", "Trending", "Following"];
  const navigate = useNavigate();

  const sortOptions = ["Latest", "Price: Low to High", "Price: High to Low", "Most Popular"];
  const editionOptions = ["Original (1 of 1)", "Limited Edition", "Open Edition"];

  const [showWishlist, setShowWishlist] = useState(false);
  const { data: artCards, isLoading, error, refetch } = useFetchArtCards();

  // Ensure artCards is always an array
  const safeArtCards = Array.isArray(artCards) ? artCards : [];

  // Get artwork IDs for bulk report status lookup
  const artworkIds = safeArtCards.map((art) => art.id);
  const { data: bulkReportStatus } = useBulkReportStatus(artworkIds);

  // Create lookup map for report status
  const reportStatusMap = React.useMemo(() => {
    if (!bulkReportStatus) return {};
    return bulkReportStatus;
  }, [bulkReportStatus]);

  const { wishlist, likedItems, removeFromWishlist, toggleWishlist, isLoading: wishlistApiLoading } = useWishlist();

  const handleCategorySelect = (category: string) => setSelectedCategoryFilter(category);
  const handleArtCategoryChange = (category: string) => setSelectedArtCategory(category);
  const handleSortChange = (option: string) => setSelectedSort(option);

  const filteredArtCards =
    selectedCategoryFilter === "Following"
      ? (followedArtworksData?.artworks ?? []).filter((art) => {
          if (art.art_status !== "onSale") return false;
          if (
            selectedArtCategory !== "All" &&
            art.category?.trim().toLowerCase() !== selectedArtCategory.trim().toLowerCase()
          )
            return false;
          if (selectedEdition !== "All" && art.edition !== selectedEdition) return false;
          return true;
        })
      : selectedCategoryFilter === "Trending"
      ? (trendingArtworks ?? []).filter((artwork) => {
          if (
            selectedArtCategory !== "All" &&
            artwork.category?.trim().toLowerCase() !== selectedArtCategory.trim().toLowerCase()
          )
            return false;
          if (selectedEdition !== "All" && artwork.edition !== selectedEdition) return false;
          return true;
        })
      : safeArtCards
          .filter((artwork) => {
            const status = (artwork.art_status || "").toLowerCase();
            const isSold = status === "sold";
            const isOnSale = status === "onsale";
            const isOpenEdition = artwork.edition === "Open Edition";
            const shouldInclude = isOnSale || !isSold || isOpenEdition;

            if (!shouldInclude) return false;
            if (
              selectedArtCategory !== "All" &&
              artwork.category?.trim().toLowerCase() !== selectedArtCategory.trim().toLowerCase()
            )
              return false;
            if (selectedEdition !== "All" && artwork.edition !== selectedEdition) return false;
            return true;
          })
          .sort((a, b) => {
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

  const handleCardClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    navigate(`/viewproduct/${artwork.id}/`, { state: { artistId: artwork.artistId } });
  };

  const handleSellClick = () => navigate("/sell");

  const handleLike = async (id: string) => {
    await toggleWishlist(id);
  };

  const handleRemoveFromWishlistModal = (id: string) => {
    removeFromWishlist(id);
    toast("Removed from wishlist", {
      closeButton: true,
    });
  };

  const handleWishlistClick = () => setShowWishlist(true);

  // Refetch followed artworks when switching to Following tab
  useEffect(() => {
    if (selectedCategoryFilter === "Following") {
      refetchFollowed();
    }
  }, [selectedCategoryFilter, refetchFollowed]);

  // Debug logging
  useEffect(() => {
    if (selectedCategoryFilter === "Following") {
      console.log("Following tab selected");
      console.log("followedArtworksData:", followedArtworksData);
      console.log("isFollowedLoading:", isFollowedLoading);
      console.log("followedError:", followedError);
    }
  }, [selectedCategoryFilter, followedArtworksData, isFollowedLoading, followedError]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col flex-1 bg-background">
        <Header />
        <div className="flex-1 container mx-auto px-4 sm:px-6 pt-20">
          <ActiveAccountOnly>
            <TopSellers />

            {/* Marketplace Filters */}
            <div className="mb-6">
              {/* Title + Wishlist + Mobile Sell */}
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-md font-bold text-gray-900">Marketplace</h1>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWishlistClick}
                    className="text-[10px] text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Wishlist
                  </button>
                  <div
                    onClick={handleWishlistClick}
                    className="relative w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer"
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
                    <i className="bx bx-plus text-xs"></i> Sell
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
                      <button className="flex py-1 px-2.5 rounded-full border border-gray-300 gap-2">
                        <i className="bx bx-sort text-xs"></i>
                        <span className="text-[10px]">{selectedSort}</span>
                        <ChevronDown className="w-3 h-3 relative top-0.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white z-0">
                      {sortOptions.map((option) => (
                        <DropdownMenuItem key={option} className="text-[10px]" onClick={() => handleSortChange(option)}>
                          {option}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      {editionOptions.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          className="text-[10px]"
                          onClick={() => setSelectedEdition(option)}
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* ✅ Desktop Sell button */}
                  <button
                    className="hidden sm:flex py-1 px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full items-center gap-1"
                    onClick={handleSellClick}
                  >
                    <i className="bx bx-plus text-xs"></i> Sell
                  </button>
                </div>
              </div>
            </div>

            {/* Marketplace Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
              {isLoading || (selectedCategoryFilter === "Following" && isFollowedLoading) ? (
                <>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <SellCardSkeleton key={idx} />
                  ))}
                </>
              ) : (
                <>
                  {selectedCategoryFilter === "Following" && filteredArtCards.length === 0 && !isFollowedLoading && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-xs text-gray-500 mb-2">
                        {followedError
                          ? "Error loading followed artworks. Please try again."
                          : followedArtworksData?.artworks?.length === 0
                          ? "No artworks from your followings yet."
                          : "No artworks match your current filters."}
                      </p>
                      {followedError && (
                        <button
                          onClick={() => refetchFollowed()}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  )}
                  {selectedCategoryFilter !== "Following" && filteredArtCards.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-xs text-gray-500 mb-2">
                        {error ? "Error loading artworks. Please try again." : "No artworks found for this filter."}
                      </p>
                      {error && (
                        <button
                          onClick={() => refetch()}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Retry
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
                        status="active"
                        quantity={artwork.quantity}
                        isWishlistView={true}
                        onCardClick={() => handleCardClick(artwork)}
                        isReported={reportStatusMap[artwork.id]?.reported || false}
                        isOwner={isOwner}
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
    </div>
  );
};

export default Marketplace;
