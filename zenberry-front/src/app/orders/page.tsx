"use client";

import { useCallback, useMemo, useState } from "react";
import { BaseLayout } from "@/src/components/layout/base-layout";
import { Accordion } from "@/src/components/ui/accordion";
import { Hero } from "@/src/components/hero/hero";
import { MOCK_ORDERS } from "@/src/data/mock-orders";
import { OrderAccordionItem } from "@/src/components/orders/order-accordion-item";
import { OrdersFilterPeriod } from "./_components/orders-filter-period";
import { OrdersEmptyState } from "./_components/orders-empty-state";
import { FilterPeriod } from "@/src/types/filter-period";
import { FILTER_PERIOD_OPTIONS } from "@/src/data/filter-period-options";

const filterOrdersByPeriod = (
  orders: typeof MOCK_ORDERS,
  selectedPeriod: FilterPeriod
) => {
  if (selectedPeriod === "all") return orders;

  const now = new Date();
  const daysMap = {
    "30days": 30,
    "3months": 90,
    "6months": 180,
    year: 365,
  };

  const days = daysMap[selectedPeriod];
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return orders.filter((order) => new Date(order.date) >= cutoffDate);
};

export default function OrdersPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredOrders = useMemo(
    () => filterOrdersByPeriod(MOCK_ORDERS, selectedPeriod),
    [selectedPeriod]
  );

  const selectedLabel = useMemo(
    () =>
      FILTER_PERIOD_OPTIONS.find((opt) => opt.value === selectedPeriod)
        ?.label || "All Orders",
    [selectedPeriod]
  );

  const handlePeriodChange = useCallback((period: FilterPeriod) => {
    setSelectedPeriod(period);
    setIsDropdownOpen(false);
  }, []);

  const handleDropdownToggle = useCallback(() => {
    setIsDropdownOpen((open) => !open);
  }, []);

  return (
    <BaseLayout
      config={{
        showHeader: true,
        showFooter: true,
        showHeroCta: true,
        backgroundImage: "/zenberry-product-background-small.webp",
        backgroundImageSize: "small",
      }}
    >
      <div className="transition-colors duration-200">
        <Hero title="Orders" />

        <div className="w-full bg-background py-4">
          {filteredOrders.length === 0 ? (
            <OrdersEmptyState />
          ) : (
            <div className="container mx-auto px-4 py-8">
              <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                  <p className="text-gray-600">
                    {filteredOrders.length}{" "}
                    {filteredOrders.length === 1 ? "order" : "orders"}
                  </p>
                </div>

                <OrdersFilterPeriod
                  selectedPeriod={selectedPeriod}
                  setSelectedPeriod={handlePeriodChange}
                  selectedLabel={selectedLabel}
                  isDropdownOpen={isDropdownOpen}
                  setIsDropdownOpen={handleDropdownToggle}
                  periodOptions={FILTER_PERIOD_OPTIONS}
                />
              </div>

              {/* Orders Accordion */}
              <Accordion type="single" collapsible className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderAccordionItem key={order.id} order={order} />
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  );
}
