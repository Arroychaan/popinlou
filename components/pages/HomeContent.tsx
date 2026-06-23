'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';
import gsap from 'gsap';

/*
 * CATATAN ARSITEKTUR:
 * 
 * Kedua gambar plastik (belakang & depan) adalah 2000×2000 px.
 * Wrapper berukuran 400×500. Dengan object-contain, keduanya
 * dirender sebagai 400×400 px, terposisi di tengah vertikal
 * (offset Y = 50px dari atas wrapper).
 *
 * Layer:
 *   z-10  plastik-belakang.png  (kantong hitam, background putih)
 *   z-20  <canvas> Matter.js    (popcorn di dalam kantong)
 *   z-30  plastik-depan.png     (plastik transparan, mix-blend-mode: screen)
 *   z-40  area klik (shake)
 *   z-50  popcorn jatuh (HTML elements)
 *
 * mix-blend-mode: screen pada plastik depan:
 *   - Bagian putih gambar → tetap putih (menyatu dengan bg halaman)
 *   - Bagian transparan/terang → memperlihatkan popcorn di bawahnya
 *     dengan efek "terlihat melalui plastik" yang natural
 */

export default function HomeContent() {
  const setActivePage = useAppStore((state) => state.setActivePage);
  const [droppedPopcorns, setDroppedPopcorns] = useState<number[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const fgRef = useRef<HTMLImageElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  const insidePopcornsRef = useRef<Matter.Body[]>([]);
  const shakeCountRef = useRef(0);

  // ===== DIMENSI =====
  const WRAP_W = 400;
  const WRAP_H = 500;
  const [scale, setScale] = useState(1);

  // Hitung skala dinamis agar 400x500 selalu muat di layar
  useEffect(() => {
    const updateScale = () => {
      if (typeof window !== 'undefined') {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.6; // max 60vh
        const scaleX = maxWidth / WRAP_W;
        const scaleY = maxHeight / WRAP_H;
        setScale(Math.min(1, scaleX, scaleY));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  
  // Dinding dalam disesuaikan dengan lekukan transparan wadah asli agar realistis:
  const WALL_LEFT   = 95;                                 // batas kiri
  const WALL_RIGHT  = 305;                                // batas kanan

  const handleShake = useCallback(() => {
    const audio = new Audio('/shek.mp3');
    audio.play().catch(() => {});
    
    // Animasi shake tersinkronisasi pada background, canvas, logo, dan foreground
    if (bgRef.current && fgRef.current && canvasRef.current && logoRef.current) {
      gsap.fromTo([bgRef.current, canvasRef.current, fgRef.current, logoRef.current], 
        { x: 0, y: 0, rotation: 0 },
        {
          keyframes: [
            { x: -10, y: -6, rotation: -4, duration: 0.08, ease: "power1.inOut" },
            { x: 10, y: 4, rotation: 4, duration: 0.08, ease: "power1.inOut" },
            { x: -8, y: -4, rotation: -3, duration: 0.08, ease: "power1.inOut" },
            { x: 8, y: 3, rotation: 3, duration: 0.08, ease: "power1.inOut" },
            { x: -5, y: -2, rotation: -2, duration: 0.08, ease: "power1.inOut" },
            { x: 5, y: 2, rotation: 2, duration: 0.08, ease: "power1.inOut" },
            { x: -2, y: -1, rotation: -1, duration: 0.08, ease: "power1.inOut" },
            { x: 0, y: 0, rotation: 0, duration: 0.15, ease: "elastic.out(1.2, 0.3)" }
          ],
          clearProps: "transform"
        }
      );
    }
    
    const engine = engineRef.current;
    if (!engine) return;

    // Goyang popcorn di dalam
    insidePopcornsRef.current.forEach(body => {
      const f = 0.015 * body.mass;
      Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * f,
        y: -Math.random() * f * 1.5
      });
    });
    
    // Coba keluarkan (eject) satu popcorn jika belum mencapai batas 4 kali
    if (shakeCountRef.current < 4) {
      // Cari popcorn yang masih di dalam dan belum dilabel 'ejected'
      const available = insidePopcornsRef.current.filter(b => b.position.y > 500 && b.label !== 'ejected');
      if (available.length > 0) {
        // Ambil yang posisinya paling atas
        const p = available.reduce((prev, curr) => prev.position.y < curr.position.y ? prev : curr);
        
        // Lempar keras ke atas
        Matter.Body.applyForce(p, p.position, {
          x: (Math.random() - 0.5) * 0.02 * p.mass,
          y: -0.15 * p.mass // dorongan vertikal kuat
        });
        p.label = 'ejected';
      }
    }
  }, []);

  // ===== SETUP MATTER.JS =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 }
    });
    engineRef.current = engine;
    
    // Canvas berukuran 400x900px, dengan top -400px relative ke wrapper 400x500
    // Y-Offset konstan = +400px
    const CANV_H = 900;
    const Y_OFFSET = 400;
    
    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: WRAP_W,
        height: CANV_H,
        background: 'transparent',
        wireframes: false,
        pixelRatio: window.devicePixelRatio
      }
    });
    
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    
    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);
    
    // --- Efek Kedalaman Visual (Fake Depth Shadow) ---
    // Dihapus karena akumulasi shadow saat popcorn tumpang tindih 
    // membuat warna popcorn menjadi sangat gelap dan kotor.

    // --- Transisi Jatuh yang Seamless ---
    Matter.Events.on(engine, 'beforeUpdate', () => {
      for (let i = insidePopcornsRef.current.length - 1; i >= 0; i--) {
        const body = insidePopcornsRef.current[i];
        // Jika popcorn sedang ditembakkan keluar dan sudah melewati area zipper (Y < 490)
        if (body.label === 'ejected' && body.position.y < 490) {
          Matter.World.remove(engine.world, body);
          insidePopcornsRef.current.splice(i, 1);
          
          // Memicu animasi HTML drop di React State
          const currentCount = shakeCountRef.current;
          setDroppedPopcorns(prev => {
            if (!prev.includes(currentCount)) return [...prev, currentCount];
            return prev;
          });
          shakeCountRef.current += 1;
        }
      }
    });
    
    // --- Dinding Poligonal yang Akurat (Mengikuti Kontur Plastik) ---
    const createWallSegment = (x1: number, y1: number, x2: number, y2: number, isLeftWall: boolean) => {
      const thickness = 100;
      let cx = (x1 + x2) / 2;
      let cy = (y1 + y2) / 2;
      const length = Math.hypot(x2 - x1, y2 - y1);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      
      // Mencari vektor normal untuk menggeser hitbox ke "luar" garis visual
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      const nx = -dy / len; // menunjuk ke kiri
      const ny = dx / len;
      
      const shiftDir = isLeftWall ? 1 : -1;
      cx += nx * (thickness / 2) * shiftDir;
      cy += ny * (thickness / 2) * shiftDir;

      return Matter.Bodies.rectangle(cx, cy, length + 20 /* overlap to prevent gaps */, thickness, {
        isStatic: true,
        angle: angle,
        render: { visible: false },
        friction: 0.8
      });
    };

    // Menyusun kontur dari atas ke bawah:
    // Bagian atas lurus -> Pinggang menyempit (pinch) -> Dasar melebar (flare)
    
    // Kiri
    const lTop = createWallSegment(98, -200, 98, 450, true);
    const lMid = createWallSegment(98, 450, 108, 650, true);
    const lBot = createWallSegment(108, 650, 78, 820, true);
    
    // Kanan
    const rTop = createWallSegment(302, -200, 302, 450, false);
    const rMid = createWallSegment(302, 450, 292, 650, false);
    const rBot = createWallSegment(292, 650, 322, 820, false);
    
    // Dasar
    const bottomFloor = Matter.Bodies.rectangle(200, 820 + 50, 400, 100, { 
      isStatic: true, render: { visible: false }, friction: 0.8 
    });
    
    Matter.World.add(engine.world, [lTop, lMid, lBot, rTop, rMid, rBot, bottomFloor]);
    
    // --- Spawn popcorn di dalam kantong ---
    const bagTopY = 50 + 80 + Y_OFFSET; // Y = 530 (leher zipper bag)
    const wallBottom = 50 + 370 + Y_OFFSET; // Y = 820 (segel bawah bag)
    const margin = 15;
    const spawnLeft   = 110;
    const spawnRight  = 290;
    const spawnTop    = bagTopY + 20;
    const spawnBottom = wallBottom - 20;
    
    const cols = 8;
    const rows = 11;
    const bodies: Matter.Body[] = [];
    
    let count = 0;
    for (let r_idx = 0; r_idx < rows && count < 85; r_idx++) {
      for (let c_idx = 0; c_idx < cols && count < 85; c_idx++) {
        const x_pct = (c_idx + 0.5) / cols;
        const y_pct = (r_idx + 0.5) / rows;
        
        const px = spawnLeft + x_pct * (spawnRight - spawnLeft) + (Math.random() - 0.5) * 10;
        const py = spawnTop + y_pct * (spawnBottom - spawnTop) + (Math.random() - 0.5) * 10;
        
        // --- RAHASIA ILUSI 3D ---
        // Gambar visualnya diperbesar, tapi radius fisikanya dikecilkan.
        // Ini memungkinkan popcorn tumpang-tindih (overlap) secara visual, 
        // sehingga terlihat seperti berlapis-lapis di dalam dimensi Z.
        const visualR = 15 + Math.random() * 4; // Ukuran gambar (15 s.d 19)
        const physicsR = visualR * 0.75; // Hitbox fisika lebih kecil 25%
        
        const s = visualR / 1000;
        
        const body = Matter.Bodies.polygon(px, py, 7, physicsR, {
          restitution: 0.1, // pantulan sangat kecil agar organik
          friction: 0.85,   // gesekan tinggi agar menumpuk dan saling kunci
          density: 0.002,
          angle: Math.random() * Math.PI * 2,
          render: {
            sprite: {
              texture: '/popcorn.png?v=3',
              xScale: s,
              yScale: s
            }
          }
        });
        bodies.push(body);
        count++;
      }
    }
    insidePopcornsRef.current = bodies;
    Matter.World.add(engine.world, bodies);
    
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, []);

  // Navigasi halaman saat klik popcorn yang jatuh
  const pages = ['tentang', 'produk', 'promo', 'faq'] as const;
  const handlePopcornClick = useCallback((index: number) => {
    setActivePage(pages[index]);
  }, [setActivePage]);

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center bg-white overflow-hidden select-none home-container pt-20 md:pt-24 pb-16">
      {/* Container responsif yang menyesuaikan ukuran layout tanpa merusak koordinat */}
      <div 
        className="relative flex justify-center items-center" 
        style={{ width: WRAP_W * scale, height: WRAP_H * scale }}
      >
        {/* Container asli fisika (selalu 400x500) yang di-scale dengan CSS Transform */}
        <div 
          className="absolute top-0 left-0"
          style={{ 
            width: WRAP_W, 
            height: WRAP_H, 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left' 
          }}
        >
          {/* Titik target untuk menghitung letak mulut bag (di-hide) */}
          <div className="bag-mouth-target absolute left-1/2 top-[50%] w-[10px] h-[10px] -translate-x-1/2 pointer-events-none opacity-0" />
          
          {/* z-10: Plastik belakang */}
          <img
            ref={bgRef}
            src="/plastik-belakang.png?v=3"
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
          />
          {/* z-20: Canvas Matter.js (tinggi 900px, top -400px) */}
          <canvas
            ref={canvasRef}
            className="absolute left-0 z-20 pointer-events-none drop-shadow-xl"
            style={{
              width: WRAP_W,
              height: 900,
              top: -400,
              filter: 'drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.25))'
            }}
          />
          {/* z-[80]: Stiker logo solid di depan */}
          <div
            ref={logoRef}
            className="absolute z-[80] pointer-events-none drop-shadow-sm"
            style={{
              width: '84px', // Sedikit diperbesar agar pas
              height: '84px',
              left: '158px', // Disesuaikan dengan perbesaran
              top: '279.6px'
            }}
          >
            <img
              src="/logo-circle.png"
              alt="Logo"
              draggable={false}
              className="block w-full h-full object-contain"
            />
          </div>
          {/* z-[70]: Plastik depan dengan mix-blend-mode: screen */}
          <img
            ref={fgRef}
            src="/plastik-depan.png?v=3"
            alt=""
            draggable={false}
            className="mix-blend-mode-screen pointer-events-none absolute inset-0 z-[70] w-full h-full object-contain"
            style={{ mixBlendMode: 'screen', top: '-5.2px' }}
          />
          {/* z-40: Area klik untuk shake */}
          <div
            onClick={handleShake}
            className="absolute inset-0 z-40 cursor-pointer touch-none"
          />
        </div>
      </div>

      {/* Animated Text Container */}
      <AnimatePresence>
        {droppedPopcorns.length < 4 && (
          <motion.div 
            className="absolute top-24 md:top-32 left-0 w-full z-[60] pointer-events-none flex flex-col items-center text-center px-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [-15, 15, -15] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="text-4xl sm:text-5xl"
                style={{ originY: 0.8 }}
              >
                👋
              </motion.div>
              <motion.h2 
                className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-500 drop-shadow-md tracking-wider uppercase"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                TAP TO SHAKE!
              </motion.h2>
            </div>
            <motion.p 
              className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest bg-white/50 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              Tap kemasan untuk mengeluarkan popcorn
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* z-[80]: Popcorn yang jatuh (posisi relatif terhadap viewport, tapi aman dari clipping) */}
      <div className="absolute left-0 w-full flex justify-center gap-x-2 sm:gap-x-8 md:gap-x-12 z-[80]" style={{ bottom: 'clamp(1rem, 3dvh, 4rem)' }}>
        {droppedPopcorns.map((index) => (
          <DroppedPopcorn
            key={index}
            index={index}
            onClick={() => handlePopcornClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

/* ===== Komponen popcorn yang jatuh ===== */
function DroppedPopcorn({ 
  index, onClick 
}: { 
  index: number; onClick: () => void 
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const labels = ['Tentang', 'Produk', 'Promo', 'FAQ'];
  const landings = [
    { y: 8, rotate: -12 },
    { y: -4, rotate: 9 },
    { y: 12, rotate: 16 },
    { y: 0, rotate: -7 },
  ];
  const label = labels[index];
  const landing = landings[index] ?? { y: 0, rotate: 0 };
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // Temukan elemen penanda mulut zipper bag
    const container = el.closest('.home-container');
    const mouth = container?.querySelector('.bag-mouth-target');
    
    if (mouth && el) {
      const mouthRect = mouth.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      
      // Hitung koordinat relatif agar popcorn terlihat keluar langsung dari mulut zipper bag
      const mouthCX = mouthRect.left + mouthRect.width / 2;
      const mouthCY = mouthRect.top + mouthRect.height / 2;
      
      const popcornEl = el.querySelector('.popcorn-img-container');
      const popcornRect = popcornEl ? popcornEl.getBoundingClientRect() : elRect;
      const popcornCX = popcornRect.left + popcornRect.width / 2;
      const popcornCY = popcornRect.top + popcornRect.height / 2;
      
      const dx = mouthCX - popcornCX;
      const dy = mouthCY - popcornCY;
      
      // Set posisi awal (sejajar di mulut bag, ukuran kecil, transparan)
      gsap.set(el, { 
        x: dx, 
        y: dy,
        scale: 0.4,
        rotation: 0,
        opacity: 0 
      });
      
      const labelEl = el.querySelector('.label-text');
      const dotEl = el.querySelector('.indicator-dot');
      
      // Timeline GSAP untuk animasi jatuh membal (bounce)
      const tl = gsap.timeline({ delay: 0.05 });
      
      tl.to(el, {
        x: 0,
        scale: 1,
        opacity: 1,
        duration: 0.85,
        ease: "power2.out"
      });
      
      tl.to(el, {
        y: 0,
        duration: 0.85,
        ease: "bounce.out"
      }, "<");
      
      const randomRot = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 180);
      tl.to(popcornEl || el, {
        rotation: randomRot,
        duration: 0.85,
        ease: "power1.out"
      }, "<");
      
      // Tampilkan label teks dan titik indikator setelah popcorn mendarat
      if (labelEl && dotEl) {
        tl.to([labelEl, dotEl], {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.08,
          ease: "back.out(1.7)"
        });
      }
    }
  }, [index]);

  return (
    <div 
      ref={ref}
      className="flex w-[60px] sm:w-16 md:w-20 flex-col items-center select-none"
      style={{ marginTop: landing.y }}
    >
      {/* Gambar popcorn */}
      <div 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="popcorn-img-container relative cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200 w-11 h-11 sm:w-12 sm:h-12 md:w-[50px] md:h-[50px]"
        style={{ rotate: `${landing.rotate}deg` }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-[88%] h-2.5 w-10 -translate-x-1/2 rounded-full bg-black/20 blur-[3px]"
        />
        <img 
          src="/popcorn.png?v=3" 
          alt={label}
          draggable={false}
          className="relative w-full h-full object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.22)] hover:drop-shadow-[0_14px_16px_rgba(0,0,0,0.26)] transition-all"
        />
      </div>
      
      {/* Label Halaman */}
      <span 
        className="label-text text-[10px] sm:text-xs font-bold text-gray-800 mt-2 tracking-wider uppercase select-none pointer-events-none text-center leading-tight"
        style={{ opacity: 0 }}
      >
        {label}
      </span>
      
      {/* Titik Indikator Navigasi */}
      <div 
        className="indicator-dot w-2 h-2 rounded-full bg-amber-500 mt-1.5 shadow-[0_0_8px_rgba(245,158,11,0.8)] pointer-events-none animate-pulse"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
