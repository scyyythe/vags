import { Link, useLocation, NavLink } from "react-router-dom";
import Logo from "./Logo";
import { Bell, MessageCircle, Search, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import ProfileDropdown from "./local_components/ProfileDropdown";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    // We don't close when clicking outside since the user requested to only close when clicking the avatar again
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Centered Navigation Links (Responsive) */}
        <nav
          className={`absolute left-0 top-16 w-full py-4 shadow-md 
            ${isMenuOpen ? "block" : "hidden"} md:static md:block md:w-auto md:py-0 md:shadow-none`}
        >
          <div className="text-xs flex flex-col items-center md:flex-row md:space-x-16">
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `nav-link ${isActive ? "font-bold" : ""} block py-2 px-4 md:inline-block`
              }
            >
              Explore
            </NavLink>
            <NavLink
              to="/exhibits"
              className={({ isActive }) =>
                `nav-link ${isActive ? "font-bold" : ""} block py-2 px-4 md:inline-block`
              }
            >
              Exhibits
            </NavLink>
            <NavLink
              to="/bidding"
              className={({ isActive }) =>
                `nav-link ${isActive ? "font-bold" : ""} block py-2 px-4 md:inline-block`
              }
            >
              Bidding
            </NavLink>
            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `nav-link ${isActive ? "font-bold" : ""} block py-2 px-4 md:inline-block`
              }
            >
              Marketplace
            </NavLink>
          </div>
        </nav>

        {/* Right Side Icons and Avatar */}
        <div className="flex items-center space-x-4">
          {/* Menu Icon (Mobile) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="h-5 w-5 text-black" />
          </button>
          {/* Search Icon and Sliding Search Bar (Responsive) */}
          <div className="relative flex items-center"> 
            <button
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="h-4 w-4 text-black" />
            </button>

            {/* Sliding Search Bar */}
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2
                flex items-center bg-white shadow-lg rounded-full overflow-hidden
                transition-all duration-300 ease-in-out border border-gray-200
                ${isSearchVisible ? "w-32 md:w-52 opacity-100" : "w-0 opacity-0"}
                `}
            >
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 px-4 border-0 outline-none text-[11px] bg-transparent"
              />
              <button
                onClick={() => setIsSearchVisible(false)}
                className="p-2"
              >
                <X className="h-4 w-4 text-gray-600 -ml-2" />
              </button>
            </div>
          </div>

          {/* Message Icon */}
          <button className="button-icon">
            <MessageCircle size={15} />
          </button>

          {/* Notification Icon */}
          <button className="button-icon">
            <Bell size={15} />
          </button>

          {/* Upgrade Button */}
          <Button
            size="sm"
            className="bg-red hover:bg-red/90 rounded-full px-4 text-xs text-red-600 border border-red-600"
          >
            Upgrade
          </Button>

          {/* User Avatar */}
          <div className="relative" ref={avatarRef}>
            <Avatar 
              className="h-8 w-8 border cursor-pointer" 
              onClick={toggleProfileDropdown}
            >
              <AvatarImage src="/lovable-uploads/f7ccfc1f-b21e-453e-b659-2f50e1cf5b01.png" alt="User" />
              <AvatarFallback>
                <img src="/pics/1.jpg" alt="JAI" />
              </AvatarFallback>
            </Avatar>
            <ProfileDropdown 
              isOpen={isProfileDropdownOpen} 
              onClose={() => setIsProfileDropdownOpen(false)} 
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
