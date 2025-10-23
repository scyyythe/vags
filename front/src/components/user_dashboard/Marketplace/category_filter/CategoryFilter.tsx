import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface CategoryFilterProps {
  categories: string[];
  onSelectCategory?: (category: string) => void;
}

const CategoryFilter = ({ categories, onSelectCategory }: CategoryFilterProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);

  // Translation hooks
  const { language } = useLanguage();
  const allText = useAutoTranslation("All", language);
  const trendingText = useAutoTranslation("Trending", language);
  const followingText = useAutoTranslation("Following", language);

  // Function to translate category names
  const translateCategory = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      All: allText,
      Trending: trendingText,
      Following: followingText,
    };
    return categoryMap[category] || category;
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (


    <div className="flex flex-row gap-2 pb-2 pt-3">
      {categories.map((category) => (
        <button
          key={category}
          className={`py-1 px-4 rounded-full text-[10px] font-small transition-colors ${
            selectedCategory === category
              ? "border border-gray-300 dark:border-gray-600 font-medium shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:shadow-white/20"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          }`}
          onClick={() => handleCategoryClick(category)}
        >
          {translateCategory(category)}
        </button>
      ))}
    </div>
  
  );
};

export default CategoryFilter;
