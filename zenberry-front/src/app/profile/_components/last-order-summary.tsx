import { Accordion } from "@/src/components/ui/accordion";
import { OrderAccordionItem } from "@/src/components/orders/order-accordion-item";
import { MOCK_ORDERS } from "@/src/data/mock-orders";

export function LastOrderSummary() {
  const lastOrder = MOCK_ORDERS[0];

  return (
    <>
      <h3 className="text-3xl font-semibold my-4 text-secondary">
        Summary of Your Last Order
      </h3>
      
      <Accordion type="single" collapsible defaultValue={lastOrder.id}>
        <OrderAccordionItem order={lastOrder} />
      </Accordion>
    </>
  );
}
