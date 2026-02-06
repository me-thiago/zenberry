import { MOCK_PRODUCTS } from "./mock-products";

export const MOCK_ORDERS = [
  {
    id: "41234475",
    date: "2025-11-24",
    status: "Delivered",
    total: 59.49,
    paymentMethod: "Pix",
    products: [MOCK_PRODUCTS[0]],
  },
  {
    id: "41234474",
    date: "2025-11-10",
    status: "Delivered",
    total: 125.48,
    paymentMethod: "Credit Card",
    products: [MOCK_PRODUCTS[1], MOCK_PRODUCTS[2]],
  },
  {
    id: "41234473",
    date: "2025-10-20",
    status: "Delivered",
    total: 37.49,
    paymentMethod: "Pix",
    products: [MOCK_PRODUCTS[3]],
  },
  {
    id: "41234472",
    date: "2025-09-15",
    status: "Delivered",
    total: 79.99,
    paymentMethod: "Boleto",
    products: [MOCK_PRODUCTS[2]],
  },
  {
    id: "41234232",
    date: "2025-09-14",
    status: "Delivered",
    total: 45.99,
    paymentMethod: "Debit Card",
    products: [MOCK_PRODUCTS[2]],
  },
];
