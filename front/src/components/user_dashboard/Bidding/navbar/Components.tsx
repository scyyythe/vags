import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ArtCategorySelect from "@/components/user_dashboard/local_components/categories/ArtCategorySelect";

const Components = () => {
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-bold mr-6">Feed</h2>
          <div className="flex space-x-2">
           <ArtCategorySelect />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Browse now"
              className="pl-4 pr-4 py-2 border rounded-full text-xs"
            />
            <Search className="absolute right-3 top-2.5 w-3 h-3 text-gray-400" />
          </div>
          <Button variant="outline" size="sm" className="flex text-xs items-center rounded-full">
            <i className='bx bx-sort-alt-2 text-sm -mr-1'></i>
	        Sort
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Components;
