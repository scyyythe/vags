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
import {
  useArtCategories,
  ART_CATEGORIES,
} from "@/components/user_dashboard/local_components/categories/ArtCategories";
import useRealTimeArtworks from "@/hooks/artworks/useRealTimeArtworks";

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
  const [selectedFilterCategory, setSelectedFilterCategory] = useState(translatedAll);
  const [selectedCategory, setSelectedCategory] = useState(translatedAll);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All");

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [currentPage] = useState(1);
  const { data: artworks, isLoading, error } = useArtworks(currentPage, undefined, true, "all", "public");

  // Enhanced error handling
  const getErrorMessage = (error: any) => {
    if (error?.response?.status === 500) {
      return "Server error. Please try again later.";
    } else if (error?.response?.status === 404) {
      return "Artworks not found.";
    } else if (error?.code === "ECONNABORTED") {
      return "Request timeout. Please check your connection.";
    } else if (error?.message?.includes("Network Error")) {
      return "Network error. Please check your internet connection.";
    } else if (error?.response?.status === 401) {
      return "Authentication required. Please log in again.";
    }
    return "Error loading artworks. Please try again.";
  };
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

  // Report status is now managed centrally, no need for manual invalidation
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

  // Real-time artworks hook for live updates
  const { hasNewArtworks, refreshArtworks } = useRealTimeArtworks();

  const translatedCategories = useArtCategories();

  const filteredArtworksMemo = useMemo(() => {
    if (!artworks) return [];

    const filterCategory = selectedFilterCategory.toLowerCase();
    const category = selectedCategory.toLowerCase();

    // Choose base list: followed artworks when in "Following", otherwise the main artworks list
    let filtered: any[] = [];
    if (filterCategory === translatedFollowing.toLowerCase()) {
      filtered = Array.isArray(followedArtworksData) ? followedArtworksData : followedArtworksData?.artworks ?? [];
    } else {
      filtered = artworks;
    }

    // Apply category/style filter only if selectedCategory is not "All"
    if (selectedCategory.toLowerCase() !== translatedAll.toLowerCase()) {
      // match either canonical ART_CATEGORIES or the translated ones
      // find index of a matching translated category or direct match in ART_CATEGORIES
      let matchedOriginal: string | undefined;

      // try direct match to ART_CATEGORIES (in case selectedCategory is already original)
      const direct = ART_CATEGORIES.find((c) => c.toLowerCase() === category);
      if (direct) {
        matchedOriginal = direct;
      } else {
        // try matching against translatedCategories to map back to ART_CATEGORIES
        const idx = translatedCategories.findIndex((tc) => tc.toLowerCase() === category);
        if (idx !== -1 && ART_CATEGORIES[idx]) {
          matchedOriginal = ART_CATEGORIES[idx];
        }
      }

      if (matchedOriginal) {
        filtered = filtered.filter((artwork) => {
          const artworkCategory = (artwork.category || artwork.style || artwork.artCategory || "")
            .toString()
            .toLowerCase();
          return artworkCategory === matchedOriginal!.toLowerCase();
        });
      } else {
        // fallback: if no mapping found, try matching selectedCategory directly to artwork fields
        filtered = filtered.filter((artwork) => {
          const artworkCategory = (artwork.category || artwork.style || artwork.artCategory || artwork.title || "")
            .toString()
            .toLowerCase();
          return artworkCategory.includes(category);
        });
      }
    }

    // Apply search filtering
    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (artwork) =>
          (artwork.title || "").toLowerCase().includes(q) ||
          (artwork.artistName || artwork.artist || "").toLowerCase().includes(q)
      );
    }

    // If the main filter is Trending, sort by likes
    if (filterCategory === translatedTrending.toLowerCase()) {
      filtered = [...filtered].sort(
        (a, b) => (b.likesCount || b.likes_count || 0) - (a.likesCount || a.likes_count || 0)
      );
    }

    return filtered;
  }, [
    artworks,
    searchQuery,
    selectedFilterCategory,
    selectedCategory,
    followedArtworksData,
    language,
    translatedCategories,
    translatedAll,
    translatedTrending,
    translatedFollowing,
    translatedCategories,
  ]);

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

  // Reset to "All" when the user first enters Explore
  useEffect(() => {
    setSelectedFilterCategory(translatedAll);
    setSelectedCategory(translatedAll);
  }, [translatedAll]);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
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
                <div className="flex items-center gap-3">
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedFilterCategory}
                    onSelectCategory={(category) => {
                      setSelectedFilterCategory(category);
                      setSelectedCategory(translatedAll);
                    }}
                  />
                </div>

                <div className="flex space-x-2 text-xs">
                  <div className="relative">
                    <ArtCategorySelect
                      selectedCategory={selectedCategory}
                      onChange={(value) => {
                        if (value === translatedAll) {
                          setSelectedCategory(translatedAll);
                        } else {
                          setSelectedCategory(value);
                        }
                      }}
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
                    <div className="col-span-full text-center text-sm text-gray-500">
                      <div className="mb-2">
                        <i className="bx bx-error-circle text-2xl text-red-500"></i>
                      </div>
                      <p className="font-medium">{getErrorMessage(error)}</p>
                    </div>
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
