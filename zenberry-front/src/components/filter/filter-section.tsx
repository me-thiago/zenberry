import { cn } from "@/src/lib/utils";
import { ChevronDown } from "lucide-react";

interface FilterSectionProps {
  title: string;
  sectionKey: string;
  options: readonly string[];
  selectedValues: string[];
  paramKey: string;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (type: string, value: string, checked: boolean) => void;
}

export function FilterSection({
  title,
  options,
  selectedValues,
  paramKey,
  isExpanded,
  onToggle,
  onUpdate,
}: FilterSectionProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-3"
        aria-expanded={isExpanded}
        aria-label={`Toggle ${title}`}
      >
        <h3 className="text-sm font-medium text-theme-text-primary transition-colors duration-200">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && (
        <div className="space-y-2">
          {options.map((option) => {
            const isChecked = selectedValues.includes(option);
            return (
              <label
                key={option}
                className={cn(
                  "flex items-center justify-between cursor-pointer group p-2 rounded-sm hover:bg-theme-bg-secondary/70",
                  isChecked &&
                    "bg-theme-bg-secondary hover:bg-theme-bg-secondary/70"
                )}
              >
                <span className="text-sm text-theme-text-primary transition-colors duration-200">
                  {option}
                </span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => onUpdate(paramKey, option, e.target.checked)}
                  className={
                    "w-4 h-4 rounded border-2 border-gray-300 focus:ring-2 focus:ring-theme-accent-primary focus:ring-offset-0 cursor-pointer transition-colors"
                  }
                  style={{ accentColor: "var(--theme-accent-primary)" }}
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
