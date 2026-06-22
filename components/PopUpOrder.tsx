"use client";

import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type ContactLink = {
  label: string;
  detail: string;
  href: string;
  logo: string;
  logoAlt: string;
  tone: string;
};

const address =
  "Villa Ciomas Indah, Ciomas Rahayu, Kecamatan Ciomas, Kabupaten Bogor, Jawa Barat 16610";

const contactLinks: ContactLink[] = [
  {
    label: "WhatsApp",
    detail: "+628 5883 216 449",
    href: "https://wa.me/6285883216449?text=Halo%20PopinLou%2C%20saya%20mau%20pesan%20popcorn.",
    logo: "/logo-whatsapp.png",
    logoAlt: "Logo WhatsApp",
    tone: "bg-green-50",
  },
  {
    label: "Shopee",
    detail: "Beli lewat toko Shopee PopinLou",
    href: "https://s.shopee.co.id/6pyVppbdSr?share_channel_code=1",
    logo: "/shopee-logo.png",
    logoAlt: "Logo Shopee",
    tone: "bg-orange-50",
  },
  {
    label: "Instagram",
    detail: "@popinlou",
    href: "https://www.instagram.com/popinlou",
    logo: "/Instagram-logo.png",
    logoAlt: "Logo Instagram",
    tone: "bg-pink-50",
  },
];

export default function PopUpOrder() {
  const { isOrderPopupOpen, setOrderPopupOpen } = useAppStore();

  return (
    <AnimatePresence>
      {isOrderPopupOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setOrderPopupOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setOrderPopupOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Tutup popup order"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-3 pr-8 text-gray-900 leading-snug">
              Pesan PopinLou lewat channel resmi
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Pilih WhatsApp untuk order cepat, Shopee untuk checkout
              marketplace, atau Instagram untuk lihat update terbaru.
            </p>

            <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700 mb-2">
                Alamat
              </div>
              <address className="not-italic text-sm leading-relaxed text-gray-700">
                {address}
              </address>
            </div>

            <div className="flex flex-col gap-3">
              {contactLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all group"
                >
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full ${item.tone} group-hover:scale-110 transition-transform`}
                  >
                    <img
                      src={item.logo}
                      alt={item.logoAlt}
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  <span className="min-w-0">
                    <span className="block font-semibold text-gray-800 group-hover:text-black">
                      {item.label}
                    </span>
                    <span className="block text-xs text-gray-500 truncate">
                      {item.detail}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
