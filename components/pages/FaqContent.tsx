export default function FaqContent() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 pt-20 pb-16 max-w-3xl mx-auto">
      <div className="w-full space-y-6">
        {[
          { q: 'Berapa lama masa kadaluarsa?', a: 'Produk kami tahan hingga 3 bulan dalam kemasan tertutup rapat.' },
          { q: 'Apakah ada minimum pemesanan?', a: 'Tidak ada minimum pemesanan untuk pengiriman standar.' },
          { q: 'Berapa lama pengiriman?', a: 'Pengiriman Jabodetabek 1-2 hari, luar daerah 3-5 hari kerja.' }
        ].map((faq, i) => (
          <div key={i} className="border-b border-gray-100 pb-6">
            <h3 className="font-semibold text-lg text-black mb-2">{faq.q}</h3>
            <p className="text-gray-500">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
