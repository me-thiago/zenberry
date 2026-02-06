import { Product } from "./product";

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  paymentMethod?: string;
  products: Product[];
}
