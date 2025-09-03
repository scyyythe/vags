import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FloatingParticles } from "./FloatingParticles";
import { ArtworkInfoCard } from "./ArtworkInfoCard";
import useFetchPopularArtworks from "@/hooks/artworks/fetch_artworks/useFetchPopularArtworks";

type ShowcaseStage = "intro" | "transition" | "showcase" | "closing";

export const ArtworkShowcase = () => {
  const [stage, setStage] = useState<ShowcaseStage>("intro");
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [showNarration, setShowNarration] = useState(false);

  const { data: artworks = [], isLoading, error } = useFetchPopularArtworks();

  useEffect(() => {
    if (isLoading || artworks.length === 0) return;

    const timeline = [
      { stage: "intro" as ShowcaseStage, duration: 4000 },
      { stage: "transition" as ShowcaseStage, duration: 2000 },
      { stage: "showcase" as ShowcaseStage, duration: artworks.length * 5000 },
      { stage: "closing" as ShowcaseStage, duration: 5000 },
    ];

    let currentIndex = 0;

    const executeStage = () => {
      const currentStage = timeline[currentIndex];
      setStage(currentStage.stage);

      if (currentStage.stage === "intro") {
        setTimeout(() => setShowNarration(true), 1000);
      } else if (currentStage.stage === "closing") {
        setShowNarration(false);
      }

      setTimeout(() => {
        currentIndex++;
        if (currentIndex >= timeline.length) {
          currentIndex = 0;
          setCurrentArtworkIndex(0);
        }
        executeStage();
      }, currentStage.duration);
    };

    executeStage();
  }, [isLoading, artworks]);

  useEffect(() => {
    if (stage === "showcase" && artworks.length > 0) {
      const interval = setInterval(() => {
        setCurrentArtworkIndex((prev) => {
          const next = prev + 1;
          return next < artworks.length ? next : prev;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [stage, artworks]);

  if (isLoading || artworks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading popular artworks...</p>
      </div>
    );
  }

  const currentArtwork = artworks[currentArtworkIndex];

  return (
    <div className="min-h-screen relative overflow-hidden border">
      <FloatingParticles />

      {/* Intro Stage */}
      {/* ... keep intro, transition, showcase, closing as before */}
      {/* Just replace artwork.src → art.image_url?.[0], artwork.artist → art.artist.name, etc. */}

      {/* Example replacement in Showcase Stage Featured Artwork */}
      <AnimatePresence>
        {stage === "showcase" && currentArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Background Artworks */}
            <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8 opacity-20">
              {artworks.map((art, index) => (
                <motion.div
                  key={art.id}
                  animate={{
                    filter:
                      index === currentArtworkIndex ? "blur(0px)" : "blur(8px)",
                    scale: index === currentArtworkIndex ? 1.05 : 0.95,
                  }}
                  transition={{ duration: 0.8 }}
                  className="relative overflow-hidden rounded-2xl aspect-[4/3]"
                >
                  <img
                    src={art.image_url?.[0]}
                    alt={art.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>

            {/* Featured Artwork */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={currentArtwork.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative max-w-2xl max-h-[70vh] intense-glow"
                style={{ perspective: "1000px" }}
              >
                <div className="relative overflow-hidden rounded-3xl">
                  <img
                    src={currentArtwork.image_url?.[0]}
                    alt={currentArtwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>

            {/* Artwork Info Card */}
            <ArtworkInfoCard
            title={currentArtwork.title}
            artist={currentArtwork.artist.name}
            tagline={"Featured artwork of the week"} // fallback text
            isVisible={true}
            />

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
