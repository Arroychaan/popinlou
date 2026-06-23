"use client";

import { useAppStore } from "@/store/useAppStore";

const titles = {
  home: "",
  tentang: "Tentang Kami",
  produk: "Produk Kami",
  promo: "Promo Hari Ini",
  faq: "faq",
};

export default function Header() {
  const { activePage, setActivePage, setOrderPopupOpen } = useAppStore();

  return (
    <header className="absolute top-0 left-0 w-full h-20 md:h-24 px-5 md:px-8 flex items-center justify-between z-50 bg-white/75 backdrop-blur-md border-b border-gray-100">
      {/* Left: Back Button & Logo */}
      <div className="flex items-center gap-1 md:gap-2">
        {activePage !== "home" && (
          <button
            onClick={() => setActivePage("home")}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Kembali ke Beranda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        )}
        <div
          className="cursor-pointer hover:opacity-70 transition-opacity flex items-center"
          onClick={() => setActivePage("home")}
        >
          <img
            src="/logo-popinlou.PNG"
            alt="Popin Lou"
            className="h-26 md:h-30 w-auto object-contain"
          />
        </div>
      </div>

      {/* Center: Title */}
      <div className="absolute left-1/2 -translate-x-1/2 text-base md:text-lg font-medium text-gray-800">
        {titles[activePage]}
      </div>

      {/* Right: Buttons */}
      <div className="flex items-center gap-3 md:gap-4">

        <button
          onClick={() => setOrderPopupOpen(true)}
          className="bg-black text-white px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-medium hover:bg-gray-800 transition-colors active:scale-95"
        >
          Order Sekarang
        </button>
      </div>
    </header>
  );
}
