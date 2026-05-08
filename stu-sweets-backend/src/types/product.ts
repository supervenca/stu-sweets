export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId?: number | null;
  isBestseller?: boolean;
  isCartRecommendation?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number | null;
  isBestseller?: boolean;
  isCartRecommendation?: boolean;
}