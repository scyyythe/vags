import { useState } from "react";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory: propSelectedCategory, onSelectCategory }: CategoryFilterProps) => {
  const { language } = useLanguage();
  const feedText = useAutoTranslation("Feed", language);
  const [selectedCategory, setSelectedCategory] = useState<string>(propSelectedCategory || categories[0]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <span className="font-bold mr-3 text-gray-900 dark:text-gray-100">{feedText}</span>
      {categories.map((category) => (
        <button
          key={category}
          className={`py-1 px-4 rounded-full text-[10px] font-small transition-colors ${
            selectedCategory === category
              ? "border border-gray-300 dark:border-gray-600 font-medium shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
          }`}
          onClick={() => handleCategoryClick(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
