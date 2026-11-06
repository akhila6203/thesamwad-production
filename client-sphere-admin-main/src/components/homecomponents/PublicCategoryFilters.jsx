import { formatClassDisplay } from "@/utils/classDisplay";

export default function PublicCategoryFilters({
  categories,
  subCategories = [],
  activeCategory,
  activeSubCategory,
  onCategoryChange,
  onSubCategoryChange,
}) {
  const showSubCategories =
    activeCategory !== "All" &&
    subCategories.length > 0 &&
    typeof onSubCategoryChange === "function";

  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto border-b pb-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoryChange(c)}
            className={`pb-2 whitespace-nowrap text-sm ${
              activeCategory === c
                ? "border-b-2 border-[#2879B5] text-foreground font-medium"
                
                : "text-muted-foreground"
            }`}
          >
            {c === "All" ? c : formatClassDisplay(c)}
          </button>
        ))}
      </div>

      {/* {showSubCategories && (
        <div className="flex gap-2 flex-wrap">
          {subCategories.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => onSubCategoryChange(sub)}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                activeSubCategory === sub
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )} */}
      
{showSubCategories && (
  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
    {subCategories.map((sub) => (
      <button
        key={sub}
        type="button"
        onClick={() => onSubCategoryChange(sub)}
        className={`w-auto whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium border transition ${
          activeSubCategory === sub
            ? "bg-[#2879B5] text-white border-[#c4c0c0]"
            : "bg-white dark:bg-card text-gray-600 dark:text-slate-200 border-gray-200 dark:border-border hover:border-[#b3d1e8]"
        }`}
      >
        {sub}
      </button>
    ))}
  </div>
)}

    </div>
  );
}
