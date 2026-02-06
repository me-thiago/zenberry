import { ChevronDown, Filter, Grid, List } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { SortProductOption } from "@/src/types/sort-product-option";
import { SORT_PRODUCT_OPTIONS } from "@/src/data/sort-product-options";

interface ProductsHeaderProps {
  totalCount: number;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export function ProductsHeader({
  totalCount,
  isFilterOpen,
  setIsFilterOpen,
  viewMode,
  setViewMode,
}: ProductsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = useCallback(
    (sortBy: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (sortBy) {
        params.set("sortBy", sortBy);
      } else {
        params.delete("sortBy");
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const currentSortBy = useMemo(
    () => (searchParams.get("sortBy") as SortProductOption) || "featured",
    [searchParams]
  );

  const activeFilterCount = useMemo(
    () =>
      (searchParams.getAll("users").length || 0) +
      (searchParams.getAll("types").length || 0) +
      (searchParams.getAll("categories").length || 0) +
      (searchParams.getAll("formats").length || 0),
    [searchParams]
  );

  const handleToggleView = useCallback(
    (mode: "grid" | "list") => setViewMode(mode),
    [setViewMode]
  );

  return (
    <div className="flex justify-between items-center mb-3">
      <h1 className="text-3xl font-bold text-theme-accent-secondary mb-2 transition-colors duration-200">
        CBD Gummies ({totalCount})
      </h1>

      <div className="flex items-center justify-end gap-3 mb-6">
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="gap-2 bg-theme-bg-secondary hover:text-secondary"
        >
          <Filter className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 rounded-full bg-theme-accent-primary">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            id="sort-select"
            value={currentSortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="appearance-none bg-theme-bg-secondary border border-theme-text-secondary/20 rounded-lg px-4 py-2 pr-10 text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent-secondary cursor-pointer transition-colors duration-200"
            aria-label="Sort products"
          >
            {SORT_PRODUCT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text-secondary pointer-events-none" />
        </div>
        {/* View Mode Toggle */}
        <div className="hidden md:flex items-center gap-1 border border-theme-text-secondary/20 rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleToggleView("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleToggleView("list")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
