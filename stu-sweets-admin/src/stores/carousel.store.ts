import {carouselApi} from "../api/carousel.api.ts";
import { create } from "zustand";


export type CarouselSlide = {
  id: number;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export type CarouselStore = {
  slides: CarouselSlide[];
  loading: boolean;
  error: string | null;

  fetchSlides: () => Promise<void>;
  uploadSlide: (file: File) => Promise<void>;
  deleteSlide: (id: number) => Promise<void>;
  toggleActive: (id: number, value: boolean) => Promise<void>;
  moveUp: (id: number) => Promise<void>;
  moveDown: (id: number) => Promise<void>;
};

export const useCarouselStore = create<CarouselStore>((set) => ({
    slides: [],
    loading: false,
    error: null,

    fetchSlides: async () => {
      set({ loading: true, error: null});
      try {
        const res = await carouselApi.fetchSlides();
        set({ slides: res.data, loading: false });
      } catch (error) {
        set({ loading: false, error: (error as Error).message });
      }
    },

    uploadSlide: async (file: File) => {
  try {
    const res = await carouselApi.uploadSlide(file);

    set((state) => ({
      slides: [...state.slides, res.data],
    }));
  } catch (error) {
    set({ error: (error as Error).message, loading: false });
  }
},

    deleteSlide: async (id: number) => {
        try {
            await carouselApi.deleteSlide(id);

            const res = await carouselApi.fetchSlides();

            set({ slides: res.data });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    toggleActive: async (id: number, value: boolean) => {
        try {
            const res = await carouselApi.toggleSlide(id, value);

            set((state) => ({
            slides: state.slides.map((s) =>
                s.id === id ? res.data : s
            ),
            }));
        } catch (error) {
        set({error: (error as Error).message});
        }
    },

    moveUp: async (id: number) => {
        try {
            const res =
            await carouselApi.moveSlideUp(id);

            set({
            slides: res.data,
            });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    moveDown: async (id: number) => {
        try {
            const res =
            await carouselApi.moveSlideDown(id);

            set({
            slides: res.data,
            });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },
}));