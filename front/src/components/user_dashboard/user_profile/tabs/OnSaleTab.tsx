import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SellCard from "@/components/user_dashboard/Marketplace/cards/SellCard";
import useMySellArtCards from "@/hooks/artworks/sell/useMySellArtCards";
import SellCardSkeleton from "@/components/skeletons/SellCardSkeleton";
import { toast } from "sonner";

const SellTab = () => {
  const { myArtCards, isLoading } = useMySellArtCards();
  const navigate = useNavigate();

  const onCardClick = useCallback((id: string) => {
    if (!id) return;
    navigate(`/viewproduct/${id}/`);
  }, [navigate]);

  const onLikeToggle = useCallback(() => {
  
  }, []);

  const filteredSellArtworks = myArtCards.filter(
    (art) =>
      art.art_status?.toLowerCase() === "onsale" ||
      art.visibility?.toLowerCase() === "public"
  );

  if (!isLoading && filteredSellArtworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center col-span-full text-center p-4">
        <img
          src="/pics/empty.png"
          alt="No on-sale artwork"
          className="w-48 h-48 mb-4 opacity-80"
        />
        <p className="text-sm text-gray-500">
          You haven’t listed any artworks for sale yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
      {isLoading ? (
        Array(6)
          .fill(0)
          .map((_, idx) => <SellCardSkeleton key={idx} />)
      ) : (
        filteredSellArtworks.map((art) => (
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
        ))
      )}
    </div>
  );
};

export default SellTab;
