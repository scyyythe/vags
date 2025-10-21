import { useState, useEffect } from "react";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import ExhibitCard from "@/components/user_dashboard/Exhibit/card/ExhibitCard";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExhibitCards } from "@/hooks/exhibit/useCardExihibit";
import ExhibitCardSkeleton from "@/components/skeletons/exhibits/ExhibitCardSkeleton";
import ActiveAccountOnly from "@/components/auth/ActiveAccountOnly";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useSearchParams } from "react-router-dom";

type SortOption = "popularity" | "newest" | "oldest";
type FilterOption = "none" | "trending" | "most-viewed" | "upcoming" | "ongoing" | "ended";

const Exhibits = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [baseType, setBaseType] = useState<"solo" | "collab">("solo");
  const [filter, setFilter] = useState<FilterOption>("ongoing");
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const { data: exhibits = [], isLoading } = useExhibitCards();

  // Reset category to "All" when switching between Solo and Collab tabs
  useEffect(() => {
    setSelectedCategory("All");
  }, [baseType]);

  // Translation hooks for all text content
  const exhibitsText = useAutoTranslation("Exhibits", language);
  const soloText = useAutoTranslation("Solo", language);
  const collabText = useAutoTranslation("Collab", language);
  const trendingText = useAutoTranslation("Trending", language);
  const mostViewedText = useAutoTranslation("Most Viewed", language);
  const upcomingText = useAutoTranslation("Upcoming", language);
  const ongoingText = useAutoTranslation("Ongoing", language);
  const endedText = useAutoTranslation("Ended", language);
  const filterText = useAutoTranslation("Filter", language);
  const createText = useAutoTranslation("Create", language);
  const noSoloExhibitsText = useAutoTranslation("No solo exhibits found.", language);
  const noCollabExhibitsText = useAutoTranslation("No collaborative exhibits found.", language);
  const createFirstExhibitText = useAutoTranslation("Create Your First Exhibit", language);

  const now = new Date();

  const isOngoing = (exhibit: any) =>
    exhibit.startDate && exhibit.endDate && new Date(exhibit.startDate) <= now && new Date(exhibit.endDate) >= now;

  const isUpcoming = (exhibit: any) => exhibit.startDate && new Date(exhibit.startDate) > now;

  const isEnded = (exhibit: any) => exhibit.endDate && new Date(exhibit.endDate) < now;

  const filteredExhibits = exhibits.filter((exhibit: any) => {
    const matchesType = baseType === "solo" ? exhibit.isSolo : !exhibit.isSolo;
    const matchesCategory =
      selectedCategory === "All" || exhibit.category?.toLowerCase() === selectedCategory.toLowerCase();

    if (!matchesType || !matchesCategory) return false;

    // Apply search filter
    if (searchQuery?.trim()) {
      const queryLower = searchQuery.toLowerCase();
      const title = (exhibit.title || "").toLowerCase();
      const description = (exhibit.description || "").toLowerCase();
      const category = (exhibit.category || "").toLowerCase();

      if (!title.includes(queryLower) && !description.includes(queryLower) && !category.includes(queryLower)) {
        return false;
      }
    }

    if (filter === "trending") return exhibit.likes > 100;
    if (filter === "most-viewed") return exhibit.views > 1.3;
    if (filter === "upcoming") return isUpcoming(exhibit);
    if (filter === "ongoing") return isOngoing(exhibit);
    if (filter === "ended") return isEnded(exhibit);

    return true;
  });

  const sortedExhibits = [...filteredExhibits].sort((a, b) => {
    if (sortBy === "popularity") return b.likes - a.likes;
    if (sortBy === "newest") return parseInt(b.id) - parseInt(a.id);
    return parseInt(a.id) - parseInt(b.id); // oldest
  });

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-6">
          <ActiveAccountOnly>
            <div className="mb-8 mt-20">
              <span className="font-bold">{exhibitsText}</span>

              <div className="flex flex-wrap items-center justify-between gap-4 my-4">
                {/* SOLO / COLLAB TOGGLE */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBaseType("solo")}
                    className={`py-[5px] px-4 rounded-full text-[10px] font-small transition-colors ${
                      baseType === "solo"
                        ? "border border-gray-300 font-medium shadow-md"
                        : "bg-white border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {soloText}
                  </button>
                  <button
                    onClick={() => setBaseType("collab")}
                    className={`py-[5px] px-4 rounded-full text-[10px] font-small transition-colors ${
                      baseType === "collab"
                        ? "border border-gray-300 font-medium shadow-md"
                        : "bg-white border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {collabText}
                  </button>
                </div>

                {/* FILTER DROPDOWN */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Art Category Dropdown */}
                  <ArtCategorySelect selectedCategory={selectedCategory} onChange={setSelectedCategory} />

                  {/* Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="py-1 px-4 rounded-full text-[10px] border border-gray-300">
                        <i className="bx bx-sort text-xs mr-1.5"></i>
                        {{
                          trending: trendingText,
                          "most-viewed": mostViewedText,
                          upcoming: upcomingText,
                          ongoing: ongoingText,
                          ended: endedText,
                        }[filter] || filterText}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilter("trending")} className="text-[10px]">
                        {trendingText}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("most-viewed")} className="text-[10px]">
                        {mostViewedText}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("upcoming")} className="text-[10px]">
                        {upcomingText}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("ongoing")} className="text-[10px]">
                        {ongoingText}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("ended")} className="text-[10px]">
                        {endedText}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Create Button */}
                  <button
                    className="py-[5px] px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                    onClick={() => navigate("/add-exhibit")}
                  >
                    <i className="bx bx-plus text-xs"></i>
                    {createText}
                  </button>
                </div>
              </div>
            </div>

            {/* Exhibit Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-5 lg:pb-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <ExhibitCardSkeleton key={i} />)
                : sortedExhibits.length > 0
                ? sortedExhibits.map((exhibit) => (
                    <ExhibitCard
                      key={exhibit.id}
                      exhibit={{
                        ...exhibit,
                        ownerId: exhibit.ownerId,
                        category: exhibit.category.charAt(0).toUpperCase() + exhibit.category.slice(1),
                      }}
                      onClick={() => navigate(`/view-exhibit/${exhibit.id}`)}
                    />
                  ))
                : (
                    /* Empty State */
                    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                      <div className="text-center max-w-md">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <i className="bx bx-palette text-2xl text-gray-400"></i>
                        </div>
                        
                        {/* Message */}
                        <p className="text-gray-600 text-[13px] mb-6">
                          {baseType === "solo" ? noSoloExhibitsText : noCollabExhibitsText}
                        </p>
                      </div>
                    </div>
                  )}
            </div>
          </ActiveAccountOnly>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Exhibits;
