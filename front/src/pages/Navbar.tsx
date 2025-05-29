import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Register from './Register';
import Login from './Login';
import { useModal } from '../context/ModalContext'; 

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [showMenu, setShowMenu] = useState(false);
  const { showRegisterModal, setShowRegisterModal } = useModal(); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Spanish' },
    { code: 'FR', name: 'French' }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.language-dropdown') && !e.target.closest('.mobile-menu')) {
        setShowLanguages(false);
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguages, showMenu]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageSelect = (code) => {
    setSelectedLanguage(code);
    setShowLanguages(false);
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
          <img src="/pics/logo.png" alt="logo" className=" w-11 h-11 " />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-start text-xs space-x-20 -ml-16">
          <ScrollLink
            to="discover"
            spy={true}
            smooth={true}
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => setShowMenu(false)}
          > 
            Discover
          </ScrollLink>
          <ScrollLink
            to="artists"
            spy={true}
            smooth={true}
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => setShowMenu(false)}
          >
            Artists
          </ScrollLink>
          <ScrollLink
            to="artworks"
            spy={true}
            smooth={true}
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => setShowMenu(false)}
          >
            Artworks
          </ScrollLink>
          <ScrollLink
            to="auctions"
            spy={true}
            smooth={true}
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => setShowMenu(false)}
          >
            Auctions
          </ScrollLink>
          <ScrollLink
            to="bids"
            spy={true}
            smooth={true}
            offset={-70}
            duration={100}
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => setShowMenu(false)}
          >
            Hot Bids
          </ScrollLink>
        </nav>

        <div className="flex items-center space-x-8">
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              placeholder="Browse now"
              className="bg-gray-100 text-[10px] rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-artRed transition-all w-36 focus:w-48"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
          

          {/* Mobile Navigation Toggle and Language Dropdown */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu className="w-4 h-4 text-gray-500" />
            </button>

              <div className="md:hidden flex items-center justify-center">
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Browse now"
                    className="bg-gray-100 text-[11px] rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-artRed transition-all w-full"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

            <div className="relative language-dropdown">
              <button
                className="text-[11px] flex items-center space-x-1 hover:underline"
                onClick={() => setShowLanguages(!showLanguages)}
              >
                {selectedLanguage}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showLanguages ? 'rotate-180' : ''}`} />
              </button>

              {showLanguages && (
                <ul className="absolute bg-white shadow-md text-[11px] rounded-md py-2 w-24 top-full left-0 z-10">
                  {languages.map((lang) => (
                    <li
                      key={lang.code}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                        selectedLanguage === lang.code ? 'bg-gray-50 text-artRed' : ''
                      }`}
                      onClick={() => handleLanguageSelect(lang.code)}
                    >
                      {lang.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="animate-pulse bg-black text-white text-[11px] font-medium rounded-full px-5 py-2 transition-all hover:bg-gray-800 whitespace-nowrap"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="mobile-menu flex flex-col text-xs text-center gap-2 absolute bg-white shadow-md rounded-md p-4 w-48 top-full right-6 z-10">
            <ScrollLink
              to="discover"
              spy={true}
              smooth={true}
              offset={-70}
              duration={100}
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowMenu(false)}
            >
              Discover
            </ScrollLink>
            <ScrollLink
              to="artists"
              spy={true}
              smooth={true}
              offset={-70}
              duration={100}
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowMenu(false)}
            >
              Artists
            </ScrollLink>
            <ScrollLink
              to="artworks"
              spy={true}
              smooth={true}
              offset={-70}
              duration={100}
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowMenu(false)}
            >
              Artworks
            </ScrollLink>
            <ScrollLink
              to="auctions"
              spy={true}
              smooth={true}
              offset={-70}
              duration={100}
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowMenu(false)}
            >
              Auctions
            </ScrollLink>
            <ScrollLink
              to="bids"
              spy={true}
              smooth={true}
              offset={-70}
              duration={100}
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowMenu(false)}
            >
              Hot Bids
            </ScrollLink>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
