import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useModal } from "../context/ModalContext";
import { useAutoTranslation } from "../hooks/autoTranslate/useAutoTranslation";
import { languages } from "../components/constants/languages";
import { useLanguage } from "@/context/LanguageContext";

const LanguageOption = ({ lang, selectedLanguage, onSelect }) => {
  return (
    <li
      key={lang.code}
      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
        selectedLanguage === lang.code ? "bg-gray-50 text-artRed" : ""
      }`}
      onClick={() => onSelect(lang.code)}
    >
      {lang.name} {/* shows native name */}
    </li>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { setShowRegisterModal } = useModal();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the Index page (landing page)
  const isIndexPage = location.pathname === "/";

  // Debug: Log current location and search status
  useEffect(() => {
    console.log("Current pathname:", location.pathname);
    console.log("Is Index page:", isIndexPage);
  }, [location.pathname, isIndexPage]);

  // Use LanguageContext
  const { language: selectedLanguage, setLanguage } = useLanguage();

  // Translatable navbar texts
  const discover = useAutoTranslation("Discover", selectedLanguage);
  const artists = useAutoTranslation("Artists", selectedLanguage);
  const artworks = useAutoTranslation("Artworks", selectedLanguage);
  const auctions = useAutoTranslation("Auctions", selectedLanguage);
  const hotBids = useAutoTranslation("Top Bids", selectedLanguage);
  const browseNow = useAutoTranslation("Browse now", selectedLanguage);
  const signUp = useAutoTranslation("Sign Up", selectedLanguage);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".language-dropdown") && !e.target.closest(".mobile-menu")) {
        setShowLanguages(false);
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Clear search query when navigating away from Index page
  useEffect(() => {
    if (!isIndexPage) {
      setSearchQuery("");
    }
  }, [isIndexPage]);

  const handleLanguageSelect = (code) => {
    setLanguage(code); // update global context
    setShowLanguages(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Only allow search functionality on Index page
    if (isIndexPage && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      // Map search terms to section IDs
      const searchMappings = {
        discover: "discover",
        explore: "discover",
        artists: "artists",
        artist: "artists",
        artworks: "artworks",
        artwork: "artworks",
        auctions: "auctions",
        auction: "auctions",
        bids: "bids",
        bid: "bids",
        "hot bids": "bids",
        "top bids": "bids",
      };

      // Find matching section
      const matchedSection = Object.keys(searchMappings).find((key) => query.includes(key));

      if (matchedSection) {
        // Scroll to the matched section
        const sectionId = searchMappings[matchedSection];
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } else {
        // Default to discover section if no match found
        const discoverElement = document.getElementById("discover");
        if (discoverElement) {
          discoverElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }

      setSearchQuery("");
    }
  };

  const handleSearchChange = (e) => {
    // Only allow search input changes on Index page
    if (isIndexPage) {
      setSearchQuery(e.target.value);
    }
  };

  const handleKeyPress = (e) => {
    // Only allow search on Index page
    if (isIndexPage && e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 py-4",
        scrolled ? "bg-white bg-opacity-90 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/pics/wx.png" alt="logo" className="w-10 h-7" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-start text-xs space-x-20 -ml-16">
          <ScrollLink
            to="discover"
            spy
            smooth
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
          >
            {discover}
          </ScrollLink>
          <ScrollLink
            to="artists"
            spy
            smooth
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
          >
            {artists}
          </ScrollLink>
          <ScrollLink
            to="artworks"
            spy
            smooth
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
          >
            {artworks}
          </ScrollLink>
          <ScrollLink
            to="auctions"
            spy
            smooth
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
          >
            {auctions}
          </ScrollLink>
          <ScrollLink
            to="bids"
            spy
            smooth
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
          >
            {hotBids}
          </ScrollLink>
        </nav>

        <div className="flex items-center space-x-8">
          {/* Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:flex items-center">
            <input
              type="text"
              placeholder={isIndexPage ? browseNow : "Search not available"}
              value={isIndexPage ? searchQuery : ""}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              disabled={!isIndexPage}
              className={`bg-gray-100 text-[10px] rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-artRed transition-all w-36 focus:w-48 ${
                !isIndexPage ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            <button
              type="submit"
              disabled={!isIndexPage}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                !isIndexPage ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <Search
                className={`w-4 h-4 text-gray-500 transition-colors ${
                  isIndexPage ? "hover:text-artRed" : "opacity-50"
                }`}
              />
            </button>
          </form>

          {/* Mobile Navigation Toggle + Search + Language */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Toggle menu"
            >
              {showMenu ? <X className="w-4 h-4 text-gray-500" /> : <Menu className="w-4 h-4 text-gray-500" />}
            </button>

            {/* Mobile Search */}
            <div className="md:hidden flex items-center justify-center">
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder={isIndexPage ? browseNow : "Search not available"}
                  value={isIndexPage ? searchQuery : ""}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  disabled={!isIndexPage}
                  className={`bg-gray-100 text-[11px] rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-artRed transition-all w-full ${
                    !isIndexPage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <button
                  type="submit"
                  disabled={!isIndexPage}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    !isIndexPage ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <Search
                    className={`w-4 h-4 text-gray-500 transition-colors ${
                      isIndexPage ? "hover:text-artRed" : "opacity-50"
                    }`}
                  />
                </button>
              </form>
            </div>

            {/* Language Dropdown */}
            <div className="relative language-dropdown">
              <button
                className="text-[11px] flex items-center space-x-1 hover:underline"
                onClick={() => setShowLanguages(!showLanguages)}
              >
                {selectedLanguage}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showLanguages ? "rotate-180" : ""}`} />
              </button>
              {showLanguages && (
                <ul className="absolute bg-white shadow-md text-[11px] rounded-md py-2 w-28 top-5 left-[-35px] z-10 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                  {languages.map((lang) => (
                    <LanguageOption
                      key={lang.code}
                      lang={lang}
                      selectedLanguage={selectedLanguage}
                      onSelect={handleLanguageSelect}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={() => setShowRegisterModal(true)}
            className="animate-pulse bg-black text-white text-[11px] font-medium rounded-full px-5 py-2 transition-all hover:bg-gray-800 whitespace-nowrap"
          >
            {signUp}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white backdrop-blur-md shadow-sm px-4 py-4 space-y-3 absolute top-full left-0 right-0 z-10"
            >
              <ScrollLink
                to="discover"
                spy
                smooth
                offset={-70}
                duration={100}
                className="block text-center text-xs py-2 rounded cursor-pointer hover:text-primary transition-colors"
                onClick={() => setShowMenu(false)}
              >
                {discover}
              </ScrollLink>
              <ScrollLink
                to="artists"
                spy
                smooth
                offset={-70}
                duration={100}
                className="block text-center text-xs py-2 rounded cursor-pointer hover:text-primary transition-colors"
                onClick={() => setShowMenu(false)}
              >
                {artists}
              </ScrollLink>
              <ScrollLink
                to="artworks"
                spy
                smooth
                offset={-70}
                duration={100}
                className="block text-center text-xs py-2 rounded cursor-pointer hover:text-primary transition-colors"
                onClick={() => setShowMenu(false)}
              >
                {artworks}
              </ScrollLink>
              <ScrollLink
                to="auctions"
                spy
                smooth
                offset={-70}
                duration={100}
                className="block text-center text-xs py-2 rounded cursor-pointer hover:text-primary transition-colors"
                onClick={() => setShowMenu(false)}
              >
                {auctions}
              </ScrollLink>
              <ScrollLink
                to="bids"
                spy
                smooth
                offset={-70}
                duration={100}
                className="block text-center text-xs py-2 rounded cursor-pointer hover:text-primary transition-colors"
                onClick={() => setShowMenu(false)}
              >
                {hotBids}
              </ScrollLink>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
