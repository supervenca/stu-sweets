export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  categoryId?: number | null;
  subCategoryId?: number | null;
  isBestseller?: boolean;
  isCartRecommendation?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number | null;
  subCategoryId?: number | null;
  isBestseller?: boolean;
  isCartRecommendation?: boolean;
}