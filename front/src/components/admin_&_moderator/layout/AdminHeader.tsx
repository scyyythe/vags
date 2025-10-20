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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  
  // Mock notifications per role
  type DropdownNotif = {
    id: string;
    title: string;
    description: string;
    time: string;
    type: "system" | "security" | "user" | "payment";
    read?: boolean;
    archived?: boolean;
  };

  const adminNotifications: DropdownNotif[] = [
    { id: "a1", title: "System maintenance scheduled", description: "Tonight at 11:00 PM UTC.", time: "5m ago", type: "system" },
    { id: "a2", title: "Policy updated", description: "Privacy Policy v2.3 published.", time: "20m ago", type: "system" },
    { id: "a3", title: "High error rate", description: "API 5xx spiked above threshold.", time: "1h ago", type: "security" },
    { id: "a4", title: "Payment dispute opened", description: "Order #2043 requires attention.", time: "2h ago", type: "payment" },
    { id: "a5", title: "Payout processed", description: "Artist J. Cruz payout sent.", time: "3h ago", type: "payment" },
    { id: "a6", title: "Role change requested", description: "User 1294 requested Moderator access.", time: "4h ago", type: "user" },
    { id: "a7", title: "New exhibit created", description: "‘Autumn Forms’ pending approval.", time: "6h ago", type: "user" },
    { id: "a8", title: "Password policy updated", description: "Minimum length now 12 characters.", time: "1d ago", type: "security" },
  ];

  const moderatorNotifications: DropdownNotif[] = [
    { id: "m1", title: "New report submitted", description: "Report on artwork ‘Dark Shadows’.", time: "3m ago", type: "user" },
    { id: "m2", title: "User warning issued", description: "Warning sent to @creative456.", time: "25m ago", type: "user" },
    { id: "m3", title: "Auto-removed content", description: "Comment removed for prohibited language.", time: "1h ago", type: "system" },
    { id: "m4", title: "High priority: copyright strike", description: "DMCA takedown received for ‘Blue Waves’.", time: "2h ago", type: "security" },
    { id: "m5", title: "Multiple reports for user", description: "@pixelmaster has 5 reports today.", time: "4h ago", type: "user" },
    { id: "m6", title: "Maintenance complete", description: "All moderation tools operational.", time: "1d ago", type: "system" },
  ];

  const notifications: DropdownNotif[] = role === "admin" ? adminNotifications : moderatorNotifications;
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
            <DropdownMenuItem className="text-xs text-destructive" onClick={() => setIsLogoutOpen(true)}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {/* Confirm Logout */}
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className="text-xs [&>button]:hidden w-[90%] rounded-lg max-w-[360px] sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-sm text-center">Confirm Logout</DialogTitle>
            <DialogDescription className="text-[10px] text-center">
              Are you sure you want to log out of the {role === "admin" ? "Admin" : "Moderator"} panel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] rounded-full w-full"
              onClick={() => setIsLogoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 text-[10px] bg-red-700 hover:bg-red-600 rounded-full w-full"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
