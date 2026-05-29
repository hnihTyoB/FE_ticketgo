import type { Category } from "@/constants/types/types";
import { useNavigate } from "react-router-dom";

type CategoryFilterBarProps = {
  data: Category[];
};

const CategoryFilterBar = ({ data }: CategoryFilterBarProps) => {
  const navigate = useNavigate();

  const handleCategoryClick = (title: string, catId?: string) => {
    navigate(`/search?category=${catId ? encodeURIComponent(catId) : ""}`);
  };

  return (
    <div className="bg-black">
      <div className="mx-10 lg:mx-auto max-w-[1200px] flex items-center gap-8 text-white">
        {data.map((da) => (
          <button
            key={da.id}
            onClick={() => handleCategoryClick(da.label, da.id)}
            className="font-medium py-6 text-white hover:text-[#2dc275] transition-colors"
          >
            {da.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilterBar;
