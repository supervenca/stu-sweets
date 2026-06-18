export type CreateCarouselSlideDto = {
  imageUrl: string;
};

export type UpdateCarouselSlideDto = {
  sortOrder?: number;
  isActive?: boolean;
};