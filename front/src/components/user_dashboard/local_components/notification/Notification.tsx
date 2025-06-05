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
interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Gladys Dare",
    action: "commented on",
    target: "Ecosystems and conservation",
    time: "1m ago",
  },
  {
    id: 2,
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    name: "Rosina Wisoky",
    action: "followed you",
    time: "20m ago",
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
  },
  {
    id: 4,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    name: "Sunny Graham",
    action: "voted for",
    target: "Research peat-based carbon capture",
    time: "1h ago",
    check: true,
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
  },
  {
    id: 7,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    name: "Sunny Graham",
    action: "voted for",
    target: "Research peat-based carbon capture",
    time: "1h ago",
    check: true,
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
  },
  {
    id: 10,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    name: "Sunny Graham",
    action: "voted for",
    target: "Research peat-based carbon capture",
    time: "1h ago",
    check: true,
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
  },
  {
    id: 15,
    avatar: "https://randomuser.me/api/portraits/men/34.jpg",
    name: "John Doe",
    action: "liked your artwork",
    target: "Starry Night",
    time: "Just now",
  },
];

const Notification = ({ isOpen, onClose }: NotificationsProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navigate = useNavigate();
  const { displayedNotifications } = useNotifications();
  const handleNotification = () => {
    navigate("/settings/notifications");
    onClose();
  };

  const handleSeeAll = () => {
    navigate("/all-notifications");
    onClose();
  };
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / (3600000 * 24));

    if (diffDays >= 1) {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffHours >= 1) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffMinutes >= 1) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="w-[330px] max-h-[540px] rounded-xl bg-white shadow-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-sm">Notifications</h2>
        <DropdownMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DropdownMenuTrigger asChild>
            <Settings
              className="w-3 h-3 text-muted-foreground cursor-pointer"
              onClick={() => setSettingsOpen((prev) => !prev)}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-38">
            <DropdownMenuItem className="text-[10px]" onClick={handleSeeAll}>
              See all
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[10px]" onClick={handleNotification}>
              Notification settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="h-[480px] px-4 py-2">
        <div className="space-y-4 pr-2">
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-xs text-muted-foreground mt-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-md font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500 max-w-sm text-xs"> You don't have any notifications at the moment.</p>
            </div>
          ) : (
            displayedNotifications.map((n) => (
              <div
                key={n.id}
                className={cn("flex items-start gap-3 cursor-pointer", {
                  "hover:bg-gray-100 p-2 rounded-md transition": n.link,
                })}
                onClick={() => {
                  if (n.link) {
                    navigate(n.link);
                    onClose();
                  }
                }}
              >
                {n.actor && n.actor.profile_picture ? (
                  <img src={n.actor.profile_picture} alt={n.name} className="w-6 h-6 rounded-full object-cover" />
                ) : n.icon === "crypto" ? (
                  <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                    ⬤
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center font-regular text-xs">
                    {n.name ? n.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}

                <div className="text-[10px] leading-snug">
                  {n.name && (
                    <>
                      <span className="font-medium">{n.name}</span>
                      {n.message &&
                        (() => {
                          const regex = /(.*tipped you )(\$\d+(?:\.\d+)?)( for your artwork.*)/;
                          const match = n.message.match(regex);
                          if (match) {
                            return (
                              <span className="font-medium">
                                {match[1]}
                                <span className="text-green-600">{match[2]}</span>
                                {match[3]}
                              </span>
                            );
                          } else {
                            return <span className="font-medium">{n.message}</span>;
                          }
                        })()}
                    </>
                  )}
                  {!n.name && n.icon === "crypto" && (
                    <>
                      {n.action} ...
                      <span className="font-medium">{n.amount}</span> for{" "}
                      <span className="font-medium text-red-500">
                        {n.forAmount} {n.token}
                      </span>
                      <div>
                        <a
                          href={n.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline"
                        >
                          View on explorer ↗
                        </a>
                      </div>
                    </>
                  )}
                  {n.donation && <>{/* <span className="font-medium text-green-600"> {n.donation} </span> */}</>}
                  <div className="text-[10px] text-muted-foreground mt-1">{formatDateTime(n.created_at)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
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

export default Notification;
