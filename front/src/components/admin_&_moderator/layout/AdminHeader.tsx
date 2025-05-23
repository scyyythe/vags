import { Bell, Search, PanelLeft } from "lucide-react";
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
  const { setShowLoginModal } = useModal();
  const onClose = () => {
    setShowLoginModal(false);
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    setShowLoginModal(true);
    onClose();
  };
  return (
    <header className="border-b bg-white h-14 px-4 flex items-center justify-between">
      <div className="flex-1 flex items-center">
        {/* Add an additional sidebar trigger in the header for easier access */}
        <SidebarTrigger className="mr-2" aria-label="Toggle sidebar" />

        <div className="hidden sm:flex items-center relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search..." className="pl-8 h-8 text-xs focus-visible:ring-primary" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
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
