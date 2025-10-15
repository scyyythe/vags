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
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

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

  // Auto translation setup
  const { language: selectedLanguage } = useLanguage();

  const titleText = useAutoTranslation("All Notifications", selectedLanguage);
  const clearAllText = useAutoTranslation("Clear All", selectedLanguage);
  const searchPlaceholder = useAutoTranslation("Search notifications", selectedLanguage);
  const filterByDateText = useAutoTranslation("Filter by date", selectedLanguage);
  const clearText = useAutoTranslation("Clear", selectedLanguage);
  const applyText = useAutoTranslation("Apply", selectedLanguage);
  const resetFiltersText = useAutoTranslation("Reset Filters", selectedLanguage);
  const showingText = useAutoTranslation("Showing notifications from", selectedLanguage);
  const noNotificationsText = useAutoTranslation("No notifications", selectedLanguage);
  const emptySearchText = useAutoTranslation(
    "No notifications match your current filters. Try adjusting your search or date filter.",
    selectedLanguage
  );
  const emptyDefaultText = useAutoTranslation(
    "You don't have any notifications at the moment.",
    selectedLanguage
  );
  const clearFiltersText = useAutoTranslation("Clear Filters", selectedLanguage);
  const callText = useAutoTranslation("Call", selectedLanguage);
  const emailText = useAutoTranslation("Email", selectedLanguage);
  const replyText = useAutoTranslation("Reply", selectedLanguage);
  const viewOnExplorerText = useAutoTranslation("View on explorer ↗", selectedLanguage);

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
            <h1 className="text-sm font-bold text-gray-900">{titleText}</h1>
          </div>

          <button
            onClick={() => clearAll()}
            disabled={displayedNotifications.length === 0}
            className="h-9 flex flex-row text-xs text-red-700 hover:text-red-600 cursor-pointer"
          >
            {clearAllText}
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
                  placeholder={searchPlaceholder}
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
                      {date instanceof Date && !isNaN(date.getTime())
                        ? format(date, "MMM d, yyyy")
                        : filterByDateText}
                      <ChevronDown className="ml-auto h-3 w-3 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-70 p-0" align="end">
                    <CalendarComponent mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                    <div className="py-2 px-3 border-t flex justify-between">
                      <button className="text-xs" onClick={() => handleDateSelect(undefined)}>
                        {clearText}
                      </button>
                      <button className="text-xs" onClick={() => setIsFilterOpen(false)}>
                        {applyText}
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {date && (
              <div className="w-[96%] mx-auto px-4 py-2 bg-blue-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md">
                {date instanceof Date && !isNaN(date.getTime()) && (
                  <span className="text-[10px] text-blue-700">
                    {showingText} {format(date, "MMMM d, yyyy")}
                  </span>
                )}

                <Button variant="ghost" size="sm" className="text-blue-700 h-8 text-[10px]" onClick={resetFilters}>
                  {resetFiltersText}
                </Button>
              </div>
            )}

            <ScrollArea className="h-[calc(110vh-200px)] px-4 py-2 mt-2">
              {displayedNotifications.length > 0 ? (
                <div className="space-y-3 pr-2">
                  {displayedNotifications.map((n) => (
                    <NotificationItem key={n.id} n={n} selectedLanguage={selectedLanguage} navigate={navigate} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="text-md font-medium text-gray-900 mb-1">{noNotificationsText}</h3>
                  <p className="text-gray-500 max-w-sm text-xs">
                    {searchQuery || date ? emptySearchText : emptyDefaultText}
                  </p>
                  {(searchQuery || date) && (
                    <Button variant="outline" className="mt-4 text-[11px]" onClick={resetFilters}>
                      {clearFiltersText}
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

const NotificationItem = ({ n, selectedLanguage, navigate }: any) => {
  const translatedAction = useAutoTranslation(n.action || "", selectedLanguage);
  const translatedTarget = useAutoTranslation(n.target || "", selectedLanguage);
  const translatedDonation = useAutoTranslation(n.donation || "", selectedLanguage);
  const translatedForAmount = useAutoTranslation(n.forAmount || "", selectedLanguage);
  const viewOnExplorerText = useAutoTranslation("View on explorer ↗", selectedLanguage);

  // Translated time units
  const dayLabel = useAutoTranslation("day", selectedLanguage);
  const daysLabel = useAutoTranslation("days", selectedLanguage);
  const hourLabel = useAutoTranslation("hour", selectedLanguage);
  const hoursLabel = useAutoTranslation("hours", selectedLanguage);
  const minuteLabel = useAutoTranslation("minute", selectedLanguage);
  const minutesLabel = useAutoTranslation("minutes", selectedLanguage);
  const justNowLabel = useAutoTranslation("Just now", selectedLanguage);
  const agoLabel = useAutoTranslation("ago", selectedLanguage);

  const formatDateTime = (dateTimeString: string, language: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / (3600000 * 24));

    const justNowLabel = useAutoTranslation("Just now", language);
    const hoursAgoLabel = useAutoTranslation("hour ago", language);
    const hoursPluralLabel = useAutoTranslation("hours ago", language);
    const minutesAgoLabel = useAutoTranslation("minute ago", language);
    const minutesPluralLabel = useAutoTranslation("minutes ago", language);

    if (diffDays >= 1) {
      const formattedDate = date.toLocaleString(
        language === "EN" ? "en-US" : undefined,
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );
      return useAutoTranslation(formattedDate, language);
    } else if (diffHours >= 1) {
      return `${diffHours} ${diffHours > 1 ? hoursPluralLabel : hoursAgoLabel}`;
    } else if (diffMinutes >= 1) {
      return `${diffMinutes} ${diffMinutes > 1 ? minutesPluralLabel : minutesAgoLabel}`;
    } else {
      return justNowLabel;
    }
  };

  const getTimeAgo = (created_at: string | Date) => {
    const createdDate = new Date(created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    let result = "";

    if (diffDays > 0) {
      result += diffDays === 1 ? `1 ${dayLabel}` : `${diffDays} ${daysLabel}`;
    }

    if (diffHours % 24 > 0) {
      if (result) result += ", ";
      const hours = diffHours % 24;
      result += hours === 1 ? `1 ${hourLabel}` : `${hours} ${hoursLabel}`;
    }

    if (!result && diffMinutes > 0) {
      result = diffMinutes === 1 ? `1 ${minuteLabel}` : `${diffMinutes} ${minutesLabel}`;
    }

    if (!result) result = justNowLabel;

    return `${result} ${agoLabel}`;
  };

  return (
    <div
      onClick={() => {
        if (n.link) navigate(n.link);
      }}
      key={n.id}
      className="flex p-4 bg-white border rounded-sm shadow-sm hover:bg-gray-50 transition-colors"
    >
      <div className="flex-shrink-0 mr-4">
        {n.actor?.profile_picture ? (
          <img src={n.actor.profile_picture} alt={n.name || ""} className="w-5 h-5 rounded-full object-cover" />
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
          {translatedAction}
          {translatedTarget && (
            <span className="block mt-1 text-xs text-gray-700 font-semibold">{translatedTarget}</span>
          )}
        </p>

        {n.icon === "crypto" && (
          <div className="mt-1 text-xs">
            <span className="font-medium">{n.amount}</span> for{" "}
            <span className="font-medium text-red-500">
              {translatedForAmount} {n.token}
            </span>
            {n.link && (
              <div className="mt-1">
                <a
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  {viewOnExplorerText}
                </a>
              </div>
            )}
          </div>
        )}

        {n.donation && (
          <div className="mt-1 text-xs">
            <span className="font-medium text-green-600">{translatedDonation}</span> for{" "}
            <span className="font-medium">{translatedTarget}</span>
          </div>
        )}

        <div className="text-[10px] text-gray-400 mt-2">
           {getTimeAgo(n.created_at)} · {formatDateTime(n.created_at, selectedLanguage)}
        </div>
      </div>
    </div>
  );
};


export default AllNotifications;
