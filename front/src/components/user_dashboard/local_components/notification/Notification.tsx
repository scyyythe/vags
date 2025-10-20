import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import useNotifications from "@/hooks/notifications/useNotification";
import useMarkNotificationAsRead from "@/hooks/notifications/useMarkNotificationAsRead";
import NotificationSkeleton from "../../../skeletons/notifications/NotificationSkeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Notification = ({ isOpen, onClose }: NotificationsProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { displayedNotifications, isLoading, error, refetch } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();

  const { language } = useLanguage();

  // Translated UI labels
  const notificationsTitle = useAutoTranslation("Notifications", language);
  const seeAllLabel = useAutoTranslation("See all", language);
  const notifSettingsLabel = useAutoTranslation("Notification settings", language);
  const failedTitle = useAutoTranslation("Failed to load notifications", language);
  const failedDesc = useAutoTranslation("There was an error loading your notifications.", language);
  const tryAgainLabel = useAutoTranslation("Try Again", language);
  const noNotifTitle = useAutoTranslation("No notifications", language);
  const noNotifDesc = useAutoTranslation("You don't have any notifications at the moment.", language);

  const handleNotification = () => {
    navigate("/settings/notifications");
    onClose();
  };

  const handleSeeAll = () => {
    navigate("/all-notifications");
    onClose();
  };

  const handleNotificationClick = (notification: any) => {
    // Mark notification as read if it's unread
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id, {
        onSuccess: () => {
          // Optional: Add a small delay to show the visual change before navigation
          if (notification.link) {
            setTimeout(() => {
              navigate(notification.link);
              onClose();
            }, 100);
          }
        },
        onError: () => {
          // If marking as read fails, still allow navigation
          if (notification.link) {
            navigate(notification.link);
            onClose();
          }
        }
      });
    } else if (notification.link) {
      // If already read, navigate immediately
      navigate(notification.link);
      onClose();
    }
  };

  return (
    <div className="w-[330px] max-h-[540px] rounded-xl bg-white shadow-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-sm">{notificationsTitle}</h2>

        <DropdownMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DropdownMenuTrigger asChild>
            <Settings
              className="w-3 h-3 text-muted-foreground cursor-pointer"
              onClick={() => setSettingsOpen((prev) => !prev)}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-38">
            <DropdownMenuItem className="text-[10px]" onClick={handleSeeAll}>
              {seeAllLabel}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[10px]" onClick={handleNotification}>
              {notifSettingsLabel}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="h-[480px] px-4 py-2">
        <div className="space-y-4 pr-2">
          {isLoading ? (
            <NotificationSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-xs text-muted-foreground mt-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-md font-medium text-gray-900 mb-1">{failedTitle}</h3>
              <p className="text-gray-500 max-w-sm text-xs mb-2">{failedDesc}</p>
              <button
                onClick={() => refetch()}
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                {tryAgainLabel}
              </button>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-xs text-muted-foreground mt-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-md font-medium text-gray-900 mb-1">{noNotifTitle}</h3>
              <p className="text-gray-500 max-w-sm text-xs">{noNotifDesc}</p>
            </div>
          ) : (
            displayedNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                n={n}
                language={language}
                navigate={navigate}
                onClose={onClose}
                onNotificationClick={handleNotificationClick}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Child component (safe hook usage)
const NotificationItem = ({ n, language, navigate, onClose, onNotificationClick }: any) => {
  const translatedName = n.name ? useAutoTranslation(n.name, language) : "";
  const translatedMessage = n.message ? useAutoTranslation(n.message, language) : "";
  const translatedAction = n.action ? useAutoTranslation(n.action, language) : "";
  const translatedForAmount = n.forAmount ? useAutoTranslation(n.forAmount, language) : "";

  const viewOnExplorerLabel = useAutoTranslation("View on explorer", language);
  const justNowLabel = useAutoTranslation("Just now", language);
  const hoursAgoLabel = useAutoTranslation("hour ago", language);
  const hoursPluralLabel = useAutoTranslation("hours ago", language);
  const minutesAgoLabel = useAutoTranslation("minute ago", language);
  const minutesPluralLabel = useAutoTranslation("minutes ago", language);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / (3600000 * 24));

    if (diffDays >= 1) {
      const formattedDate = date.toLocaleString(language === "EN" ? "en-US" : undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return useAutoTranslation(formattedDate, language);
    } else if (diffHours >= 1) {
      return `${diffHours} ${diffHours > 1 ? hoursPluralLabel : hoursAgoLabel}`;
    } else if (diffMinutes >= 1) {
      return `${diffMinutes} ${diffMinutes > 1 ? minutesPluralLabel : minutesAgoLabel}`;
    } else {
      return justNowLabel;
    }
  };

  return (
    <div
      key={n.id}
      className={cn("flex items-start gap-3 cursor-pointer", {
        "hover:bg-gray-100 p-2 rounded-md transition": n.link,
        "bg-blue-50": !n.is_read,
      })}
      onClick={() => onNotificationClick(n)}
    >
      {n.actor && n.actor.profile_picture ? (
        <img src={n.actor.profile_picture} alt={n.name} className="w-6 h-6 rounded-full object-cover" />
      ) : n.icon === "crypto" ? (
        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-sm font-medium">⬤</div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center font-regular text-xs">
          {n.name ? n.name.charAt(0).toUpperCase() : "?"}
        </div>
      )}

      <div className="text-[10px] leading-snug">
        {n.name && (
          <>
            <span className="font-medium">{translatedName}</span>
            {translatedMessage && <span className="font-medium"> {translatedMessage}</span>}
          </>
        )}
        {!n.name && n.icon === "crypto" && (
          <>
            {translatedAction} ...
            <span className="font-medium">{n.amount}</span> {useAutoTranslation("for", language)}{" "}
            <span className="font-medium text-red-500">
              {translatedForAmount} {n.token}
            </span>
            <div>
              <a
                href={n.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-600 hover:underline"
              >
                {viewOnExplorerLabel} ↗
              </a>
            </div>
          </>
        )}
        <div className="text-[10px] text-muted-foreground mt-1">{formatDateTime(n.created_at)}</div>
      </div>
    </div>
  );
};

// Simple Bell icon
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

export default Notification;
