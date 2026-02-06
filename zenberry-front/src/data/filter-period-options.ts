import { FilterPeriod } from "../types/filter-period";

export const FILTER_PERIOD_OPTIONS = [
  { value: "all" as FilterPeriod, label: "All orders" },
  { value: "30days" as FilterPeriod, label: "Last 30 days" },
  { value: "3months" as FilterPeriod, label: "Last 3 months" },
  { value: "6months" as FilterPeriod, label: "Last 6 months" },
  { value: "year" as FilterPeriod, label: "Last year" },
];
