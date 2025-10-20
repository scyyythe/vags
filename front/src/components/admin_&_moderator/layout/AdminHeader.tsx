import { Bell, Search, PanelLeft, MoreVertical } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useModal } from "@/context/ModalContext";
import useUserQuery from "@/hooks/users/useUserQuery";
import { getLoggedInUserId } from "@/auth/decode";
// Removed modal-based view-all; using full page instead
type AdminHeaderProps = {
  role: "admin" | "moderator";
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
};

export function AdminHeader({ role, user }: AdminHeaderProps) {
  const navigate = useNavigate();
  const userId = getLoggedInUserId();
  const { data: admin, isLoading, isError } = useUserQuery(userId);

  const { setShowLoginModal } = useModal();
  const onClose = () => {
    setShowLoginModal(false);
  };

  const initials = admin?.first_name
    ? admin.first_name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    setShowLoginModal(true);
    onClose();
  };
  
  // Mock notifications for admin
  const notifications: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    type: "system" | "security" | "user" | "payment";
    read?: boolean;
    archived?: boolean;
  }> = [
    { id: "1", title: "System maintenance scheduled", description: "Tonight at 11:00 PM UTC.", time: "5m ago", type: "system" },
    { id: "2", title: "New user registered", description: "Curator account pending review.", time: "12m ago", type: "user" },
    { id: "3", title: "Security log alert", description: "3 failed login attempts detected.", time: "1h ago", type: "security" },
    { id: "4", title: "Payment dispute opened", description: "Order #2043 requires attention.", time: "2h ago", type: "payment" },
    { id: "5", title: "Policy updated", description: "Privacy Policy v2.3 published.", time: "3h ago", type: "system" },
    { id: "6", title: "Moderator report", description: "Content flagged for review (ID: 8841).", time: "3h ago", type: "user" },
    { id: "7", title: "Backup completed", description: "Nightly backup finished successfully.", time: "4h ago", type: "system" },
    { id: "8", title: "High error rate", description: "API 5xx spiked above threshold.", time: "4h ago", type: "security" },
    { id: "9", title: "Payout processed", description: "Artist J. Cruz payout sent.", time: "5h ago", type: "payment" },
    { id: "10", title: "Role change requested", description: "User 1294 requested Moderator access.", time: "6h ago", type: "user" },
    { id: "11", title: "New exhibit created", description: "“Autumn Forms” pending approval.", time: "7h ago", type: "user" },
    { id: "12", title: "Terms accepted", description: "All moderators acknowledged latest terms.", time: "9h ago", type: "system" },
    { id: "13", title: "Chargeback notice", description: "Payment dispute for Order #2019.", time: "12h ago", type: "payment" },
    { id: "14", title: "Suspicious activity", description: "Unusual IP change on admin account.", time: "13h ago", type: "security" },
    { id: "15", title: "Large transaction", description: "$2,300 purchase approved.", time: "15h ago", type: "payment" },
    { id: "16", title: "Integration warning", description: "Webhook retries exceeded for Mailer.", time: "18h ago", type: "system" },
    { id: "17", title: "User appeal received", description: "Suspension appeal from user #992.", time: "20h ago", type: "user" },
    { id: "18", title: "Password policy updated", description: "Minimum length increased to 12.", time: "1d ago", type: "security" },
  ];
  // Dropdown notifications state: support read/archived and inbox/archive views
  const [dropdownNotifications, setDropdownNotifications] = useState(
    notifications.map((n) => ({ ...n, read: n.read ?? false, archived: n.archived ?? false }))
  );
  // Show only non-archived items in dropdown; archive view is available on full page
  const visibleDropdownNotifications = useMemo(
    () => dropdownNotifications.filter((n) => !n.archived),
    [dropdownNotifications]
  );

  const markDropdownRead = (id: string) =>
    setDropdownNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const archiveDropdown = (id: string) =>
    setDropdownNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, archived: true } : n)));

  return (
    <header className="sticky top-0 z-40 border-b bg-white h-14 px-4 flex items-center justify-between">
      <div className="flex-1 flex items-center">
        {/* Add an additional sidebar trigger in the header for easier access */}
        <SidebarTrigger className="mr-2" aria-label="Toggle sidebar" />

        <div className="hidden sm:flex items-center relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-8 h-8 rounded-full focus-visible:ring-primary"
            style={{ fontSize: "10px" }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
            <div className="px-3 py-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Notifications</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Notifications menu">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="text-[10px]">
                    <Link to={`/${role}/notifications`} className="w-full">View all</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-[10px]"
                    onClick={() => setDropdownNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                  >
                    Mark all as read
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-[10px]"
                    onClick={() => setDropdownNotifications((prev) => prev.map((n) => ({ ...n, read: false })))}
                  >
                    Mark all as unread
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="max-h-[510px] overflow-auto">
              {visibleDropdownNotifications.map((n) => (
                <div key={n.id} className={`px-3 py-2 hover:bg-muted/40 transition-colors ${!n.read ? "bg-muted/60" : ""}`}>
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-[2px] h-2 w-2 rounded-full ${
                        n.type === "system"
                          ? "bg-blue-500"
                          : n.type === "security"
                          ? "bg-red-500"
                          : n.type === "payment"
                          ? "bg-purple-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{n.description}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                  </div>
                </div>
              ))}
              {visibleDropdownNotifications.length === 0 && (
                <div className="px-3 py-6 text-center text-[11px] text-muted-foreground">No notifications</div>
              )}
            </div>
            
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
              <Avatar className="h-8 w-8">
                {admin && admin.profile_picture ? (
                  <AvatarImage src={admin.profile_picture} alt={`${admin.first_name} ${admin.last_name}`} />
                ) : (
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="text-xs">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">
              <Link to={`/${role}/profile`} className="w-full">
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <Link to={`/${role}/security`} className="w-full">
                Security
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-destructive" onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
