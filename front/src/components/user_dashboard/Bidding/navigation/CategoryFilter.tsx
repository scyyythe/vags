import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface CategoryFilterProps {
  categories: string[];
  onSelectCategory?: (category: string) => void;
}

const CategoryFilter = ({ categories, onSelectCategory }: CategoryFilterProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const { language } = useLanguage();

  // Translation hooks
  const feedText = useAutoTranslation("Feed", language);
  const allText = useAutoTranslation("All", language);
  const trendingText = useAutoTranslation("Trending", language);
  const followingText = useAutoTranslation("Following", language);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  // Map category to translated text
  const getCategoryTranslation = (category: string) => {
    switch (category) {
      case "All":
        return allText;
      case "Trending":
        return trendingText;
      case "Following":
        return followingText;
      default:
        return category;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <span className="font-bold mr-3">{feedText}</span>
      {categories.map((category) => (
        <button
          key={category}
          className={`py-1 px-4 rounded-full text-[10px] font-small transition-colors ${
            selectedCategory === category
              ? "border border-gray-300 font-medium shadow-md"
              : "bg-white border border-gray-200 hover:bg-gray-100"
          }`}
          onClick={() => handleCategoryClick(category)}
        >
          {getCategoryTranslation(category)}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
