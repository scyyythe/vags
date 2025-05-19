import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useTrendingArtworks from "@/hooks/artworks/fetch_artworks/useTrendingArtwork";
type Props = {
  onTip?: () => void;
};

const TrendingFollowingSection = ({ onTip }: Props) => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [currentPage] = useState(1);
  const {
    data: trendingArtworks,
    isLoading: isTrendingLoading,
    error: trendingError,
  } = useTrendingArtworks(currentPage);

  if (trendingError) {
    return <p>Error loading trending artworks.</p>;
  }
  return (
    <div className="flex flex-col gap-12">
      {/* Trending Section */}
      <section className="mb-4 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {isTrendingLoading ? (
            Array.from({ length: 10 }).map((_, index) => <ArtCardSkeleton key={index} />)
          ) : !trendingArtworks || trendingArtworks.length === 0 ? (
            <div className="text-sm text-gray-500 col-span-full">No trending artworks found.</div>
          ) : (
            trendingArtworks.map((artwork) => (
              <ArtCard
                key={artwork.id}
                id={artwork.id}
                artistName={artwork.artistName}
                artistId={artwork.artist_id}
                artistImage={artwork.artistImage}
                artworkImage={artwork.artworkImage}
                title={artwork.title}
                onButtonClick={onTip}
                isExplore={true}
                likesCount={artwork.likesCount}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default TrendingFollowingSection;
