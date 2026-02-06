import {
  ProductCBDType,
  ProductCategoryType,
  ProductFormatType,
  ProductUser,
} from "./product";

export interface ProductFilters {
  types: ProductCBDType[];
  categories: ProductCategoryType[];
  formats: ProductFormatType[];
  users: ProductUser[];
}
