import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import ArtGalleryContainer from "@/components/user_dashboard/Explore/gallery/ArtGalleryContainer";
import CategoryFilter from "@/components/user_dashboard/Explore/navigation/CategoryFilter";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import { toast } from "sonner";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import useFetchPopularArtworks from "@/hooks/artworks/fetch_artworks/useFetchPopularArtworks";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";
import { useSearchParams } from "react-router-dom";
import TrendingFollowingSection from "@/components/user_dashboard/Explore/navigation/trend_following/TrendingSection";
import FollowingSection from "@/components/user_dashboard/Explore/navigation/trend_following/FollowingSection";
import useBulkArtworkStatus from "@/hooks/interactions/useArtworkStatus";
import useBulkReportStatus from "@/hooks/mutate/report/useReportStatus";
import useFollowedArtworks from "@/hooks/artworks/follow_artworks/useFollowedArtworks";
const Explore = () => {
  const navigate = useNavigate();
  const categories = ["All", "Trending", "Following"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [currentPage] = useState(1);
  const { data: artworks, isLoading, error } = useArtworks(currentPage, undefined, true, "all", "public");
  const { data: popularArtworks } = useFetchPopularArtworks(5);
  const artworkIds = artworks?.map((a) => a.id) || [];
  const { data: bulkStatus } = useBulkArtworkStatus(artworkIds);
  const { data: reportStatus } = useBulkReportStatus(artworkIds);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const bulkStatusLookup = React.useMemo(() => {
    if (!bulkStatus) return {};
    return bulkStatus.reduce((acc, item) => {
      acc[String(item.artwork_id)] = item;
      return acc;
    }, {} as Record<string, (typeof bulkStatus)[0]>);
  }, [bulkStatus]);

  const reportStatusLookup = React.useMemo(() => {
    return reportStatus || {};
  }, [reportStatus]);
  const [page] = useState(1);

  const { data: followedArtworksData } = useFollowedArtworks(page);

  const filteredArtworksMemo = useMemo(() => {
    if (!artworks) return [];

    const category = selectedCategory.toLowerCase();

    if (category === "following") {
      return Array.isArray(followedArtworksData) ? followedArtworksData : followedArtworksData?.artworks ?? [];
    }

    let filtered = artworks;

    if (category !== "all" && category !== "following" && category !== "trending") {
      filtered = filtered.filter((artwork) => artwork.style.toLowerCase() === category);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (artwork) =>
          artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          artwork.artistName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (category === "trending") {
      filtered = [...filtered].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }

    return filtered;
  }, [artworks, searchQuery, selectedCategory, followedArtworksData]);

  const handleTipJar = () => {
    toast("Opening tip jar");
  };

  const handleCreateClick = () => {
    navigate("/create");
  };

  const handleSortClick = () => {
    toast("Sort artworks");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20">
        <main className="container">
          <section className="mb-8 w-[100%] sm:w-full">
            <ArtGalleryContainer artworks={popularArtworks || []} />
          </section>
        </main>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 lg:w-[133%] pl-2 sm:pl-0">
              <CategoryFilter categories={categories} onSelectCategory={handleCategorySelect} />
              <div className="flex space-x-2 text-xs">
                <div className="relative">
                  <ArtCategorySelect
                    selectedCategory={selectedCategory}
                    onChange={(value) => setSelectedCategory(value)}
                  />
                </div>

                <button
                  className="py-1 px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                  onClick={handleCreateClick}
                >
                  <i className="bx bx-plus text-xs"></i>
                  Create
                </button>
              </div>
            </div>

            <div className="lg:w-[133%] custom-scrollbars pb-4 pl-2 sm:pl-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => <ArtCardSkeleton key={index} />)
                ) : error ? (
                  <div className="col-span-full text-center text-sm text-gray-500">Error loading artworks</div>
                ) : filteredArtworksMemo.length === 0 && selectedCategory ? (
                  <div className="col-span-full flex flex-col items-center justify-center text-center">
                    <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
                    <p className="text-sm text-gray-500">No artworks found.</p>
                  </div>
                ) : (
                  filteredArtworksMemo.map((card) => {
                    const transformedArtwork = {
                      ...card,
                      artworkImage: card.artworkImage || card.image_url || "",
                      artistImage: card.artistImage || card.profile_picture || "",
                      artistName: card.artistName || card.artist || "Unknown Artist",
                      likesCount: card.likesCount || 0,
                    };

                    const status = bulkStatusLookup[String(card.id)];
                    const report = reportStatusLookup[String(card.id)];

                    return (
                      <ArtCard
                        key={card.id}
                        artwork={transformedArtwork}
                        status={status}
                        report={report}
                        onButtonClick={handleTipJar}
                        isExplore={true}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Explore;
