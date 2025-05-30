import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import CategoryFilter from "@/components/user_dashboard/Marketplace/category_filter/CategoryFilter";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import TopSellers from "@/components/user_dashboard/Marketplace/top_seller/TopSellers";
import { toast } from "sonner";

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = ["All", "Trending", "Following"];
  const navigate = useNavigate();

  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showWishlist, setShowWishlist] = useState(false);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleSellClick = () => {
    navigate("/sell");
  };

  const handleLike = (id: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(id)) {
        newLiked.delete(id);
        toast("Removed from wishlist");
      } else {
        newLiked.add(id);
        toast("Added to wishlist");
      }
      return newLiked;
    });
  };

  const handleRemoveFromWishlist = (id: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      newLiked.delete(id);
      return newLiked;
    });
    toast("Removed from wishlist");
  };

  const handleWishlistClick = () => {
    setShowWishlist(true);
    console.log("Wishlist opened");
  };

  return (
    <>
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 pt-20 pb-12">
          {/* Top Sellers Section */}
          <TopSellers />
          
          {/* Marketplace Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-md font-bold text-gray-900">Marketplace</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleWishlistClick}
                  className="text-[11px] text-gray-600 hover:text-gray-900 relative"
                >
                  Wishlist
                </button>
                <div className="relative w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                  <img
                    src="https://img.icons8.com/puffy-filled/32/BF0101/like.png"
                    alt="Wishlist Icon"
                    className="w-3.5 h-3.5"
                  />
                  {likedItems.size > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {likedItems.size}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} />

              <div className="flex gap-3">
                <div className="relative">
                  <ArtCategorySelect
                    selectedCategory={selectedCategory}
                    onChange={(value) => setSelectedCategory(value)}
                  />
                </div>

                <button
                  className="py-1 px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                  onClick={handleSellClick}
                >
                  <i className="bx bx-plus text-xs"></i>
                    Sell
                </button>
              </div>
            </div>

          </div>
          
          {/* Marketplace Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* {artCards.map((card) => (
              <SellCard
                key={card.id}
                id={card.id}
                image={card.image}
                price={card.price}
                originalPrice={card.originalPrice}
                title={card.title}
                isLiked={likedItems.has(card.id)}
                onLike={() => handleLike(card.id)}
                onBuy={() => handleBuy(card.id)}
              />
            ))} */}
          </div>
        </div>
      </div>
      
      <div >
        <Footer />
      </div>

      {/* Wishlist Modal */}
      {/* <WishlistModal
        isOpen={showWishlist}
        onClose={() => setShowWishlist(false)}
        wishlistItems={wishlistItems}
        onRemoveFromWishlist={handleRemoveFromWishlist}
      /> */}

    </>
  );
};

export default Marketplace;