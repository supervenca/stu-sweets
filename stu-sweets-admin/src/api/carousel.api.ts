import api from "./httpClient";

export const carouselApi = {
  fetchSlides: () => {
    return api.get("/carousel");
  },
  uploadSlide: (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(
    "/internal/carousel",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
},
  toggleSlide: (id: number, isActive: boolean) => {
  return api.patch(`/internal/carousel/${id}`, { isActive });
},
  moveSlideUp: (id: number) => {
    return api.post(`/internal/carousel/${id}/move-up`);
  },
  moveSlideDown: (id: number) => {
    return api.post(`/internal/carousel/${id}/move-down`);
  },

  deleteSlide: (id: number) => {
    return api.delete(`/internal/carousel/${id}`);
  },
};