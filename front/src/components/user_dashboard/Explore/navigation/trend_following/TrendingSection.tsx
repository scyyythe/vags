import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useTrendingArtworks from "@/hooks/artworks/trending_artworks/useTrendingArtwork";
import useBulkArtworkStatus from "@/hooks/interactions/useArtworkStatus";
import useBulkReportStatus from "@/hooks/mutate/report/useReportStatus";
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
  const artworkIds = useMemo(() => {
    if (!trendingArtworks) return [];
    return trendingArtworks.map((art) => art.id);
  }, [trendingArtworks]);

  const { data: bulkStatus } = useBulkArtworkStatus(artworkIds);
  const { data: reportStatus } = useBulkReportStatus(artworkIds);

  const bulkStatusLookup = React.useMemo(() => {
    if (!bulkStatus) return {};
    return bulkStatus.reduce((acc, item) => {
      acc[String(item.artwork_id)] = item;
      return acc;
    }, {} as Record<string, (typeof bulkStatus)[0]>);
  }, [bulkStatus]);

  const reportStatusLookup = reportStatus || {};

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
            trendingArtworks.map((artwork) => {
              const status = bulkStatusLookup[String(artwork.id)];
              const report = reportStatusLookup[String(artwork.id)];

              const transformedArtwork = {
                ...artwork,
                artworkImage: artwork.artworkImage || artwork.image_url || "",
                artistImage: artwork.artistImage || artwork.profile_picture || "",
                artistName: artwork.artist || artwork.artistName,
                likesCount: artwork.likes_count,
              };

              return (
                <ArtCard
                  key={artwork.id}
                  artwork={transformedArtwork}
                  status={status}
                  report={report}
                  onButtonClick={onTip}
                  isExplore={true}
                  isLikedFromBulk={status ? status.isLiked : false}
                  isSavedFromBulk={status ? status.isSaved : false}
                />
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default TrendingFollowingSection;
