import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { Bell, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Logo />
          <nav className="ml-10 hidden text-xs md:flex space-x-6">
            <Link
              to="/explore"
              className={`nav-link ${currentPath === "/explore" ? "nav-link-active" : ""}`}
            >
              Explore
            </Link>
            <Link
              to="/exhibits"
              className={`nav-link ${currentPath === "/exhibits" ? "nav-link-active" : ""}`}
            >
              Exhibits
            </Link>
            <Link
              to="/bidding"
              className={`nav-link ${currentPath === "/bidding" ? "nav-link-active" : ""}`}
            >
              Bidding
            </Link>
            <Link
              to="/marketplace"
              className={`nav-link ${currentPath === "/marketplace" ? "nav-link-active" : ""}`}
            >
              Marketplace
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="button-icon">
            <MessageCircle size={15} />
          </button>
          <button className="button-icon">
            <Bell size={15} />
          </button>
          <Button size="sm" className="bg-red hover:bg-red/90 rounded-full px-4 text-xs text-red-600 border border-red-600">
            Upgrade
          </Button>
          <Avatar className="h-8 w-8 border">
            <AvatarImage src="https://i.pravatar.cc/300" alt="@user" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;