import { create } from 'zustand';

export type PageType = 'home' | 'tentang' | 'produk' | 'promo' | 'faq';

interface AppState {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  isOrderPopupOpen: boolean;
  setOrderPopupOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePage: 'home',
  setActivePage: (page) => set({ activePage: page }),
  isOrderPopupOpen: false,
  setOrderPopupOpen: (isOpen) => set({ isOrderPopupOpen: isOpen }),
}));
