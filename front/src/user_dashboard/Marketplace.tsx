import { useState, useEffect } from "react";
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
import SellCardSkeleton from "@/components/skeletons/SellCardSkeleton";

import useWishlistArtCards from "@/hooks/artworks/wishlist/useWishlistArtCards";
import { ChevronDown, Grid3X3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { mockArtworks } from "@/components/user_dashboard/Marketplace/mock_data/mockArtworks";
import useFetchArtCards from "@/hooks/artworks/sell/useFetchArtCards";

const Marketplace = () => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedArtCategory, setSelectedArtCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Latest");
  const [selectedEdition, setSelectedEdition] = useState("All");

  const categories = ["All", "Trending", "Following"];
  const navigate = useNavigate();

  const sortOptions = ["Latest", "Price: Low to High", "Price: High to Low", "Most Popular"];
  const editionOptions = ["Original (1 of 1)", "Limited Edition", "Open Edition"];

  const [showWishlist, setShowWishlist] = useState(false);
  const { data: artCards = [], isLoading, error, refetch } = useFetchArtCards();

  const { wishlist, likedItems, removeFromWishlist, toggleWishlist, isLoading: wishlistApiLoading } = useWishlist();

  const handleCategorySelect = (category) => setSelectedCategoryFilter(category);
  const handleArtCategoryChange = (category) => setSelectedArtCategory(category);
  const handleSortChange = (option) => setSelectedSort(option);

  const filteredArtCards = artCards
    .filter((artwork) => {
      if (selectedCategoryFilter === "Trending" && !(artwork.total_ratings >= 4)) return false;
      if (selectedCategoryFilter === "Following") return false;
      if (selectedArtCategory !== "All" && artwork.category !== selectedArtCategory) return false;
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

  const handleCardClick = (id: string) => {
    if (!id) return;
    navigate(`/viewproduct/${id}/`);
  };

  const handleSellClick = () => navigate("/sell");

  const handleLike = async (id: string) => {
    const wasLiked = likedItems.has(id);
    await toggleWishlist(id);
  };

  const handleRemoveFromWishlistModal = (id: string) => {
    removeFromWishlist(id);
    toast("Removed from wishlist");
  };

  const handleWishlistClick = () => setShowWishlist(true);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col flex-1 bg-background">
        <Header />
        <div className="flex-1 container mx-auto px-4 sm:px-6 pt-20">
          <TopSellers />

          {/* Marketplace Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
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
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} />
              <div className="flex gap-3">
                <div className="relative">
                  <ArtCategorySelect selectedCategory={selectedArtCategory} onChange={handleArtCategoryChange} />
                </div>

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex py-1 px-2.5 rounded-full border border-gray-300 gap-2">
                      <Grid3X3 className="w-3 h-3 relative top-0.5" />
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
                      <DropdownMenuItem key={option} className="text-[10px]" onClick={() => setSelectedEdition(option)}>
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  className="py-1 px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                  onClick={handleSellClick}
                >
                  <i className="bx bx-plus text-xs"></i> Sell
                </button>
              </div>
            </div>
          </div>

          {/* Marketplace Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <SellCardSkeleton key={idx} />
                ))}
              </>
            ) : (
              <>
                {selectedCategoryFilter === "Following" && filteredArtCards.length === 0 && (
                  <p className="col-span-full text-xs text-gray-500 text-center">
                    No artworks from your followings yet.
                  </p>
                )}
                {selectedCategoryFilter !== "Following" && filteredArtCards.length === 0 && (
                  <p className="col-span-full text-xs text-gray-500 text-center">No artworks found for this filter.</p>
                )}
                {filteredArtCards.map((artwork) => (
                  <SellCard
                    key={artwork.id}
                    id={artwork.id}
                    artworkImage={artwork.image_url?.[0] || "/images/placeholder.jpg"}
                    price={artwork.discounted_price ?? artwork.price}
                    originalPrice={artwork.discounted_price ? artwork.price : undefined}
                    title={artwork.title}
                    rating={artwork.total_ratings}
                    isLiked={likedItems.has(artwork.id)}
                    onLike={() => handleLike(artwork.id)}
                    edition={""}
                    isMarketplace={true}
                    onCardClick={() => handleCardClick(artwork.id)}
                  />
                ))}
              </>
            )}
          </div>
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
