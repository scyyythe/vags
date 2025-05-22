import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import useFollowedArtworks from "@/hooks/artworks/follow_artworks/useFollowedArtworks";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

type Props = {
  onTip?: () => void;
};

const FollowingSection = ({ onTip }: Props) => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [currentPage] = useState(1);

  const { data: followedArtworks, isLoading, error } = useFollowedArtworks(currentPage);

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
            followedArtworks.map((artwork: any) => (
              <ArtCard
                key={artwork.id}
                id={artwork.id}
                artistName={artwork.artist}
                artistId={artwork.artist_id}
                artistImage={artwork.profile_picture}
                artworkImage={artwork.image_url}
                title={artwork.title}
                onButtonClick={onTip}
                isExplore={true}
                likesCount={artwork.likes_count}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default FollowingSection;
