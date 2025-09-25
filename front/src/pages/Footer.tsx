import React from "react";
import { Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const Footer = () => {
  const { language } = useLanguage();

  // Auto-translated texts
  const tDescription = useAutoTranslation(
    "Discover, collect, and trade extraordinary digital artworks from talented creators worldwide. Join the future of digital art.",
    language
  );

  const tMarketplace = useAutoTranslation("Marketplace", language);
  const tArt = useAutoTranslation("Art", language);
  const tMusic = useAutoTranslation("Music", language);
  const tVirtualWorld = useAutoTranslation("Virtual World", language);
  const tCollectibles = useAutoTranslation("Collectibles", language);

  const tResources = useAutoTranslation("Resources", language);
  const tHelpCenter = useAutoTranslation("Help Center", language);
  const tPartners = useAutoTranslation("Partners", language);
  const tSuggestions = useAutoTranslation("Suggestions", language);

  const tCommunity = useAutoTranslation("Community", language);
  const tDocumentation = useAutoTranslation("Documentation", language);
  const tForum = useAutoTranslation("Forum", language);
  const tBlog = useAutoTranslation("Blog", language);

  const tCopyright = useAutoTranslation(
    "Copyright ©2025. Created by",
    language
  );

  return (
    <footer className="w-full max-w-7xl mx-auto bg-black text-white py-10 px-4 md:px-10">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Logo + description */}
          <div className="mb-8 lg:mb-0 md:col-span-1 px-5">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/pics/logo.png" alt="logo" className="w-12 h-12 mb-2" />
              {/* Do NOT translate brand name */}
              <span className="font-semibold text-2lg">orxist</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">{tDescription}</p>
            <div className="flex space-x-5">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation sections */}
          <div className="md:col-span-3 flex flex-direction-row px-5 space-x-4 md:space-x-25 relative md:left-[120px]">
            {/* Marketplace */}
            <div className="space-y-4 w-full md:w-1/3">
              <h3 className="font-semibold text-2lg">{tMarketplace}</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tArt}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tMusic}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tVirtualWorld}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tCollectibles}
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4 w-full md:w-1/3">
              <h3 className="font-semibold text-2lg">{tResources}</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tHelpCenter}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tPartners}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tSuggestions}
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div className="space-y-4 w-full md:w-1/3">
              <h3 className="font-semibold text-2lg">{tCommunity}</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tDocumentation}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tForum}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    {tBlog}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 px-5 text-xs text-gray-500 text-left">
          <p>
            {tCopyright} <span className="font-semibold">Worxist</span>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
