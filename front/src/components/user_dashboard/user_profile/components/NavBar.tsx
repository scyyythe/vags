import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface CategoryFilterProps {
  categories: string[];
  onSelectCategory?: (category: string) => void;
}

const NavBar = ({ categories, onSelectCategory }: CategoryFilterProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);

  // Language and translation
  const { language } = useLanguage();

  // Helper component to translate category names
  const TranslatedCategory: React.FC<{ categoryName: string }> = ({ categoryName }) => {
    const translatedCategory = useAutoTranslation(categoryName, language);
    return <>{translatedCategory}</>;
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          className={`py-1.5 px-4 rounded-full text-[11px] font-small transition-colors ${
            selectedCategory === category 
              ? "border border-gray-300 font-semibold shadow-lg" 
              : "bg-white border border-gray-200 hover:bg-gray-100"
          }`}
          onClick={() => handleCategoryClick(category)}
        >
          <TranslatedCategory categoryName={category} />
        </button>
      ))}
    </div>
  );
};

export default NavBar;