import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import useFollowedArtworks from "@/hooks/artworks/follow_artworks/useFollowedArtworks";
import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useBulkArtworkStatus from "@/hooks/interactions/useArtworkStatus";
import useBulkReportStatus from "@/hooks/mutate/report/useReportStatus";
type Props = {
  onTip?: () => void;
};

const FollowingSection = ({ onTip }: Props) => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [currentPage] = useState(1);

  const { data: followedArtworks, isLoading, error } = useFollowedArtworks(currentPage);
  const artworkIds = useMemo(() => {
    if (!followedArtworks) return [];
    return followedArtworks.map((art) => art.id);
  }, [followedArtworks]);

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

  if (error) {
    return <p>Error loading followed artworks.</p>;
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="mb-4 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => <ArtCardSkeleton key={index} />)
          ) : !followedArtworks || followedArtworks.length === 0 ? (
            <div className="text-sm text-gray-500 col-span-full">No artworks from followed artists.</div>
          ) : (
            followedArtworks.map((art) => {
              const status = bulkStatusLookup[String(art.id)];
              const report = reportStatusLookup[String(art.id)];

              const transformedArtwork = {
                ...art,
                artworkImage: art.artworkImage || art.image_url || "",
                artistImage: art.artistImage || art.profile_picture || "",
                artistName: art.artist || art.artistName,
                likesCount: art.likes_count,
              };

              return (
                <ArtCard
                  key={art.id}
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

export default FollowingSection;
