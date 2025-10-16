import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { Bell, MessageCircle, Search, X, Menu } from "lucide-react";
import SearchBar from "@/components/user_dashboard/local_components/SearchBar";
import { useState, useRef } from "react";
import ProfileDropdown from "../local_components/profile_dropdown/ProfileDropdown";
import ChatDropdown from "../local_components/chat/ChatDropdown";
import Notifications from "../local_components/notification/Notification";
import { getLoggedInUserId } from "@/auth/decode";
import useUserDetails from "@/hooks/users/useUserDetails";
import useArtworks from "@/hooks/artworks/fetch_artworks/useArtworks";
import { useChat } from "@/context/ChatContext";
import { useUserConversations } from "@/hooks/messages/useUserConversations";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLogout } from "@/hooks/auth/useLogout";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const notificationRef = useRef(null);
  const chatRef = useRef(null);
  const avatarRef = useRef(null);

  // Always call hooks first, before any early returns
  const userId = getLoggedInUserId();
  const { language } = useLanguage(); // Get current language
  const { logout } = useLogout();

  // These hooks should be called with safe fallbacks
  const { firstName, profilePicture } = useUserDetails(userId || "");
  const [currentPage] = useState(1);
  const { data: artworks } = useArtworks(currentPage, undefined, !!userId, "all", "public");

  const { isChatOpen, openChat, closeChat, participantId, participantName, participantAvatar } = useChat();
  const [conversations, , isLoadingConversations] = useUserConversations(userId || "");

  // Calculate total unread messages with safe fallback
  const totalUnreadMessages =
    isLoadingConversations || !conversations
      ? 0
      : conversations.reduce((total, conversation) => {
          return total + (conversation?.unreadCount || 0);
        }, 0);

  // Early return after all hooks have been called
  if (!userId || isLoggingOut) return null;

  const closeAllDropdowns = () => {
    setIsProfileDropdownOpen(false);
    setIsNotificationOpen(false);
    closeChat();
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
  };

  const handleSearchChange = (value: string) => {
    if (!value.trim()) return;

    const params = new URLSearchParams();
    params.set("q", value);

    const isExplorePage = currentPath.includes("/explore");
    const isBiddingPage = currentPath.includes("/bidding");
    const isExhibitPage = currentPath.includes("/exhibits");
    const isMarketplacePage = currentPath.includes("/marketplace");

    if (isExplorePage) navigate(`/explore?${params.toString()}`);
    else if (isBiddingPage) navigate(`/bidding?${params.toString()}`);
    else if (isExhibitPage) navigate(`/exhibits?${params.toString()}`);
    else if (isMarketplacePage) navigate(`/marketplace?${params.toString()}`);

    setSearchQuery(value);
  };

  // Nav links with translation
  const navLinks = [
    { route: "/explore", label: useAutoTranslation("Explore", language) },
    { route: "/exhibits", label: useAutoTranslation("Exhibits", language) },
    { route: "/auctions", label: useAutoTranslation("Auctions", language) },
    { route: "/marketplace", label: useAutoTranslation("Marketplace", language) },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-2 sm:px-4 flex items-center h-16 gap-2 sm:gap-4">
        {/* Left Section: Logo + Hamburger + Nav */}
        <div className="flex items-center gap-2 flex-grow md:flex-grow-0">
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
            {navLinks.map(({ route, label }) => (
              <NavLink key={route} to={route} className={({ isActive }) => `${isActive ? "font-semibold" : ""}`}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Section: Search + Chat + Notifications + Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
          {/* Desktop SearchBar */}
          <div className="hidden md:block w-[250px] border border-gray-400 rounded-full px-3">
            <SearchBar onSearchChange={handleSearchChange} />
          </div>

          {/* Mobile Search Icon */}
          <div className="block md:hidden relative top-0.5 right-1">
            <button
              className="button-icon hover:scale-110 transition"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title={useAutoTranslation("Search", language)}
            >
              <Search size={15} />
            </button>

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

          {/* Chat */}
          <div className="relative top-0.5" ref={chatRef}>
            <button
              className="button-icon hover:scale-110 transition"
              title={useAutoTranslation("Chat", language)}
              onClick={() => {
                if (isChatOpen) closeChat();
                else {
                  closeAllDropdowns();
                  openChat();
                }
              }}
            >
              <MessageCircle size={15} />
              {totalUnreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center font-medium min-w-[12px]">
                  {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -right-[94px] mt-3 z-50"
                >
                  <ChatDropdown
                    isOpen={isChatOpen}
                    onClose={closeChat}
                    participantId={participantId}
                    participantName={participantName}
                    participantAvatar={participantAvatar}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative top-0.5" ref={notificationRef}>
            <button
              className="button-icon hover:scale-110 transition"
              title={useAutoTranslation("Notifications", language)}
              onClick={() => {
                if (isNotificationOpen) setIsNotificationOpen(false);
                else {
                  closeAllDropdowns();
                  setIsNotificationOpen(true);
                }
              }}
            >
              <Bell size={15} />
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -right-[60px] mt-3 z-50"
                >
                  <Notifications isOpen={true} onClose={() => setIsNotificationOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Avatar + Dropdown */}
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
                if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
                else {
                  closeAllDropdowns();
                  setIsProfileDropdownOpen(true);
                }
              }}
              className="ml-1 z-10"
              aria-label={useAutoTranslation("Profile menu", language)}
            >
              <i className="bx bx-chevron-down text-xl"></i>
            </button>

            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-14 top-10 z-50"
                >
                  <ProfileDropdown
                    isOpen={true}
                    onClose={() => setIsProfileDropdownOpen(false)}
                    onLogout={handleLogout}
                  />
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
            {navLinks.map(({ route, label }) => (
              <NavLink
                key={route}
                to={route}
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
