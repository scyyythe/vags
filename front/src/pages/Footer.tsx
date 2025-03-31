import React from 'react';
import { Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10 px-4 md:px-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="mb-8 lg:mb-0 md:col-span-1 px-5">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/pics/logo.png" alt="logo" className="w-12 h-12 mb-2" />
              <span className="font-semibold text-2lg">orxist</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-3 flex flex-direction-row px-5 space-x-4 md:space-x-25 relative md:left-[120px]">
            <div className="space-y-4 w-full md:w-1/3">
              <h3 className="font-semibold text-2lg">Marketplace</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Art</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Music</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Virtual World</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Collectibles</a></li>
              </ul>
            </div>
            
            <div className="space-y-4 w-full md:w-1/3">
              <h3 className="font-semibold text-2lg">Resources</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Partners</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Suggestions</a></li>
              </ul>
            </div>
            
            <div className="space-y-4 w-full md:w-1/3">
              <h3 className="font-semibold text-2lg">Community</h3>
              <ul className="space-y-1">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Forum</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Blog</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 px-5 text-xs text-gray-500 text-left">
          <p>Copyright &copy;2023. Created with love by Stark.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
