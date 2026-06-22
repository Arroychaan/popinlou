'use client';

import { useAppStore } from '@/store/useAppStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PopUpOrder from '@/components/PopUpOrder';
import HomeContent from '@/components/pages/HomeContent';
import TentangContent from '@/components/pages/TentangContent';
import ProdukContent from '@/components/pages/ProdukContent';
import PromoContent from '@/components/pages/PromoContent';
import FaqContent from '@/components/pages/FaqContent';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const activePage = useAppStore((state) => state.activePage); const isHome = activePage === 'home';

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return <HomeContent />;
      case 'tentang':
        return <TentangContent />;
      case 'produk':
        return <ProdukContent />;
      case 'promo':
        return <PromoContent />;
      case 'faq':
        return <FaqContent />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <main className="relative w-full h-full bg-white text-black overflow-hidden">
      <Header />
      
      <div className={`absolute inset-0 z-10 ${isHome ? '' : 'pt-24 pb-16'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
      <PopUpOrder />
    </main>
  );
}
