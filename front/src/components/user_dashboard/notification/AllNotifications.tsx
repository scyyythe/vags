import { useState } from "react";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle2, ChevronDown, Mail, PhoneCall, Reply, Search, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import useNotifications from "@/hooks/notifications/useNotification";
import useClearAllNotifications from "@/hooks/notifications/useClearAllNotifications.tsx";
interface Notification {
  id: number;
  avatar?: string;
  name?: string;
  action: string;
  target?: string;
  time: string;
  check?: boolean;
  money?: boolean;
  icon?: string;
  amount?: string;
  forAmount?: string;
  token?: string;
  link?: string;
  donation?: string;
  date: Date;
}

const notifications: Notification[] = [
  {
    id: 1,
    name: "Gladys Dare",
    action: "commented on",
    target: "Ecosystems and conservation",
    time: "1m ago",
    date: new Date(2025, 4, 9),
  },
  {
    id: 2,
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    name: "Rosina Wisoky",
    action: "followed you",
    time: "20m ago",
    date: new Date(2025, 4, 9),
  },
  {
    id: 3,
    icon: "crypto",
    action: "You swapped exactly",
    amount: "0.50000 ETH",
    forAmount: "15,154.87",
    token: "1EARTH",
    link: "#",
    time: "25m ago",
    date: new Date(2025, 4, 9),
  },
  {
    id: 4,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    name: "Sunny Graham",
    action: "voted for",
    target: "Research peat-based carbon capture",
    time: "1h ago",
    check: true,
    date: new Date(2025, 4, 8),
  },
  {
    id: 5,
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    name: "Laurel Welch",
    action: "donated",
    donation: "$100.00",
    target: "Carbon removal",
    time: "2h ago",
    money: true,
    date: new Date(2025, 4, 8),
  },
  {
    id: 6,
    icon: "crypto",
    action: "You swapped exactly",
    amount: "0.50000 ETH",
    forAmount: "15,154.87",
    token: "1EARTH",
    link: "#",
    time: "25m ago",
    date: new Date(2025, 4, 7),
  },
  {
    id: 7,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    name: "Sunny Graham",
    action: "voted for",
    target: "Research peat-based carbon capture",
    time: "1h ago",
    check: true,
    date: new Date(2025, 4, 7),
  },
  {
    id: 8,
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    name: "Laurel Welch",
    action: "donated",
    donation: "$100.00",
    target: "Carbon removal",
    time: "2h ago",
    money: true,
    date: new Date(2025, 4, 6),
  },
  {
    id: 9,
    icon: "crypto",
    action: "You swapped exactly",
    amount: "0.50000 ETH",
    forAmount: "15,154.87",
    token: "1EARTH",
    link: "#",
    time: "25m ago",
    date: new Date(2025, 4, 6),
  },
  {
    id: 10,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    name: "Sunny Graham",
    action: "voted for",
    target: "Research peat-based carbon capture",
    time: "1h ago",
    check: true,
    date: new Date(2025, 4, 5),
  },
  {
    id: 11,
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    name: "Laurel Welch",
    action: "donated",
    donation: "$100.00",
    target: "Carbon removal",
    time: "2h ago",
    money: true,
    date: new Date(2025, 4, 1),
  },
  // Add business-like notifications similar to the image
  {
    id: 12,
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    name: "Jennifer Deaving",
    action: "Call back at 3:00pm",
    target: "Spoke to Ms. Jenni from The Centre For Excellence - Call on 15/2/19 at 3:00pm",
    time: "3h ago",
    date: new Date(2025, 4, 9),
  },
  {
    id: 13,
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    name: "Brandon Rosenthal",
    action: "Scheduled follow-up today!",
    time: "5h ago",
    date: new Date(2025, 4, 9),
  },
  {
    id: 14,
    icon: "project",
    action: "Workflow project | 5000$ | Sinform Solution",
    target: "This deal is about to close today!",
    time: "6h ago",
    date: new Date(2025, 4, 8),
  },
  {
    id: 15,
    avatar: "https://randomuser.me/api/portraits/men/34.jpg",
    name: "John Doe",
    action: "liked your artwork",
    target: "Starry Night",
    time: "Just now",
    date: new Date(2025, 4, 11),
  },
];

const AllNotifications = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    displayedNotifications,
    searchQuery,
    date,
    isFilterOpen,
    handleSearch,
    handleDateSelect,
    clearAllNotifications,
    resetFilters,
    setIsFilterOpen,
  } = useNotifications();
  const { mutate: clearAll, isPending } = useClearAllNotifications(clearAllNotifications);
  const goBack = () => {
    navigate("/");
  };

  return (
    <>
      <div className="min-h-screen">
        <Header />
        <header className="w-full flex flex-row justify-between mt-20 px-6 md:px-8 lg:px-12 sticky top-0 z-10">
          {/* Back button */}
          <div className={`flex flex-row ${isMobile ? "px-4" : ""}`}>
            <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold relative bottom-2">
              <i className="bx bx-chevron-left text-lg mr-2 "></i>
            </button>
            <h1 className="text-sm font-bold text-gray-900">All Notifications</h1>
          </div>

          <button
            onClick={() => clearAll()}
            disabled={displayedNotifications.length === 0}
            className="h-9 flex flex-row text-xs text-red-700 hover:text-red-600 cursor-pointer"
          >
            Clear All
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg mb-6">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-3 w-3 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search notifications"
                  className="pl-10 pr-4 py-2 w-full border rounded-full focus:outline-none focus:ring-1 focus:ring-black text-xs"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full py-2 px-4 sm:w-[200px] flex flex-row border rounded-full justify-start text-left font-normal text-[11px]",
                        date && "text-blue-600"
                      )}
                    >
                      <Calendar className="mr-2 h-3 w-3" />
                      {date instanceof Date && !isNaN(date.getTime()) ? format(date, "MMM d, yyyy") : "Filter by date"}

                      <ChevronDown className="ml-auto h-3 w-3 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-70 p-0" align="end">
                    <CalendarComponent mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                    <div className="py-2 px-3 border-t flex justify-between">
                      <button className="text-xs" onClick={() => handleDateSelect(undefined)}>
                        Clear
                      </button>
                      <button className="text-xs" onClick={() => setIsFilterOpen(false)}>
                        Apply
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {date && (
              <div className="px-4 py-2 bg-blue-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {date instanceof Date && !isNaN(date.getTime()) && (
                  <span className="text-[10px] text-blue-700">
                    Showing notifications from {format(date, "MMMM d, yyyy")}
                  </span>
                )}

                <Button variant="ghost" size="sm" className="text-blue-700 h-8 text-[10px]" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}

            <ScrollArea className="h-[calc(100vh-220px)] px-4 py-2">
              {displayedNotifications.length > 0 ? (
                <div className="space-y-3 pr-2">
                  {displayedNotifications.map((n) => (
                    <div
                      onClick={() => {
                        if (n.link) {
                          navigate(n.link);
                        }
                      }}
                      key={n.id}
                      className="flex p-4 bg-white border rounded-sm shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mr-4">
                        {n.actor.profile_picture ? (
                          <img
                            src={n.actor.profile_picture}
                            alt={n.name || ""}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : n.name ? (
                          <div className="w-5 h-5 rounded-full border bg-gray-50 flex items-center justify-center text-xs text-black uppercase">
                            {n.name.split(" ")[0][0]}
                          </div>
                        ) : n.icon === "crypto" ? (
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        ) : n.icon === "project" ? (
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0">
                        {n.name && <p className="font-medium text-gray-900 text-[11px]">{n.name}</p>}
                        <p className="text-gray-600 text-[10px] mt-1">
                          {n.action}
                          {n.target && (
                            <span className="block mt-1 text-xs text-gray-700 font-semibold">{n.target}</span>
                          )}
                        </p>
                        {n.icon === "crypto" && (
                          <div className="mt-1 text-xs">
                            <span className="font-medium">{n.amount}</span> for{" "}
                            <span className="font-medium text-red-500">
                              {n.forAmount} {n.token}
                            </span>
                            {n.link && (
                              <div className="mt-1">
                                <a
                                  href={n.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-blue-600 hover:underline"
                                >
                                  View on explorer ↗
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        {n.donation && (
                          <div className="mt-1 text-xs">
                            <span className="font-medium text-green-600">{n.donation}</span> for{" "}
                            <span className="font-medium">{n.target}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 mt-2">
                          {n.time} · {format(n.created_at, "MMM d, yyyy")}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 ml-2">
                        {/* Action buttons depending on notification type */}
                        {n.name && n.name.includes("Jennifer") && (
                          <Button variant="outline" size="sm" className="h-8 text-[10px]">
                            <PhoneCall className="h-3 w-3 mr-1" /> Call
                          </Button>
                        )}
                        {n.name && n.name.includes("Brandon") && (
                          <>
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              <Mail className="h-3 w-3 mr-1" /> Email
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              <PhoneCall className="h-3 w-3 mr-1" /> Call
                            </Button>
                          </>
                        )}
                        {n.icon === "project" && (
                          <>
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              <Mail className="h-3 w-3 mr-1" /> Email
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-[10px]">
                              <PhoneCall className="h-3 w-3 mr-1" /> Call
                            </Button>
                          </>
                        )}
                        {n.name && n.name.includes("Gladys") && (
                          <Button variant="outline" size="sm" className="h-8 text-[10px]">
                            <Reply className="h-3 w-3 mr-1" /> Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="text-md font-medium text-gray-900 mb-1">No notifications</h3>
                  <p className="text-gray-500 max-w-sm text-xs">
                    {searchQuery || date
                      ? "No notifications match your current filters. Try adjusting your search or date filter."
                      : "You don't have any notifications at the moment."}
                  </p>
                  {(searchQuery || date) && (
                    <Button variant="outline" className="mt-4 text-[11px]" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </main>
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
};

// Simple Bell icon component for empty state
const Bell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

export default AllNotifications;
