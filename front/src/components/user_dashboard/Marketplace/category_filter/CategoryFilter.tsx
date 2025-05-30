import { useState } from "react";

interface CategoryFilterProps {
  categories: string[];
  onSelectCategory?: (category: string) => void;
}

const CategoryFilter = ({ categories, onSelectCategory }: CategoryFilterProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <div className="flex flex-col gap-4">
    <div>
      <span className="font-bold mr-3">Marketplace</span>
    </div>
    <div className="flex flex-wrap gap-2">
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
          {category}
        </button>
      ))}
    </div>
    </div>
  );
};

export default CategoryFilter;
