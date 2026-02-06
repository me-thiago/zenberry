"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import {
  ProductCBDType,
  ProductCategoryType,
  ProductFormatType,
  ProductUser,
} from "@/src/types/product";
import { FilterSection } from "../filter/filter-section";

const USER_OPTIONS: ProductUser[] = ["Myself/Loved Ones", "Pets"];

const TYPE_OPTIONS: ProductCBDType[] = [
  "Full Spectrum Organic",
  "Broad Spectrum",
  "CBD Isolate (THC-Free)",
  "Full Spectrum Organic (Non-Decarbed)",
  "Full Spectrum",
];

const CATEGORY_OPTIONS: ProductCategoryType[] = [
  "Daily Balance",
  "Daily Wellness",
  "Relaxation",
  "Science Wellness",
  "Sleep Support",
  "Social & Mood",
  "Pet Care",
  "Beauty & Skincare",
  "Pain & Recovery",
];

const FORMAT_OPTIONS: ProductFormatType[] = [
  "Tincture",
  "CBD Gummies",
  "Treats",
  "Softgels",
  "Serum",
  "Lotion",
  "Cream",
  "Cooling Gel",
];

interface ProductsFilterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductsFilter({ isOpen, onClose }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [expandedSections, setExpandedSections] = useState({
    user: true,
    type: true,
    category: true,
    format: true,
  });

  const users = useMemo(() => searchParams.getAll("users"), [searchParams]);
  const types = useMemo(() => searchParams.getAll("types"), [searchParams]);
  const categories = useMemo(
    () => searchParams.getAll("categories"),
    [searchParams]
  );
  const formats = useMemo(() => searchParams.getAll("formats"), [searchParams]);

  const hasActiveFilters = useMemo(
    () =>
      users.length > 0 ||
      types.length > 0 ||
      categories.length > 0 ||
      formats.length > 0,
    [users.length, types.length, categories.length, formats.length]
  );

  const toggleSection = useCallback(
    (section: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    },
    []
  );

  const updateFilter = useCallback(
    (type: string, value: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = params.getAll(type);

      params.delete(type);

      if (checked) {
        [...currentValues, value].forEach((v) => params.append(type, v));
      } else {
        currentValues
          .filter((v) => v !== value)
          .forEach((v) => params.append(type, v));
      }

      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  const clearAllFilters = useCallback(() => {
    router.push("/products");
  }, [router]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 bg-theme-bg-primary border-r border-theme-text-secondary/10 z-50 lg:z-40 overflow-y-auto transition-colors duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-theme-text-primary transition-colors duration-200">
              Filters
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={clearAllFilters}
              className="w-full mb-4 text-white"
            >
              Clear All Filters
            </Button>
          )}

          <Separator className="mb-6 bg-theme-text-secondary/10" />

          <FilterSection
            title="Who are you shopping for?"
            sectionKey="user"
            options={USER_OPTIONS}
            selectedValues={users}
            paramKey="users"
            isExpanded={expandedSections.user}
            onToggle={() => toggleSection("user")}
            onUpdate={updateFilter}
          />

          <Separator className="mb-6 bg-theme-text-secondary/10" />

          <FilterSection
            title="Filter by Category"
            sectionKey="category"
            options={CATEGORY_OPTIONS}
            selectedValues={categories}
            paramKey="categories"
            isExpanded={expandedSections.category}
            onToggle={() => toggleSection("category")}
            onUpdate={updateFilter}
          />

          <Separator className="mb-6 bg-theme-text-secondary/10" />

          <FilterSection
            title="Filter by Type"
            sectionKey="type"
            options={TYPE_OPTIONS}
            selectedValues={types}
            paramKey="types"
            isExpanded={expandedSections.type}
            onToggle={() => toggleSection("type")}
            onUpdate={updateFilter}
          />

          <Separator className="mb-6 bg-theme-text-secondary/10" />

          <FilterSection
            title="Filter by Format"
            sectionKey="format"
            options={FORMAT_OPTIONS}
            selectedValues={formats}
            paramKey="formats"
            isExpanded={expandedSections.format}
            onToggle={() => toggleSection("format")}
            onUpdate={updateFilter}
          />
        </div>
      </aside>
    </>
  );
}
