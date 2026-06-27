"use client";

import { useAppStore } from "@/store/useAppStore";
import { motion, type Variants } from "framer-motion";

type PromoPackage = {
  title: string;
  desc: string;
  badge: string;
  price: string;
  image: string;
};

const promoPackages: PromoPackage[] = [
  {
    title: "PopinLou Nonton",
    desc: "Dua kemasan 100gr untuk teman nonton, ngobrol santai, atau sharing berdua tanpa rebutan.",
    badge: "100gr x2",
    price: "Rp31.000",
    image: "/PaketNonton.PNG",
  },
  {
    title: "PopinLou Favorit",
    desc: "Kombinasi favorit 100gr dan 250gr untuk camilan harian yang lebih puas dan tetap hemat.",
    badge: "100gr + 250gr",
    price: "Rp34.000",
    image: "/PaketFavorit.PNG",
  },
  {
    title: "PopinLou Keluarga",
    desc: "Paket 100gr dan 500gr untuk dinikmati bersama keluarga saat nonton, kumpul, dan quality time.",
    badge: "100gr + 500gr",
    price: "Rp65.000",
    image: "/paketkeluarga.PNG",
  },
  {
    title: "PopinLou Sultan",
    desc: "Paket 250gr dan 500gr dengan porsi melimpah untuk acara besar atau stok lebih lama.",
    badge: "250gr + 500gr",
    price: "Rp81.000",
    image: "/paketsultan.PNG",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function PromoContent() {
  const setOrderPopupOpen = useAppStore((state) => state.setOrderPopupOpen);

  return (
    <div className="w-full h-full overflow-y-auto pb-24 pt-24 px-5 md:px-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 mb-5">
            Promo Popinlou
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
            Paket Promo Spesial
          </h1>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            Pilih paket PopinLou yang paling pas untuk nonton, sharing, kumpul
            keluarga, atau stok camilan premium di rumah.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {promoPackages.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="group relative overflow-hidden bg-black text-white rounded-[2rem] p-5 md:p-6 flex flex-col min-h-full shadow-2xl shadow-amber-900/10"
            >
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-400/20 to-transparent pointer-events-none" />

              <div className="relative w-full h-52 md:h-60 mb-6 flex items-center justify-center overflow-hidden rounded-2xl bg-white/95">
                <img
                  src={item.image}
                  alt={item.title}
                  draggable={false}
                  className="w-full h-full object-contain group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 ease-out drop-shadow-xl"
                />
              </div>

              <div className="relative flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="text-xl md:text-2xl font-extrabold leading-tight">
                    {item.title}
                  </h3>
                  <span className="bg-amber-400 text-black text-[10px] md:text-xs font-extrabold px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">
                    {item.badge}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-4 flex-1 leading-relaxed">
                  {item.desc}
                </p>
                <div className="text-2xl font-extrabold text-white mb-6">
                  {item.price}
                </div>

                <button
                  onClick={() => setOrderPopupOpen(true)}
                  className="w-full py-3.5 bg-white text-black rounded-xl font-semibold text-sm hover:bg-amber-400 transition-all duration-300 shadow-md hover:shadow-amber-400/25 active:scale-95"
                >
                  Ambil Promo
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
