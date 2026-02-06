import {
  Product,
  ProductCBDType,
  ProductCategoryType,
  ProductFormatType,
} from "./product";

export interface GetProductsParams {
  types?: ProductCBDType[];
  categories?: ProductCategoryType[];
  formats?: ProductFormatType[];
  users?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface GetProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
