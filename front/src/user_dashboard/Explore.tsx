import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import ArtGalleryContainer from "@/components/user_dashboard/Explore/gallery/ArtGalleryContainer";
import SearchBar from "@/components/user_dashboard/local_components/SearchBar";
import CategoryFilter from "@/components/user_dashboard/Explore/navigation/CategoryFilter";
import ArtCard from "@/components/user_dashboard/Explore/cards/ArtCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import useFetchPopularArtworks from "@/hooks/artworks/fetch_artworks/useFetchPopularArtworks";
import ArtCardSkeleton from "@/components/skeletons/ArtCardSkeleton";

const Explore = () => {
  const navigate = useNavigate();
  const categories = ["All", "Trending", "Following"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage] = useState(1);
  const { data: artworks, isLoading, error } = useArtworks(currentPage, undefined, true, "all", "public");
  const { data: popularArtworks } = useFetchPopularArtworks(1);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const filteredArtworksMemo = useMemo(() => {
    return artworks?.filter((artwork) => {
      const searchMatches =
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artwork.artistName.toLowerCase().includes(searchQuery.toLowerCase());

      const categoryMatches =
        selectedCategory.toLowerCase() === "all" || artwork.style.toLowerCase() === selectedCategory.toLowerCase();

      return searchMatches && categoryMatches;
    });
  }, [artworks, searchQuery, selectedCategory]);

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
                  className="py-1.5 px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
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
                    return (
                      <ArtCard
                        key={card.id}
                        id={card.id}
                        artistName={card.artistName}
                        artistId={card.artist_id}
                        artistImage={card.artistImage}
                        artworkImage={card.artworkImage}
                        title={card.title}
                        onButtonClick={handleTipJar}
                        isExplore={true}
                        likesCount={card.likesCount}
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
