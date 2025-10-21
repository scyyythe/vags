import React from "react";
import { motion } from "framer-motion";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";
import { useModal } from "@/context/ModalContext";
import { 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  Lock, 
  Smartphone, 
  Award, 
  Headphones,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const FeaturesSection = () => {
  const { language } = useLanguage();
  const { setShowRegisterModal } = useModal();

  // Translations
  const featuresLabel = useAutoTranslation("Features", language);
  const featuresTitle = useAutoTranslation("Why Choose", language);
  const featuresSubtitle = useAutoTranslation("Our Platform", language);
  const featuresDescription = useAutoTranslation("We provide everything you need to buy, sell, and trade digital art with confidence and ease.", language);
  const exploreFeatures = useAutoTranslation("Explore All Features", language);

  const mainFeatures = [
    {
      icon: Shield,
      title: useAutoTranslation("Secure Transactions", language),
      description: useAutoTranslation("All transactions are protected by blockchain technology and advanced encryption.", language),
      benefits: [
        useAutoTranslation("Blockchain security", language),
        useAutoTranslation("Encrypted payments", language),
        useAutoTranslation("Fraud protection", language)
      ]
    },
    {
      icon: Zap,
      title: useAutoTranslation("Lightning Fast", language),
      description: useAutoTranslation("Experience instant transactions and real-time updates across all features.", language),
      benefits: [
        useAutoTranslation("Instant processing", language),
        useAutoTranslation("Real-time updates", language),
        useAutoTranslation("Low latency", language)
      ]
    },
    {
      icon: Users,
      title: useAutoTranslation("Global Community", language),
      description: useAutoTranslation("Connect with artists and collectors from around the world in our vibrant community.", language),
      benefits: [
        useAutoTranslation("150+ countries", language),
        useAutoTranslation("Active community", language),
        useAutoTranslation("Cultural diversity", language)
      ]
    },
    {
      icon: Globe,
      title: useAutoTranslation("24/7 Availability", language),
      description: useAutoTranslation("Access our platform anytime, anywhere with our always-on infrastructure.", language),
      benefits: [
        useAutoTranslation("Always online", language),
        useAutoTranslation("Global access", language),
        useAutoTranslation("No downtime", language)
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Lock,
      title: useAutoTranslation("Wallet Integration", language),
      description: useAutoTranslation("Connect your existing wallet or create a new one seamlessly.", language)
    },
    {
      icon: Smartphone,
      title: useAutoTranslation("Mobile Optimized", language),
      description: useAutoTranslation("Full-featured mobile experience with native app performance.", language)
    },
    {
      icon: Award,
      title: useAutoTranslation("Quality Assurance", language),
      description: useAutoTranslation("All artworks are verified and curated by our expert team.", language)
    },
    {
      icon: Headphones,
      title: useAutoTranslation("24/7 Support", language),
      description: useAutoTranslation("Get help whenever you need it with our dedicated support team.", language)
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-white" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">
            {featuresTitle}
            <br />
            <span className="text-red-800">{featuresSubtitle}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs">
            {featuresDescription}
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 mb-20"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                {/* <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-8 h-8 text-red-600" />
                </div> */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 text-[13px]">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-xs text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features */}
        {/* <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-bold text-center text-black mb-12">
            {useAutoTranslation("More Features", language)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-gray-600" />
                </div>
                <h4 className="text-lg font-semibold text-black mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div> */}

        {/* CTA Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => setShowRegisterModal(true)}
            className="group bg-red-800 text-white text-sm px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-2 mx-auto"
          >
            <span>{exploreFeatures}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
