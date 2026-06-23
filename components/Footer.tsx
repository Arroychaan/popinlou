"use client";

import { useAppStore } from "@/store/useAppStore";

const address =
  "Villa Ciomas Indah, Ciomas Rahayu, Kecamatan Ciomas, Kabupaten Bogor, Jawa Barat 16610";

const socialLinks = [
  {
    label: "WhatsApp PopinLou",
    href: "https://wa.me/6285883216449?text=Halo%20PopinLou%2C%20saya%20mau%20pesan%20popcorn.",
    logo: "/logo-whatsapp.png",
  },
  {
    label: "Shopee PopinLou",
    href: "https://s.shopee.co.id/6pyVppbdSr?share_channel_code=1",
    logo: "/shopee-logo.png",
  },
  {
    label: "Instagram PopinLou",
    href: "https://www.instagram.com/p/DZsRQ9QE430/",
    logo: "/Instagram-logo.png",
  },
];

export default function Footer() {
  const activePage = useAppStore((state) => state.activePage);

  if (activePage === "home") return null;

  return (
    <footer className="absolute bottom-0 left-0 w-full h-16 px-5 md:px-8 flex items-center justify-between gap-4 z-50 bg-white/80 backdrop-blur-md border-t border-gray-100 text-sm text-gray-500">
      <div
        className="cursor-pointer hover:opacity-70 transition-opacity flex items-center shrink-0"
        onClick={() => useAppStore.getState().setActivePage("home")}
      >
        <img
          src="/logo-popinlou.PNG"
          alt="Popin Lou"
          className="h-7 w-auto object-contain"
        />
      </div>

      <div
        className="hidden md:block text-center text-xs leading-relaxed truncate"
        title={address}
      >
        {address}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {socialLinks.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-amber-50 hover:scale-105 transition-all"
          >
            <img src={item.logo} alt="" className="w-5 h-5 object-contain" />
          </a>
        ))}
      </div>
    </footer>
  );
}
