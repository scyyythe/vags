import { useState } from "react";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import ExhibitCard from "@/components/user_dashboard/Exhibit/card/ExhibitCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExhibitCards } from "@/hooks/exhibit/useCardExihibit";
import ExhibitCardSkeleton from "@/components/skeletons/ExhibitCardSkeleton";

type SortOption = "popularity" | "newest" | "oldest";
type FilterOption =
  | "none"
  | "trending"
  | "most-viewed"
  | "upcoming"
  | "ongoing"
  | "ended";

const Exhibits = () => {
  const navigate = useNavigate();
  const [baseType, setBaseType] = useState<"solo" | "collab">("solo");
  const [filter, setFilter] = useState<FilterOption>("ongoing");
  const [sortBy, setSortBy] = useState<SortOption>("popularity");

  const { data: exhibits = [], isLoading } = useExhibitCards();

  const now = new Date();

  const isOngoing = (exhibit: any) =>
    exhibit.startDate && exhibit.endDate &&
    new Date(exhibit.startDate) <= now && new Date(exhibit.endDate) >= now;

  const isUpcoming = (exhibit: any) =>
    exhibit.startDate && new Date(exhibit.startDate) > now;

  const isEnded = (exhibit: any) =>
    exhibit.endDate && new Date(exhibit.endDate) < now;

  const filteredExhibits = exhibits.filter((exhibit: any) => {
    const matchesType = baseType === "solo" ? exhibit.isSolo : !exhibit.isSolo;

    if (!matchesType) return false;

    if (filter === "trending") return exhibit.likes > 100;
    if (filter === "most-viewed") return exhibit.views > 1.3;
    if (filter === "upcoming") return isUpcoming(exhibit);
    if (filter === "ongoing") return isOngoing(exhibit);
    if (filter === "ended") return isEnded(exhibit);

    return true; // filter === "none"
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
          <div className="mb-8 mt-20">
            <span className="font-bold">Exhibits</span>

            <div className="flex flex-wrap items-center justify-between gap-4 my-4">
              {/* SOLO / COLLAB TOGGLE */}
              <div className="flex flex-wrap gap-2">
                {["solo", "collab"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setBaseType(type as "solo" | "collab")}
                    className={`py-[5px] px-4 rounded-full text-[10px] font-small transition-colors ${
                      baseType === type
                        ? "border border-gray-300 font-medium shadow-md"
                        : "bg-white border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* FILTER DROPDOWN */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="py-1 px-4 rounded-full text-[10px] border border-gray-300">
                      <i className="bx bx-filter text-xs mr-2"></i>
                      {{
                        trending: "Trending",
                        "most-viewed": "Most Viewed",
                        upcoming: "Upcoming",
                        ongoing: "Ongoing",
                        ended: "Ended",
                      }[filter] || "Filter"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilter("trending")} className="text-[10px]">
                      Trending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("most-viewed")} className="text-[10px]">
                      Most Viewed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("upcoming")} className="text-[10px]">
                      Upcoming
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("ongoing")} className="text-[10px]">
                      Ongoing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("ended")} className="text-[10px]">
                      Ended
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* CREATE BUTTON */}
                <button
                  className="py-[5px] px-4 text-[10px] bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center gap-1"
                  onClick={() => navigate("/add-exhibit")}
                >
                  <i className="bx bx-plus text-xs"></i>
                  Create
                </button>
              </div>
            </div>
          </div>

          {/* Exhibit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ExhibitCardSkeleton key={i} />)
              : sortedExhibits.map((exhibit) => (
                  <ExhibitCard
                    key={exhibit.id}
                    exhibit={{
                      ...exhibit,
                      category: exhibit.category.charAt(0).toUpperCase() + exhibit.category.slice(1),
                    }}
                    onClick={() => navigate(`/view-exhibit/${exhibit.id}`)}
                  />
                ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Exhibits;
