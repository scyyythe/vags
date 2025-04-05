import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        <Link to="/hero" className="flex items-center space-x-2">
          <img src="/pics/logo.png" alt="logo" className=" w-11 h-11 " />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-20">
          <Link to="/discover" className="text-sm font-medium hover:text-artRed transition-colors">
            Discover
          </Link>
          <Link to="/marketplace" className="text-sm font-medium hover:text-artRed transition-colors">
            Marketplace
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium hover:text-artRed transition-colors">
            How It Works
          </Link>
          <Link to="/collection" className="text-sm font-medium hover:text-artRed transition-colors">
            Collection
          </Link>
        </nav>

        <div className="flex items-center space-x-8">
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              placeholder="Browse now"
              className="bg-gray-100 text-xs rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-artRed transition-all w-36 focus:w-48"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* Mobile Navigation Toggle and Language Dropdown */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu className="w-4 h-4 text-gray-500" />
            </button>

            <div className="relative language-dropdown">
              <button
                className="text-xs flex items-center space-x-1 hover:underline"
                onClick={() => setShowLanguages(!showLanguages)}
              >
                {selectedLanguage}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showLanguages ? 'rotate-180' : ''}`} />
              </button>

              {showLanguages && (
                <ul className="absolute bg-white shadow-md text-xs rounded-md py-2 w-24 top-full left-0 z-10">
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
            className="animate-pulse bg-black text-white text-xs font-medium rounded-full px-5 py-2 transition-all hover:bg-gray-800"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="mobile-menu text-xs absolute bg-white shadow-md rounded-md py-4 w-48 top-full right-0 z-10">
            <ul>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <Link to="/discover">Discover</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <Link to="/marketplace">Marketplace</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <Link to="/how-it-works">How It Works</Link>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <Link to="/collection">Collection</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
