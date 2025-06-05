import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, NavLink } from "react-router-dom";
import Logo from "./Logo";
import { Bell, MessageCircle, Search, X, Menu } from "lucide-react";
import SearchBar from "@/components/user_dashboard/local_components/SearchBar";
import { useState, useRef, useMemo } from "react";
import ProfileDropdown from "../local_components/profile_dropdown/ProfileDropdown";
import ChatDropdown from "../local_components/chat/ChatDropdown";
import Notifications from "../local_components/notification/Notification";
import { getLoggedInUserId } from "@/auth/decode";
import useUserDetails from "@/hooks/users/useUserDetails";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import { useNavigate, useSearchParams } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage] = useState(1);
  const { data: artworks, isLoading, error } = useArtworks(currentPage, undefined, true, "all", "public");
  const navigate = useNavigate();

  const handleSearchChange = (value: string) => {
    if (!value.trim()) return;

    const params = new URLSearchParams();
    params.set("q", value);

    const isExplorePage = currentPath.includes("/explore");
    const isBiddingPage = currentPath.includes("/bidding");
    const isExhibitPage = currentPath.includes("/exhibits");
    const isMarketplacePage = currentPath.includes("/exhibits");
    if (isExplorePage) {
      navigate(`/explore?${params.toString()}`);
    } else if (isBiddingPage) {
      navigate(`/bidding?${params.toString()}`);
    } else if (isExhibitPage) {
      navigate(`/exhibit?${params.toString()}`);
    } else if (isMarketplacePage) {
      navigate(`/marketplace?${params.toString()}`);
    }

    setSearchQuery(value);
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const avatarRef = useRef(null);

  const userId = getLoggedInUserId();
  const { firstName, profilePicture } = useUserDetails(userId);
  if (!userId) {
    return <p>No user found</p>;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-2 sm:px-4 flex items-center h-16 gap-2 sm:gap-4">
        {/* Left Section: Logo + Hamburger + Nav */}
        <div className="flex items-center gap-2 flex-grow md:flex-grow-0">
          {/* Logo */}
          <div className="flex items-center gap-2 pl-2 sm:pl-0">
            <Logo />

            {/* Hamburger Menu (mobile only) */}
            <div className="md:hidden ml-2 mt-1">
              <button aria-label="Toggle menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={15} /> : <Menu size={15} />}
              </button>
            </div>
          </div>

          {/* Nav Links (desktop only) */}
          <nav className="hidden md:flex items-center space-x-16 text-xs ml-16">
            {["Explore", "Exhibits", "Bidding", "Marketplace"].map((label) => (
              <NavLink
                key={label}
                to={`/${label.toLowerCase()}`}
                className={({ isActive }) => `${isActive ? "font-semibold" : ""}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Searchbar + Icons + Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
          {/* SearchBar for large screens */}
          <div className="hidden md:block w-[250px] border border-gray-400 rounded-full px-3">
            <SearchBar onSearchChange={handleSearchChange} />
          </div>

          {/* Search Icon for small screens */}
          <div className="block md:hidden relative top-0.5 right-1 ">
            <button
              className="button-icon hover:scale-110 transition"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Search"
            >
              <Search size={15} />
            </button>

            {/* Dropdown with SearchBar */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-10 right-0 z-50 bg-white border border-gray-300 rounded-full shadow-md w-60 px-3"
                >
                  <SearchBar onSearchChange={handleSearchChange} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative top-0.5" ref={chatRef}>
            <button
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                setIsNotificationOpen(false);
                setIsProfileDropdownOpen(false);
              }}
              className="button-icon hover:scale-110 transition"
              title="ChatDropdown"
            >
              <MessageCircle size={15} />
            </button>

            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -right-[119px] mt-4 z-50"
                >
                  <ChatDropdown isOpen={true} onClose={() => setIsChatOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat Dropdown */}
          <div className="relative top-0.5" ref={notificationRef}>
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setIsChatOpen(false);
                setIsProfileDropdownOpen(false);
              }}
              className="button-icon hover:scale-110 transition"
              title="Notifications"
            >
              <Bell size={15} />
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -right-[90px] mt-4 z-50"
                >
                  <Notifications isOpen={true} onClose={() => setIsNotificationOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Top up */}
          <button className="text-[10px] pt-0.5 hover:scale-110 transition">
            <i className="bx bx-wallet-alt text-[16px]"></i>
          </button>

          {/* Profile Avatar + Chevron */}
          <div className="relative flex items-center" ref={avatarRef}>
            <Link to={`/userprofile/${userId}`}>
              <div className="h-7 w-7 rounded-full overflow-hidden border cursor-pointer flex items-center justify-center bg-gray-300">
                {profilePicture ? (
                  <img src={profilePicture} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-black">{firstName?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </Link>
            <button
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsChatOpen(false);
                setIsNotificationOpen(false);
              }}
              className="ml-1 z-10"
              aria-label="Profile menu"
            >
              {/* Chevron icon always visible */}
              <i className="bx bx-chevron-down text-xl"></i>
            </button>

            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-16 top-10 z-50"
                >
                  <ProfileDropdown isOpen={true} onClose={() => setIsProfileDropdownOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white shadow px-4 py-4 space-y-3"
          >
            {["Explore", "Exhibits", "Bidding", "Marketplace"].map((label) => (
              <NavLink
                key={label}
                to={`/${label.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-center text-xs py-2 rounded ${isActive ? "font-semibold text-black" : "text-gray-700"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
