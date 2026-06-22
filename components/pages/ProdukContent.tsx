"use client";

import { useAppStore } from "@/store/useAppStore";
import { motion, type Variants } from "framer-motion";

type ProductItem = {
  title: string;
  desc: string;
  badge: string;
  price: string;
  image: string;
};

const singlePacks: ProductItem[] = [
  {
    title: "PopinLou Caramel 100gr",
    desc: "Cocok untuk 1 orang. Popcorn caramel premium dengan rasa manis yang pas, renyah, dan dibuat fresh.",
    badge: "100gr",
    price: "Rp29.000",
    image: "/kemasan100gram.PNG",
  },
  {
    title: "PopinLou Caramel 250gr",
    desc: "Cocok untuk sharing berdua atau stok ngemil lebih lama. Lapisan caramel merata dan tetap renyah.",
    badge: "250gr",
    price: "Rp49.000",
    image: "/kemasan250gram.PNG",
  },
  {
    title: "PopinLou Caramel 500gr",
    desc: "Ukuran paling hemat untuk keluarga, nonton bareng, atau acara kumpul. Renyah dan dibuat fresh.",
    badge: "500gr",
    price: "Rp69.000",
    image: "/kemasan500gram.PNG",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function ProdukContent() {
  const setOrderPopupOpen = useAppStore((state) => state.setOrderPopupOpen);

  const ProductCard = ({ item }: { item: ProductItem }) => (
    <motion.div
      variants={itemVariants}
      className="group bg-white/60 backdrop-blur-md border border-gray-100 rounded-[2rem] p-5 md:p-6 flex flex-col hover:shadow-2xl hover:shadow-amber-900/5 hover:border-amber-200/50 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative w-full h-48 md:h-56 mb-6 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50/50 to-white/50 group-hover:from-amber-50/50 group-hover:to-white/50 transition-colors duration-500">
        <img
          src={item.image}
          alt={item.title}
          draggable={false}
          className="w-full h-full object-contain group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500 ease-out drop-shadow-md group-hover:drop-shadow-xl"
        />
        {/* Decorative subtle glow */}
        <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors duration-500 rounded-2xl mix-blend-overlay" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
            {item.title}
          </h3>
          <span className="bg-black text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">
            {item.badge}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-3 leading-relaxed">
          {item.desc}
        </p>
        <div className="text-2xl font-extrabold text-gray-900 mb-6">
          {item.price}
        </div>

        {/* Action Button */}
        <button
          onClick={() => setOrderPopupOpen(true)}
          className="w-full py-3.5 bg-black text-white rounded-xl font-semibold text-sm hover:bg-amber-500 hover:text-black transition-all duration-300 shadow-md hover:shadow-amber-500/25 active:scale-95"
        >
          Pesan Sekarang
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full overflow-y-auto pb-24 pt-24 px-5 md:px-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
            Koleksi Popinlou
          </h1>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            Pilih salah satu dari tiga ukuran resmi PopinLou: 100gr, 250gr, atau
            500gr.
          </p>
        </motion.div>

        {/* Single Packs Section */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900">Kemasan Satuan</h2>
            <div className="h-px bg-gray-200 flex-1"></div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {singlePacks.map((item, index) => (
              <ProductCard key={`single-${index}`} item={item} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
