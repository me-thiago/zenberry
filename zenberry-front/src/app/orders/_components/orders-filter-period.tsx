import { ChevronDown } from "lucide-react";
import { FilterPeriod } from "@/src/types/filter-period";

interface OrdersFilterPeriodProps {
  selectedPeriod: string;
  setSelectedPeriod: (period: FilterPeriod) => void;
  selectedLabel: string;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  periodOptions: { value: string; label: string }[];
}

export function OrdersFilterPeriod({
  selectedPeriod,
  setSelectedPeriod,
  selectedLabel,
  isDropdownOpen,
  setIsDropdownOpen,
  periodOptions,
}: OrdersFilterPeriodProps) {
  return (
    <div
      className="relative"
      role="dialog"
      aria-label="Filter orders by period"
    >
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors min-w-[200px] justify-between"
        aria-label="Open period filter dropdown"
      >
        <span className="text-sm font-medium">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
            aria-label="Close period filter dropdown"
          />
          <div className="absolute right-0 mt-2 w-full min-w-[200px] bg-white border rounded-lg shadow-lg z-20">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedPeriod(option.value as FilterPeriod);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  selectedPeriod === option.value
                    ? "bg-gray-50 font-medium"
                    : ""
                }`}
                aria-label={`Filter by ${option.label}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
