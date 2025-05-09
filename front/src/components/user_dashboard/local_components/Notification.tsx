import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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
];

export default function Notifications() {
    const [settingsOpen, setSettingsOpen] = useState(false);

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
                    <DropdownMenuItem className="text-[10px]">See all</DropdownMenuItem>
                    <DropdownMenuItem className="text-[10px]">Notification settings</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        
            <ScrollArea className="h-[480px] px-4 py-2">
                <div className="space-y-4 pr-2">
                {notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3">
                    {n.avatar && (
                        <img
                        src={n.avatar}
                        alt={n.name}                         
                        className="w-6 h-6 rounded-full object-cover"
                        />
                    )}
                    {!n.avatar && n.icon === "crypto" && (
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        ⬤
                        </div>
                    )}
                    <div className="text-[10px] leading-snug">
                        {n.name && (
                        <>
                            <span className="font-medium">{n.name}</span> {n.action}
                            {n.target && (
                            <span className="font-medium"> {n.target}</span>
                            )}
                        </>
                        )}
                        {!n.name && n.icon === "crypto" && (
                        <>
                            {n.action}{" "}...                             
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
                        {n.donation && (
                        <>
                            <span className="font-medium text-green-600">
                            {n.donation}
                            </span>{" "}...                             
                            for <span className="font-medium">{n.target}</span>
                        </>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-1">
                        {n.time}
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>
    );
}    
