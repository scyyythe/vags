import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";

type Props = {
  trendingArtworks: any[];
  followingArtworks: any[];
  isTrendingLoading?: boolean;
  isFollowingLoading?: boolean;
  onTip?: () => void;
};

const TrendingFollowingSection = ({
  trendingArtworks,
  followingArtworks,
  isTrendingLoading = false,
  isFollowingLoading = false,
  onTip,
}: Props) => {
  return (
    <div className="flex flex-col gap-12">
      {/* Trending Section */}
      <section className="mb-4 w-full">
        <h2 className="text-lg font-semibold mb-4 pl-1">Trending</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {isTrendingLoading ? (
            Array.from({ length: 10 }).map((_, index) => <ArtCardSkeleton key={index} />)
          ) : trendingArtworks.length === 0 ? (
            <div className="text-sm text-gray-500 col-span-full">No trending artworks found.</div>
          ) : (
            trendingArtworks.map((card) => (
              <ArtCard
                key={card.id}
                id={card.id}
                artistName={card.artistName}
                artistId={card.artist_id}
                artistImage={card.artistImage}
                artworkImage={card.artworkImage}
                title={card.title}
                onButtonClick={onTip}
                isExplore={true}
                likesCount={card.likesCount}
              />
            ))
          )}
        </div>
      </section>

      {/* Following Section */}
      <section className="mb-4 w-full">
        <h2 className="text-lg font-semibold mb-4 pl-1">Following</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {isFollowingLoading ? (
            Array.from({ length: 10 }).map((_, index) => <ArtCardSkeleton key={index} />)
          ) : followingArtworks.length === 0 ? (
            <div className="text-sm text-gray-500 col-span-full">No artworks from followed users.</div>
          ) : (
            followingArtworks.map((card) => (
              <ArtCard
                key={card.id}
                id={card.id}
                artistName={card.artistName}
                artistId={card.artist_id}
                artistImage={card.artistImage}
                artworkImage={card.artworkImage}
                title={card.title}
                onButtonClick={onTip}
                isExplore={true}
                likesCount={card.likesCount}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default TrendingFollowingSection;
