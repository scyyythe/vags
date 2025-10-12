import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/user_dashboard/navbar/Header";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";
import ArtMediumSelect from "@/components/user_dashboard/local_components/categories/ArtMediumSelect";
import useTopSellers from "@/hooks/users/top_seller/useTopSellers";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useTopArtworks, { TopArtworksFilters } from "@/hooks/users/top_seller/useTopArtworks";
import { useMemo } from "react";

export default function TopSellingArtworks() {
  const [timeRange, setTimeRange] = useState("Last 7 days");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMedium, setSelectedMedium] = useState("Medium");

  // Create filters object
  const filters: TopArtworksFilters = useMemo(
    () => ({
      category: selectedCategory,
      medium: selectedMedium,
      timeRange: timeRange,
    }),
    [selectedCategory, selectedMedium, timeRange]
  );

  const { data: rawSellers = [], isLoading } = useTopArtworks(filters);

  // Client-side filtering as fallback (in case backend filtering isn't perfect)
  const sellers = useMemo(() => {
    let filtered = rawSellers;

    // Filter by category
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter((seller) => seller.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by medium (if available in the data)
    if (selectedMedium && selectedMedium !== "Medium") {
      filtered = filtered.filter((seller) => seller.medium?.toLowerCase() === selectedMedium.toLowerCase());
    }

    return filtered;
  }, [rawSellers, selectedCategory, selectedMedium]);
  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <Header />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 mt-16 md:mt-[2.5rem]">
        <h1 className="text-lg font-bold">Top Sellers</h1>
        <div className="flex items-center gap-2 text-xs">
          <div className="relative">
            <ArtCategorySelect selectedCategory={selectedCategory} onChange={(value) => setSelectedCategory(value)} />
          </div>
          <div className="relative">
            <ArtMediumSelect selectedMedium={selectedMedium} onChange={(value) => setSelectedMedium(value)} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center border border-gray-300 px-2.5 py-[5px] gap-3 text-[10px] rounded-full">
                <Calendar size={12} /> {timeRange}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="text-[10px]" onClick={() => setTimeRange("Last 7 days")}>
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[10px]" onClick={() => setTimeRange("Last 30 days")}>
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[10px]" onClick={() => setTimeRange("All time")}>
                All time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto text-sm">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow className="border-none">
              <TableHead className="text-xs text-black w-8 text-center"> </TableHead>
              <TableHead className="text-xs text-black">Artwork Title</TableHead>
              <TableHead className="text-xs text-black">Total Sales</TableHead>
              <TableHead className="text-xs text-black">24h Trend</TableHead>
              <TableHead className="text-xs text-black">7-Day Trend</TableHead>
              <TableHead className="text-xs text-black">Starting Price</TableHead>
              <TableHead className="text-xs text-black">Buyers</TableHead>
              <TableHead className="text-xs text-black">Editions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Show loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="text-sm border-none">
                  <TableCell className="text-xs text-center font-semibold text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div>
                        <div className="w-24 h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : sellers.length > 0 ? (
              sellers.map((art: any, i: number) => (
                <TableRow key={i} className="text-sm border-none">
                  <TableCell className="text-xs text-center font-semibold text-muted-foreground">{i + 1}</TableCell>

                  <TableCell className="min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <img
                        src={art.profile_picture || art.image || ""}
                        alt={art.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-medium">{art.title ?? art.top_artwork?.title ?? art.name}</div>
                        <div className="text-[10px] text-muted-foreground">by {art.artist_name ?? art.artist}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs">{art.sold_count ?? art.volume}</TableCell>

                  <TableCell
                    className={cn(
                      "text-xs",
                      art.change24h && art.change24h.startsWith("-") ? "text-red-500" : "text-green-500"
                    )}
                  >
                    {art.change24h ?? "-"}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "text-xs",
                      art.change7d && art.change7d.startsWith("-") ? "text-red-500" : "text-green-500"
                    )}
                  >
                    {art.change7d ?? "-"}
                  </TableCell>

                  <TableCell className="text-xs">
                    {art.starting_price
                      ? `${art.starting_price} php`
                      : art.top_artwork?.starting_price
                      ? `${art.top_artwork.starting_price} php`
                      : art.floorPrice
                      ? art.floorPrice
                      : "-"}
                  </TableCell>

                  <TableCell className="text-xs">
                    {art.buyers ?? art.top_artwork?.buyers ?? art.owners ?? "-"}
                  </TableCell>
                  <TableCell className="text-xs">{art.edition ?? art.items ?? "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              // Show empty state when no data
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No top sellers data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
