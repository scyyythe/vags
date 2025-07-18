import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SellCard from "@/components/user_dashboard/Marketplace/cards/SellCard";
import SellCardSkeleton from "@/components/skeletons/SellCardSkeleton";
import useMySellArtCards from "@/hooks/artworks/sell/useMySellArtCards";
import useUserSellArtCards from "@/hooks/artworks/sell/useUserSellArtCards";
import { getLoggedInUserId } from "@/auth/decode";

const SellTab = () => {
  const { id: userId } = useParams();
  const loggedInUserId = getLoggedInUserId();
  const navigate = useNavigate();
  const isOwnProfile = String(userId) === String(loggedInUserId);

  const { myArtCards, isLoading } = isOwnProfile ? useMySellArtCards() : useUserSellArtCards(userId);

  const [mainTab, setMainTab] = useState("myListings");
  const [activeSubGroup, setActiveSubGroup] = useState<"activeListings" | "soldArtworks">("activeListings");
  const [subTab, setSubTab] = useState("available");
  const [showDropdown, setShowDropdown] = useState(false);

  const onCardClick = useCallback(
    (id: string) => {
      if (!id) return;
      navigate(`/viewproduct/${id}/`);
    },
    [navigate]
  );

  const onLikeToggle = useCallback(() => {
    // Optional like logic
  }, []);

  const filteredArtworks = myArtCards.filter((art) => {
    const status = (art as any).order_status?.toLowerCase?.() || art.art_status?.toLowerCase?.() || "";

    if (mainTab === "myListings" || mainTab === "myPurchase") {
      return status === subTab.replace("_", " ");
    }

    return false;
  });

  const activeListingTabs = ["available", "draft"];
  const soldArtworksTabs = ["awaiting_payment", "payment_received", "in_progress", "completed", "cancelled", "refunded"];
  const myPurchaseTabs = ["pending_payment", "payment_processing", "paid", "failed", "cancelled", "completed", "refunded"];

  return (
    <div className="w-full">
      {/* MAIN TABS */}
      <div className="flex space-x-4 mb-4 text-[11px] font-semibold">
        <button
          className={`px-3 ${
            mainTab === "myListings" ? "text-red-800" : "text-gray-600"
          }`}
          onClick={() => {
            setMainTab("myListings");
            setActiveSubGroup("activeListings");
            setSubTab("available");
            setShowDropdown(false);
          }}
        >
          MY LISTINGS
        </button>
        <button
          className={`px-3 ${
            mainTab === "myPurchase" ? "text-red-800" : "text-gray-600"
          }`}
          onClick={() => {
            setMainTab("myPurchase");
            setSubTab("pending_payment");
            setShowDropdown(false);
          }}
        >
          MY PURCHASE
        </button>
      </div>

      {/* DROPDOWN for MY LISTINGS */}
      {mainTab === "myListings" && (
        <div className="relative mb-6 flex flex-wrap items-center gap-4 text-[11px]">
          {/* Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-full text-gray-700"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <span>{activeSubGroup === "activeListings" ? "Active Listings" : "Sold Artworks"}</span>
              <svg
                className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute z-10 bg-white border mt-2 rounded shadow text-[11px]">
                {["activeListings", "soldArtworks"].map((option) => (
                  <button
                    key={option}
                    className={`block px-4 py-2 text-left w-full ${
                      activeSubGroup === option ? "text-black font-medium" : "text-gray-600"
                    }`}
                    onClick={() => {
                      setActiveSubGroup(option as "activeListings" | "soldArtworks");
                      setSubTab(option === "activeListings" ? "available" : "awaiting_payment");
                      setShowDropdown(false);
                    }}
                  >
                    {option === "activeListings" ? "Active Listings" : "Sold Artworks"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs beside dropdown */}
          <div className="flex flex-wrap gap-4">
            {(activeSubGroup === "activeListings" ? activeListingTabs : soldArtworksTabs).map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1 border-b-2 ${
                  subTab === tab ? "border-red-800 text-red-800" : "border-transparent text-gray-600"
                }`}
                onClick={() => setSubTab(tab)}
              >
                {tab.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      )}

      {mainTab === "myPurchase" && (
        <div className="flex flex-wrap gap-5 mb-6 text-[11px] font-normal">
          {myPurchaseTabs.map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 border-b-2 ${
                subTab === tab ? "border-red-800 text-red-800" : "border-transparent text-gray-600"
              }`}
              onClick={() => setSubTab(tab)}
            >
              {tab.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {/* ARTWORKS DISPLAY */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
          {Array(6)
            .fill(0)
            .map((_, idx) => (
              <SellCardSkeleton key={idx} />
            ))}
        </div>
      ) : filteredArtworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
          <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
          <p className="text-xs text-gray-500">No artworks found for this status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
          {filteredArtworks.map((art) => (
            <SellCard
              key={art.id}
              id={art.id}
              artworkImage={art.image_url?.[0] || "/placeholder.jpg"}
              price={art.discounted_price ?? art.price}
              originalPrice={art.discounted_price ? art.price : 0}
              title={art.title}
              category={art.category}
              edition={"Original (1 of 1)"}
              rating={art.total_ratings}
              isMarketplace={true}
              onLike={onLikeToggle}
              onCardClick={() => onCardClick(art.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellTab;
