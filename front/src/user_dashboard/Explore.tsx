import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import ArtGalleryContainer from "@/components/user_dashboard/Explore/gallery/ArtVideoOutro";
import CategoryFilter from "@/components/user_dashboard/Explore/navigation/CategoryFilter";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import { toast } from "sonner";
import ArtVideoShowcase from "@/components/user_dashboard/Explore/gallery/ArtworkShowcase";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import useFetchPopularArtworks from "@/hooks/artworks/fetch_artworks/useFetchPopularArtworks";
import ArtCardSkeleton from "@/components/skeletons/artworks/ArtCardSkeleton";
import { useSearchParams } from "react-router-dom";
import TrendingFollowingSection from "@/components/user_dashboard/Explore/navigation/trend_following/TrendingSection";
import FollowingSection from "@/components/user_dashboard/Explore/navigation/trend_following/FollowingSection";
import useBulkArtworkStatus from "@/hooks/interactions/useArtworkStatus";
import useBulkReportStatus from "@/hooks/mutate/report/useReportStatus";
import useFollowedArtworks from "@/hooks/artworks/follow_artworks/useFollowedArtworks";
import { getLoggedInUserId } from "@/auth/decode";
import { useDonation } from "@/context/DonationContext";
import { useStripeTip } from "@/hooks/tips/useStripeTip";
import ActiveAccountOnly from "@/components/auth/ActiveAccountOnly";
import { useQueryClient } from "@tanstack/react-query";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";
import { autoTranslate } from "@/utils/autoTranslate";

const Explore = () => {
  const navigate = useNavigate();
  const { openPopup } = useDonation();
  const { verifyStripePayment } = useStripeTip();
  const [status, setStatus] = useState<string>("");
  const { language } = useLanguage();
  const translatedAll = useAutoTranslation("All", language);
  const translatedTrending = useAutoTranslation("Trending", language);
  const translatedFollowing = useAutoTranslation("Following", language);
  const translatedCreate = useAutoTranslation("Create", language);
  const translatedErrorLoading = useAutoTranslation("Error loading artworks", language);
  const translatedNoArtworks = useAutoTranslation("No artworks found.", language);
  const categories = [translatedAll, translatedTrending, translatedFollowing];
  const [selectedCategory, setSelectedCategory] = useState(translatedAll);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All");

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [currentPage] = useState(1);
  const { data: artworks, isLoading, error } = useArtworks(currentPage, undefined, true, "all", "public");
  const { data: popularArtworksRaw } = useFetchPopularArtworks();
  const queryClient = useQueryClient();

  const popularArtworks = popularArtworksRaw?.slice(0, 5) ?? [];

  const artworkIds = artworks?.map((a) => a.id) || [];
  const { data: bulkStatus } = useBulkArtworkStatus(artworkIds);
  const { data: reportStatus } = useBulkReportStatus(artworkIds);
  const loggedInUserId = getLoggedInUserId();
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  useEffect(() => {
    async function runVerify() {
      const result = await verifyStripePayment();
      if (result) {
        setStatus("Tip successful");
      }
    }
    runVerify();
  }, []);

  // Refetch report status when component mounts or artworkIds change
  useEffect(() => {
    if (artworkIds.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["bulkReportStatus", artworkIds] });
    }
  }, [artworkIds, queryClient]);
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

    if (category === translatedFollowing.toLowerCase()) {
      return Array.isArray(followedArtworksData) ? followedArtworksData : followedArtworksData?.artworks ?? [];
    }

    let filtered = artworks;

    if (category !== translatedAll.toLowerCase() && category !== translatedFollowing.toLowerCase() && category !== translatedTrending.toLowerCase()) {
      filtered = filtered.filter((artwork) => artwork.style.toLowerCase() === category);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (artwork) =>
          artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          artwork.artistName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (category === translatedTrending.toLowerCase()) {
      filtered = [...filtered].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }

    return filtered;
  }, [artworks, searchQuery, selectedCategory, followedArtworksData, language]);

  const handleTipJar = (artwork: (typeof filteredArtworksMemo)[0]) => {
    console.log("Opening tip jar for artwork:", artwork);

    const artworkInfo = {
      id: artwork.id,
      title: artwork.title,
      artistName: artwork.artistName || artwork.artist,
      artworkImage: Array.isArray(artwork.artworkImage) ? artwork.artworkImage[0] : artwork.artworkImage || "",
      artistId: artwork.artistId,
      default_paypal_email: artwork.default_paypal_email || artwork.default_paypal_email || "", // fallback
    };

    openPopup(artworkInfo);
    toast(`Opening tip jar for ${artwork.title}`, {
      closeButton: true,
    });
  };

  const handleCreateClick = () => {
    navigate("/create");
  };

  const handleSortClick = () => {
    toast("Sort artworks", {
      closeButton: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-20">
        <ActiveAccountOnly>
          <main className="container">
            <section className="mb-8 w-[100%] sm:w-full">
              <ArtVideoShowcase artworks={popularArtworks || []} />
            </section>
          </main>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6 lg:w-[133%] pl-2 sm:pl-0">
                <CategoryFilter
                  categories={categories}
                  onSelectCategory={(category) => {
                    setSelectedCategory(category);
                    if (category === translatedTrending || category === translatedFollowing) {
                      setSelectedStyle("All");
                    }
                  }}
                />

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
                    {translatedCreate}
                  </button>
                </div>
              </div>

              <div className="lg:w-[133%] custom-scrollbars pb-4 pl-2 sm:pl-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, index) => <ArtCardSkeleton key={index} />)
                  ) : error ? (
                    <div className="col-span-full text-center text-sm text-gray-500">{translatedErrorLoading}</div>
                  ) : filteredArtworksMemo.length === 0 && selectedCategory ? (
                    <div className="col-span-full flex flex-col items-center justify-center text-center">
                      <img src="/pics/empty.png" alt="No artwork" className="w-48 h-48 mb-4 opacity-80" />
                      <p className="text-sm text-gray-500">{translatedNoArtworks}</p>
                    </div>
                  ) : (
                    filteredArtworksMemo.map((card) => {
                      const transformedArtwork = {
                        ...card,
                        artworkImage: card.artworkImage || card.image_url || "",
                        artistImage: card.artistImage || card.profile_picture || "",
                        artistName: card.artistName || card.artist || "Unknown Artist",
                        likesCount: card.likesCount || card.likes_count || 0,
                        default_paypal_email: card.default_paypal_email,
                      };

                      const status = bulkStatusLookup[String(card.id)];
                      const report = reportStatusLookup[String(card.id)];

                      return (
                        <ArtCard
                          key={card.id}
                          artwork={transformedArtwork}
                          status={status}
                          report={report}
                          onButtonClick={() => handleTipJar(transformedArtwork)}
                          isExplore={true}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </ActiveAccountOnly>
      </div>

      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Explore;
