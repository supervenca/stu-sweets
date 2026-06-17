import api from "./httpClient";

export const productsApi = {
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/internal/products/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteImage: (id: number) => {
    return api.delete(`/internal/products/${id}/image`);
  },
};