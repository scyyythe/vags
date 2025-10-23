import React from "react";
import { motion } from "framer-motion";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";
import { useModal } from "@/context/ModalContext";
import { UserPlus, Search, Gavel, CheckCircle, ArrowRight } from "lucide-react";

const HowItWorksSection = () => {
  const { language } = useLanguage();
  const { setShowRegisterModal } = useModal();

  // Translations
  const howItWorksLabel = useAutoTranslation("How It Works", language);
  const howItWorksTitle = useAutoTranslation("Get Started in", language);
  const howItWorksSubtitle = useAutoTranslation("5 Simple Steps", language);
  const howItWorksDescription = useAutoTranslation("Join our platform and start your digital art journey today. It's easy, secure, and takes just a few minutes.", language);
  const getStarted = useAutoTranslation("Get Started Now", language);

  const steps = [
    {
      icon: UserPlus,
      title: useAutoTranslation("Create Account", language),
      description: useAutoTranslation("Sign up for free and verify your email address to get started.", language),
      details: [
        useAutoTranslation("Sign up with email", language),
        useAutoTranslation("Verify your account", language),
        useAutoTranslation("Complete your profile", language)
      ],
      number: "01"
    },
    {
      icon: Search,
      title: useAutoTranslation("Explore & Discover", language),
      description: useAutoTranslation("Browse artworks, follow artists, and discover trending content in our Explore section.", language),
      details: [
        useAutoTranslation("Browse all artworks", language),
        useAutoTranslation("Follow favorite artists", language),
        useAutoTranslation("View trending content", language)
      ],
      number: "02"
    },
    {
      icon: CheckCircle,
      title: useAutoTranslation("Exhibit & Share", language),
      description: useAutoTranslation("Create virtual exhibits, collaborate with other artists, and showcase your work.", language),
      details: [
        useAutoTranslation("Create 3D exhibits", language),
        useAutoTranslation("Collaborate with artists", language),
        useAutoTranslation("Share your gallery", language)
      ],
      number: "03"
    },
    {
      icon: Gavel,
      title: useAutoTranslation("Auction & Bid", language),
      description: useAutoTranslation("Participate in live auctions, place bids, and compete for exclusive artworks.", language),
      details: [
        useAutoTranslation("View posted auctions", language),
        useAutoTranslation("Place competitive bids", language),
        useAutoTranslation("Win exclusive artworks", language)
      ],
      number: "04"
    },
    {
      icon: UserPlus,
      title: useAutoTranslation("Create & Sell", language),
      description: useAutoTranslation("Upload your artwork, set prices, and sell directly through our marketplace.", language),
      details: [
        useAutoTranslation("Upload artwork", language),
        useAutoTranslation("Set pricing", language),
        useAutoTranslation("List for sale", language)
      ],
      number: "05"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-16 px-6 md:px-12 bg-gray-50 dark:bg-gray-800" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-3xl sm:text-3xl font-bold text-black dark:text-white mb-6">
            {howItWorksTitle}
            <br />
            <span className="text-red-800">{howItWorksSubtitle}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm">
            {howItWorksDescription}
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={item}
              className="relative"
            >
              {/* Step Card */}
              <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>

                {/* Icon */}
                {/* <div className="w-6 h-6 flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-red-600" />
                </div> */}

                {/* Content */}
                <h3 className="text-lg font-bold text-black dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-[13px]">{step.description}</p>

                {/* Details */}
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-3"></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow (except for last step) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* <div className="bg-red-800 rounded-3xl p-12 text-white">
            <h3 className="text-lg font-bold mb-4">
              {useAutoTranslation("Ready to Get Started?", language)}
            </h3>
            <p className="text-xs text-red-100 mb-8 max-w-2xl mx-auto">
              {useAutoTranslation("Join thousands of users who are already buying and selling digital art on our platform.", language)}
            </p> */}
            <button
              onClick={() => setShowRegisterModal(true)}
              className="group bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-xs transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-2 mx-auto"
            >
              <span>{getStarted}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          {/* </div> */}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
