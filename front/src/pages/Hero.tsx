import React from "react";
import { motion } from "framer-motion";
import useFetchPopularArtworks from "@/hooks/artworks/fetch_artworks/useFetchPopularArtworks";
import PopularArtworksSkeleton from "@/components/skeletons/artworks/PopularArtworksSkeleton";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";

const ArtworkCard = ({ artwork, index }: { artwork: any; index: number }) => {
  const { language } = useLanguage();
  const translatedTitle = useAutoTranslation(artwork.title, language);

  let initialY, animateY;
  if (index % 3 === 0) {
    initialY = 10;
    animateY = [30, 10, 30];
  } else if (index % 3 === 1) {
    initialY = -20;
    animateY = [-40, -20, -40];
  } else {
    initialY = 10;
    animateY = [30, 10, 30];
  }

  return (
    <motion.div
      className="artwork-card"
      initial={{ y: initialY }}
      animate={{ y: animateY }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <div className="relative w-full bg-white p-3 rounded-2xl overflow-hidden shadow-lg">
        <img
          src={Array.isArray(artwork.image_url) ? artwork.image_url[0] : artwork.image_url}
          alt={artwork.title}
          className="h-40 rounded-2xl"
        />
        <div className="p-2 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{translatedTitle}</p>
            <p className="text-xs text-gray-500">{artwork.artist.name}</p>
          </div>
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {artwork.artist.profile_picture ? (
              <img
                src={artwork.artist.profile_picture}
                alt={artwork.artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {artwork.artist.name
                  .split(' ')
                  .map(word => word.charAt(0))
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Hero = () => {
  const { data: artworksRaw, isLoading } = useFetchPopularArtworks();
  const artworks = artworksRaw?.slice(0, 3) ?? [];

  const { language } = useLanguage();

  // Top-level translations for static texts
  const discoverTitle = useAutoTranslation("Discover, Collect & Sell", language);
  const artworksTitle = useAutoTranslation("Artworks", language);
  const subtitle = useAutoTranslation("Step inside and let the art speak to you.", language);

  const products = useAutoTranslation("Products", language);
  const biddings = useAutoTranslation("Biddings", language);
  const exhibits = useAutoTranslation("Exhibits", language);
  const artists = useAutoTranslation("Artists", language);

  const productsCount = useAutoTranslation("30k+", language);
  const biddingsCount = useAutoTranslation("10k+", language);
  const exhibitsCount = useAutoTranslation("12k+", language);
  const artistsCount = useAutoTranslation("20k+", language);

  return (
    <section className="relative pt-24 px-6 pb-40 md:pb-0 md:px-12" id="discover">
      <div className="w-full max-w-[100%] md:max-w-[100%] lg:max-w-[100%] mx-auto pt-16">
        {/* Hero Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6" style={{ lineHeight: "1.3" }}>
            {discoverTitle}
            <br />
            {artworksTitle}
          </h1>
          <p className="text-black max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Background Gradient */}
        <motion.div
          className="relative mx-auto max-w-5xl aspect-[16/9] mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-red-300 via-red-200 to-red-400 rounded-full opacity-80 blur-2xl w-[63%] h-72"></div>

          {/* Black Card Container */}
          <div className="relative bg-black rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center top-32 md:-ml-[70px] w-full md:w-[115%] h-96">
            {/* Artwork Cards */}
            {isLoading ? (
              <PopularArtworksSkeleton />
            ) : (
              <div className="relative grid grid-cols-1 md:grid-cols-3 md:gap-16 w-[65%] md:w-[80%] top-10 md:-top-40">
                {artworks.map((artwork, index) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} index={index} />
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="relative bottom-72 md:bottom-14 flex justify-center space-x-12 md:space-x-48">
              <div className="text-center">
                <p className="text-lg md:text-3xl font-semibold text-white">{productsCount}</p>
                <p className="text-[10px] md:text-xs" style={{ color: "#8E8C8C" }}>
                  {products}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-3xl font-semibold text-white">{biddingsCount}</p>
                <p className="text-[10px] md:text-xs" style={{ color: "#8E8C8C" }}>
                  {biddings}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-3xl font-semibold text-white">{exhibitsCount}</p>
                <p className="text-[10px] md:text-xs" style={{ color: "#8E8C8C" }}>
                  {exhibits}
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg md:text-3xl font-semibold text-white">{artistsCount}</p>
                <p className="text-[10px] md:text-xs" style={{ color: "#8E8C8C" }}>
                  {artists}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
