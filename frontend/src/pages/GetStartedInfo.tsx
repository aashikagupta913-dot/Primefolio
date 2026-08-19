import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FloatingOrbitalIcons } from '../components/FloatingOrbitalIcons';
import { motion, AnimatePresence } from 'framer-motion';
import Antigravity from '../components/Antigravity';


interface PanelItem {
  num: string;
  label: string;
  meta: string;
  title: string;
  desc: string;
  color: string;
  image: string;
}

const panelsData: PanelItem[] = [
  {
    num: '01',
    label: 'MINIMALIST',
    meta: 'ALEX MORGAN',
    title: 'BUILD YOUR CREATIVE PORTFOLIO',
    desc: 'Select a clean, modern aesthetic with high-contrast text and a central focus on your profile image.',
    color: '#d97706', // Amber accent
    image: '/images/theme-01.jpg',
  },
  {
    num: '02',
    label: 'MAGAZINE',
    meta: 'JENNIE KIM',
    title: 'EDITORIAL LAYOUT DESIGN',
    desc: 'An editorial, high-fashion layout with strong grid lines and bold headings inspired by magazine covers.',
    color: '#c026d3', // Fuchsia accent
    image: '/images/theme-02.jpg',
  },
  {
    num: '03',
    label: 'SCRAPBOOK',
    meta: 'FAIZ AHMED',
    title: 'KINETIC MOTION CREATIVE',
    desc: 'A hand-drawn, scrapbook style featuring animations, paper cutouts, and interactive elements.',
    color: '#db2777', // Pink accent
    image: '/images/theme-03.jpg',
  },
  {
    num: '04',
    label: 'MARKETING',
    meta: 'GABI G.',
    title: 'BEAUTY CONSULTANCY LAYOUT',
    desc: 'A beauty and brand marketing layout designed to showcase services, packages, and custom consultancies.',
    color: '#0d9488', // Teal accent
    image: '/images/theme-04.jpg',
  },
  {
    num: '05',
    label: 'ART DIRECTOR',
    meta: 'MOHAMED RADY',
    title: 'TECHNICAL SKILLS MATRIX',
    desc: 'A dark, technical portfolio preset with neon outline borders and segmented columns showing your skills.',
    color: '#2563eb', // Blue accent
    image: '/images/theme-05.jpg',
  },
  {
    num: '06',
    label: 'INFLUENCER',
    meta: 'ARDEN VALE',
    title: 'UGC SOCIAL PORTAL',
    desc: 'A bold red-and-white content creator theme with social media stats displays and services lists.',
    color: '#e11d48', // Rose accent
    image: '/images/theme-06.jpg',
  },
];

export const GetStartedInfo: React.FC = () => {
  const [activeStep, setActiveStep] = useState<PanelItem>(panelsData[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Removed vertical rotating text configurations in favor of horizontal marquee

  const lastClosestIdx = useRef<number>(-1);

  // Removed local section canvas particle refs in favor of global ParticleBackground component

  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  // Variables for physics loop
  const physics = useRef({
    rotation: 0,
    velocity: 0,
    dragging: false,
    lastX: 0,
    targetX: 10,
    targetY: 0,
    currentX: 10,
    currentY: 0,
    radius: 360,
  });

  const count = panelsData.length;
  const spacingLevels = [0.74, 0.92, 1.08];
  const spacingIndex = 1; // Default Spacing
  const visualsOn = true;  // Previews ON by default

  // Adjust radius on resize
  useEffect(() => {
    const handleResize = () => {
      physics.current.radius = window.innerWidth < 768 ? 220 : 360;
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse move parallax listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const mx = e.clientX / window.innerWidth - 0.5;
      const my = e.clientY / window.innerHeight - 0.5;
      physics.current.targetY = mx * 28;
      physics.current.targetX = -my * 30 + 10;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Pointer drag listeners on the stage element
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handlePointerDown = (e: PointerEvent) => {
      physics.current.dragging = true;
      physics.current.lastX = e.clientX;
      physics.current.velocity = 0;
      stage.classList.add('dragging');
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!physics.current.dragging) return;
      const dx = e.clientX - physics.current.lastX;
      physics.current.lastX = e.clientX;
      const step = dx * 0.32;
      physics.current.rotation += step;
      physics.current.velocity = Math.max(-7, Math.min(7, step));
    };

    const handlePointerUp = () => {
      if (!physics.current.dragging) return;
      physics.current.dragging = false;
      stage.classList.remove('dragging');
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        physics.current.velocity = Math.max(
          -7,
          Math.min(7, physics.current.velocity + e.deltaX * 0.05)
        );
      }
    };

    stage.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    stage.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      stage.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      stage.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Animation Loop
  useEffect(() => {
    let animId: number;
    const friction = 0.94;
    const baseDrift = 0.12;

    const frame = () => {
      const p = physics.current;
      const ring = ringRef.current;
      const parallax = parallaxRef.current;

      if (!p.dragging) {
        p.rotation += baseDrift + p.velocity;
        p.velocity *= friction;
        if (Math.abs(p.velocity) < 0.0015) p.velocity = 0;
      }

      if (ring) {
        ring.style.transform = `rotateY(${p.rotation.toFixed(3)}deg)`;
      }

      if (parallax && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        p.currentX += (p.targetX - p.currentX) * 0.06;
        p.currentY += (p.targetY - p.currentY) * 0.06;
        parallax.style.transform = `rotateX(${p.currentX.toFixed(2)}deg) rotateY(${p.currentY.toFixed(2)}deg)`;
      }

      // Calculate panel closest to front and set active
      let normalizedRotation = -p.rotation % 360;
      if (normalizedRotation < 0) normalizedRotation += 360;
      const closestIdx = Math.round(normalizedRotation / (360 / count)) % count;
      if (closestIdx !== lastClosestIdx.current) {
        lastClosestIdx.current = closestIdx;
        setActiveStep(panelsData[closestIdx]);
      }

      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Removed local canvas loops and listeners in favor of global ParticleBackground component

  const currentRadius = physics.current.radius * spacingLevels[spacingIndex];

  const faqs = [
    {
      q: 'How does the AI Resume Parser work?',
      a: 'We parse text chunks directly from your uploaded PDF or Word document, feeding them to Groq. It formats your skills, experiences, and educational background into clean JSON schemas with 99% accuracy.'
    },
    {
      q: 'Can I customize colors and typography?',
      a: 'Yes! Every design layout in our themes database features fully-customizable style packages. You can select specific font bundles, background styles (like glassmorphism overlays), and color profiles directly from your live preview dashboard.'
    },
    {
      q: 'What is the AI Video Presenter?',
      a: 'It is a synthetic presentation module that generates script narrations based on your work milestones, synching generated audio voice tracks to a realistic 2D digital avatar video frame. You can display it directly in your portfolio header.'
    },
    {
      q: 'Do you offer domain hosting?',
      a: 'Absolutely. Every candidate site is published under a free candidate subdomain (e.g., yourname.ai-portfolio.com) backed by secure global CDN delivery and automatic SSL certificates.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col justify-between overflow-x-hidden relative">
      {/* Interactive 3D Antigravity Particle Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Antigravity
          count={600}
          magnetRadius={10}
          ringRadius={6}
          waveSpeed={0.4}
          waveAmplitude={1.0}
          particleSize={0.5}
          lerpSpeed={0.06}
          color="#F97316"
          autoAnimate={true}
          particleVariance={1.4}
          depthFactor={0.6}
          pulseSpeed={2}
          particleShape="sphere"
          fieldStrength={6.3}
        />
      </div>
      {/* Light Warm Amber Glow Backdrops */}
      <div className="fixed top-12 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-12 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Premium Sticky Navbar */}
      <header className="border-b border-stone-200/60 bg-[#fcfbf9]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center font-bold text-lg text-white">P</div>
            <span className="font-semibold text-xl tracking-tight font-outfit text-stone-900">Primefolio</span>
          </Link>
          <div className="h-4 w-px bg-stone-200 hidden sm:block"></div>
          <nav className="hidden sm:flex items-center space-x-4">
            <Link to="/" className="text-stone-500 hover:text-stone-900 transition font-outfit text-sm">Home</Link>
            <Link to="/pricing" className="text-stone-500 hover:text-stone-900 transition font-outfit text-sm">Pricing</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-stone-500 hover:text-stone-900 transition font-outfit text-sm">Login</Link>
          <Link to="/login" className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-850 text-white font-medium transition font-outfit text-sm shadow-md shadow-stone-900/10">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section (3D Orbital Carousel) */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 pb-24 flex flex-col items-center justify-center min-h-[720px] light-theme overflow-hidden">

        {/* Luxury Background Effects */}
        {/* Layered Gold/Beige Gradient Glows */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] md:w-[950px] md:h-[950px] bg-gradient-to-tr from-amber-500/10 via-orange-400/5 to-transparent rounded-full blur-[140px] pointer-events-none z-0"></div>
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(253,244,215,0.75)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0"></div>
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(217,119,6,0.06)_0%,rgba(0,0,0,0)_60%)] pointer-events-none z-0"></div>

        {/* Subtle Tech Dot-Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle, #78716c 1.2px, transparent 1.2px)`,
            backgroundSize: '28px 28px'
          }}
        ></div>

        {/* Floating Micro Particles & Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <motion.div
            animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-8 md:left-28 w-2.5 h-2.5 rounded-full bg-amber-500/20 blur-[1px]"
          />
          <motion.div
            animate={{ y: [0, 22, 0], x: [0, -12, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 right-8 md:right-28 w-3.5 h-3.5 rounded-full bg-orange-400/15 blur-[2px]"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 right-10 md:right-36 w-9 h-9 rounded-full border border-stone-300/15 flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-600/20" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -12, 0], rotate: 45 }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 left-10 md:left-40 w-3 h-3 border border-amber-600/10 rounded-sm"
          />
        </div>

        {/* 1. Animated Marquee Headline */}
        <div className="w-full relative py-4 overflow-hidden z-20 select-none mb-10 border-y border-stone-200/30 bg-stone-50/10">
          <div className="absolute top-0 left-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-[#fcfbf9] via-[#fcfbf9]/60 to-transparent pointer-events-none z-10"></div>
          <div className="absolute top-0 right-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-[#fcfbf9] via-[#fcfbf9]/60 to-transparent pointer-events-none z-10"></div>

          <style>{`
            @keyframes marquee-redesign {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-r {
              display: flex;
              width: max-content;
              animation: marquee-redesign 40s linear infinite;
              will-change: transform;
            }
          `}</style>

          <div className="animate-marquee-r flex items-center whitespace-nowrap">
            <div className="flex items-center text-4xl md:text-5xl font-extrabold font-outfit text-stone-900/10 tracking-widest uppercase">
              <span className="mx-6">Choose Your Style</span> <span className="text-amber-600/15 select-none">•</span>
              <span className="mx-6">Build Your Brand</span> <span className="text-amber-600/15 select-none">•</span>
              <span className="mx-6">Create Your Portfolio</span> <span className="text-amber-600/15 select-none">•</span>
              <span className="mx-6">Stand Out Online</span> <span className="text-amber-600/15 select-none">•</span>
            </div>
            <div className="flex items-center text-4xl md:text-5xl font-extrabold font-outfit text-stone-900/10 tracking-widest uppercase">
              <span className="mx-6">Choose Your Style</span> <span className="text-amber-600/15 select-none">•</span>
              <span className="mx-6">Build Your Brand</span> <span className="text-amber-600/15 select-none">•</span>
              <span className="mx-6">Create Your Portfolio</span> <span className="text-amber-600/15 select-none">•</span>
              <span className="mx-6">Stand Out Online</span> <span className="text-amber-600/15 select-none">•</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-4 mb-10 max-w-2xl mx-auto px-6 relative z-20"
        >
          <span className="font-mono text-[10px] tracking-[4px] text-amber-600 uppercase block mb-1 font-bold">
            // DESIGN LAB
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-stone-900 font-outfit">
            Build a Portfolio That Gets Remembered
          </h2>
          <p className="text-stone-500 text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto">
            Choose from professionally crafted templates designed to showcase your skills, projects, and personal brand.
          </p>
        </motion.div>

        {/* 3. Enhanced 3D Portfolio Carousel */}
        <div ref={stageRef} className="orbital-stage select-none relative z-20 mt-4">
          <div ref={parallaxRef} className="orbital-parallax">
            <div className="orbital-ring-tilt">
              <div ref={ringRef} className="orbital-ring">
                {panelsData.map((panel, idx) => {
                  const angle = (360 / count) * idx;
                  const tilt = Math.sin((idx / count) * Math.PI * 2) * 8;
                  const isCenter = activeStep.num === panel.num;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveStep(panel)}
                      className={`orbital-panel cursor-pointer group overflow-hidden transition-all duration-700 ${isCenter
                          ? 'shadow-[0_25px_60px_rgba(217,119,6,0.18)] border-amber-500/30 ring-2 ring-amber-500/15'
                          : 'border-stone-200/50'
                        }`}
                      style={{
                        '--ry': `${angle}deg`,
                        '--tz': `${currentRadius}px`,
                        '--rz': `${tilt.toFixed(2)}deg`,
                        '--i': idx,
                        '--s': isCenter ? 1.22 : 0.82,
                        'opacity': isCenter ? 1.0 : 0.42,
                      } as React.CSSProperties}
                    >
                      {/* Text Face (Fades out when visuals are ON) */}
                      <div className={`absolute inset-0 p-5 flex flex-col justify-between select-none transition-opacity duration-500 ${visualsOn ? 'opacity-0' : 'opacity-100'
                        }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] tracking-widest text-stone-400 group-hover:text-stone-900 transition" style={{ color: activeStep.num === panel.num ? panel.color : undefined }}>
                            {panel.num}
                          </span>
                          <span
                            className="w-1.5 h-1.5 rounded-full opacity-65 group-hover:opacity-100 transition"
                            style={{
                              backgroundColor: panel.color,
                              boxShadow: `0 0 8px ${panel.color}`
                            }}
                          ></span>
                        </div>

                        <div className="text-left space-y-1">
                          <div className="font-bold text-xs tracking-wider text-stone-700 group-hover:text-stone-900 transition uppercase font-outfit">
                            {panel.label}
                          </div>
                          <div className="font-mono text-[8px] tracking-wide text-stone-450 uppercase">
                            {panel.meta}
                          </div>
                        </div>
                      </div>

                      {/* Image Face (Fades in when visuals are ON) */}
                      <div className={`absolute inset-0 overflow-hidden select-none transition-opacity duration-500 bg-stone-100 ${visualsOn ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <img
                          src={panel.image}
                          alt={panel.label}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent"></div>
                        <div className="absolute bottom-3 left-4 right-4 text-left">
                          <p className="text-[10px] font-bold text-white uppercase tracking-wider font-outfit truncate">{panel.label}</p>
                          <span className="text-[8px] text-stone-300 font-mono block truncate">{panel.meta}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Dynamic Storytelling / Description Card positioned to the right of active card */}
          <div className="absolute bottom-6 left-6 right-6 md:bottom-auto md:left-[calc(50%+200px)] md:right-auto md:top-1/2 md:-translate-y-1/2 md:w-[300px] lg:w-[340px] z-30 pointer-events-auto text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.num}
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-3 bg-[#fcfbf9]/60 backdrop-blur-sm md:bg-transparent p-4 md:p-0 rounded-2xl border border-stone-200/20 md:border-none shadow-sm md:shadow-none"
              >
                <div className="space-y-1">
                  <span className="font-mono text-[9px] md:text-[10px] tracking-widest uppercase font-bold" style={{ color: activeStep.color }}>
                    Theme {activeStep.num} // {activeStep.label}
                  </span>
                  <h3 className="text-lg md:text-2xl font-black text-stone-900 font-outfit uppercase leading-tight">
                    {activeStep.title}
                  </h3>
                </div>

                <div className="w-8 h-px bg-stone-300 hidden md:block" />

                <p className="text-stone-500 text-xs md:text-sm font-light leading-relaxed">
                  {activeStep.desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 6. Trust Metrics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mx-auto px-6 mt-6 mb-8 relative z-20">
          <div className="bg-white/40 backdrop-blur-md border border-stone-200/50 rounded-2xl p-4 flex items-center space-x-3 shadow-sm hover:shadow-md transition">
            <span className="text-xl">✨</span>
            <div className="text-left">
              <p className="text-xs font-bold text-stone-900 font-outfit uppercase tracking-wide">100+ Layouts</p>
              <p className="text-[10px] text-stone-500 font-light">Custom designs</p>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-md border border-stone-200/50 rounded-2xl p-4 flex items-center space-x-3 shadow-sm hover:shadow-md transition">
            <span className="text-xl">⚡</span>
            <div className="text-left">
              <p className="text-xs font-bold text-stone-900 font-outfit uppercase tracking-wide">AI Customization</p>
              <p className="text-[10px] text-stone-500 font-light">Groq engine</p>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-md border border-stone-200/50 rounded-2xl p-4 flex items-center space-x-3 shadow-sm hover:shadow-md transition">
            <span className="text-xl">🚀</span>
            <div className="text-left">
              <p className="text-xs font-bold text-stone-900 font-outfit uppercase tracking-wide">Instant Launch</p>
              <p className="text-[10px] text-stone-500 font-light">Live in minutes</p>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-md border border-stone-200/50 rounded-2xl p-4 flex items-center space-x-3 shadow-sm hover:shadow-md transition">
            <span className="text-xl">🎨</span>
            <div className="text-left">
              <p className="text-xs font-bold text-stone-900 font-outfit uppercase tracking-wide">Made for Creators</p>
              <p className="text-[10px] text-stone-500 font-light">Developers & creators</p>
            </div>
          </div>
        </div>

        {/* HUD Control Dock (Bottom Controls) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full max-w-6xl mt-4 pt-6 border-t border-stone-200 relative z-20 bg-[#fcfbf9]/50 backdrop-blur-sm rounded-t-xl px-4">
          <div className="flex items-center space-x-3 text-stone-450 font-mono text-[10px]">
            <span className="animate-ping w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>SYSTEM CONSOLE: ACTIVE</span>
          </div>

          <div className="flex items-center">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 font-bold text-xs text-white tracking-wider uppercase transition shadow-lg shadow-stone-900/10 flex items-center space-x-2 font-outfit"
            >
              <span>Build Portfolio</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-1 z-20 pointer-events-none select-none">
          <span className="font-mono text-[8px] tracking-[4px] text-stone-400">SCROLL</span>
          <div className="w-px h-10 bg-gradient-to-b from-stone-400 to-transparent animate-pulse"></div>
        </div>

      </section>

      {/* Section 2: Technical Capabilities */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 border-t border-stone-200">
        <div className="max-w-2xl text-left space-y-4 mb-16">
          <span className="font-mono text-[10px] tracking-widest text-amber-600 uppercase">// SYSTEM CAPABILITIES</span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit tracking-tight leading-tight text-stone-900">
            Designed in three dimensions. Delivered in one platform.
          </h2>
          <p className="text-stone-500 text-sm md:text-base font-light">
            Our self-contained engine streamlines the portfolio publishing pipeline. No complex frameworks or configurations needed.
          </p>
        </div>

        {/* 3 Column Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="relative p-8 rounded-2xl bg-white border border-stone-200/80 overflow-hidden hover:shadow-md transition duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500"></div>
            <div className="font-mono text-xs text-amber-600 tracking-wider mb-6">01 // PIPELINE</div>
            <h3 className="text-lg font-bold font-outfit mb-3 text-stone-850">Structured Extraction</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              Asynchronously parse CV details into typed JSON formats mapping education, timelines, and skills with Groq.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl bg-white border border-stone-200/80 overflow-hidden hover:shadow-md transition duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-stone-900"></div>
            <div className="font-mono text-xs text-stone-600 tracking-wider mb-6">02 // RESPONSE</div>
            <h3 className="text-lg font-bold font-outfit mb-3 text-stone-850">Accelerated Themes</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              Frosted glass grids, custom SVG backgrounds, and CSS typography systems optimized for fast page loads.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl bg-white border border-stone-200/80 overflow-hidden hover:shadow-md transition duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-600"></div>
            <div className="font-mono text-xs text-amber-600 tracking-wider mb-6">03 // SYNTH</div>
            <h3 className="text-lg font-bold font-outfit mb-3 text-stone-850">Holographic Avatars</h3>
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              Submit storyboard scripts to background workers to render natural voiceovers synchronized to matching presenter frame blocks.
            </p>
          </div>

        </div>
      </section>

      {/* Visual Divider: Horizontal Wavy Ribbon Floating Icon Stream */}
      <section className="relative z-10 w-full max-w-7xl mx-auto py-6 border-t border-stone-200">
        <FloatingOrbitalIcons />
      </section>

      {/* Section 3: Interactive F.A.Q. Accordion */}
      <section className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20 border-t border-stone-200">
        <div className="text-center space-y-4 mb-16">
          <span className="font-mono text-[10px] tracking-widest text-stone-500 uppercase">// COMMON QUERY</span>
          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit tracking-tight text-stone-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="border border-stone-200/80 bg-white rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between space-x-4 hover:bg-stone-50 transition"
              >
                <span className="font-bold text-sm md:text-base font-outfit text-stone-850">{item.q}</span>
                <span className="text-stone-500 text-lg font-bold font-mono select-none">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>

              <div
                className={`transition-all duration-300 overflow-hidden ${openFaq === idx ? 'max-h-40 border-t border-stone-100' : 'max-h-0'
                  }`}
              >
                <p className="p-6 text-xs md:text-sm text-stone-500 leading-relaxed font-light">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Bottom CTA Banner */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-stone-100 via-stone-50 to-[#fcfbf9] border border-stone-200 rounded-3xl p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4 max-w-xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-extrabold font-outfit text-stone-900 tracking-tight leading-tight uppercase">
              Establish Your Professional Web Presence
            </h3>
            <p className="text-stone-500 text-sm md:text-base font-light">
              Build your customized 3D portfolio and render your video presenter. Start formatting in under five seconds.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Link
              to="/login"
              className="px-10 py-4.5 rounded-xl bg-stone-900 hover:bg-stone-800 font-bold text-sm text-white tracking-widest uppercase shadow-lg shadow-stone-900/10 transition hover:shadow-stone-900/25 hover:scale-102 flex items-center space-x-3 font-outfit"
            >
              <span>Launch Engine</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6 text-center text-stone-500 text-sm z-10 bg-stone-50">
        <p className="font-outfit">© {new Date().getFullYear()} Primefolio. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default GetStartedInfo;
