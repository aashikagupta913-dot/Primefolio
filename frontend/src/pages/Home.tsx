import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Antigravity from '../components/Antigravity';
import { Header } from '../components/Header';
import { motion, useScroll, useTransform } from 'framer-motion';

export const Home: React.FC = () => {
  const { user } = useAuth();

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0.1, 0.55], [0.8, 1.15]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.35, 0.75, 0.95], [0.6, 1, 1, 0.6]);
  const glowOpacity = useTransform(scrollYProgress, [0.1, 0.45, 0.8], [0, 0.7, 0]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Heading Animation Variants
  const headingText = "Create a Polished Developer Presence Instantly";
  const headingWords = headingText.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.16,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(12px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.log("Autoplay was prevented by browser:", error);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col justify-between overflow-x-hidden relative font-outfit animate-fade-in">
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

      {/* Dynamic Background Glows resembling Antigravity website */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-12 right-12 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <Header />

      {/* Hero Section */}
      <main className="flex-grow z-10 w-full pt-16 pb-24 space-y-16">

        {/* Centered Hero Headline */}
        <section className="text-center space-y-8 max-w-4xl mx-auto px-6">
          {/* Status Pill Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#f4f3ef] text-amber-700 border border-stone-200/60 shadow-sm select-none">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Experience liftoff with the next-gen portfolio engine</span>
            </span>
          </div>

          <div className="space-y-4">
            <motion.h1
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-8xl font-extrabold tracking-tight leading-[1.1] font-outfit text-[#1A1A1A] flex flex-wrap justify-center gap-x-[0.25em] gap-y-2"
            >
              {headingWords.map((word, idx) => (
                <motion.span
                  key={idx}
                  variants={wordVariants}
                  className="inline-block text-[#1A1A1A]"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
            <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto font-outfit leading-relaxed">
              Upload your resume and let Groq autonomously compile a premium 3D interactive portfolio website, complete with synthetic video presenters and CDNs.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/get-started"}
              className="px-8 py-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-semibold text-lg shadow-lg shadow-stone-900/10 transition-all duration-300 transform hover:scale-[1.02] active:scale-98 flex items-center space-x-3 font-outfit group"
            >
              <span>Launch Engine</span>
              <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/get-started"
              className="px-8 py-4 rounded-xl bg-white hover:bg-stone-50 text-stone-700 font-semibold text-lg border border-stone-200 shadow-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-98 flex items-center justify-center space-x-2 font-outfit"
            >
              <span>Preview Presets</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Cinematic Scroll-Linked Video Showcase */}
      <section
        ref={containerRef}
        className="w-full py-24 bg-[#fcfbf9] text-stone-900 flex flex-col items-center overflow-hidden relative select-none"
      >
        {/* Subtle Background Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.03)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>

        {/* Section Header */}
        <div className="text-center space-y-4 mb-16 z-10 max-w-2xl px-6">
          <h2 className="text-4xl md:text-6xl font-bold font-outfit tracking-tight text-[#1A1A1A]">
            Portfolio Showcase
          </h2>
          <p className="text-stone-500 text-base md:text-lg font-outfit font-light leading-relaxed">
            A visual walkthrough of my projects and technical work
          </p>
        </div>

        {/* Animated Video Container */}
        <div className="w-full max-w-[1440px] px-6 md:px-12 flex justify-center z-10">
          <motion.div
            style={{ scale, opacity }}
            className="w-full aspect-video rounded-[2rem] bg-white/40 border border-stone-200/50 shadow-2xl shadow-stone-300/20 backdrop-blur-md relative overflow-hidden group"
          >
            {/* Dynamic Glow Effect */}
            <motion.div
              style={{ opacity: glowOpacity }}
              className="absolute -inset-px bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-[2rem] blur-2xl pointer-events-none transition duration-1000"
            ></motion.div>

            <video
              ref={videoRef}
              src="/port.mp4"
              className="w-full h-full object-cover rounded-[2rem] relative z-10 cursor-pointer"
              onClick={handlePlayPause}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              autoPlay
              muted
              loop
              playsInline
              controls
            />
            <div
              className={`absolute inset-0 bg-stone-900/10 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all duration-500 hover:bg-stone-900/15 z-20 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                }`}
              onClick={handlePlayPause}
            >
              <button
                className="px-6 py-3 rounded-full bg-white hover:bg-stone-50 text-stone-900 font-semibold font-outfit shadow-md flex items-center space-x-3 transition duration-300 transform hover:scale-105 active:scale-95"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play intro</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area Continues */}
      <main className="w-full pb-24 space-y-16 z-10">

        {/* Feature Grid Segmented Panel (Developer Matrix) */}
        <section className="space-y-10 pt-10 max-w-7xl mx-auto px-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-5xl font-bold font-outfit text-stone-900">
              An ecosystem built for the agent-first era
            </h2>
            <p className="text-stone-500 text-sm md:text-base font-outfit max-w-lg mx-auto">
              Our components are designed to streamline developers' online presence autonomously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Card 1: Agent IDE */}
            <div className="bg-white border border-stone-200 hover:border-amber-500/20 rounded-xl p-8 space-y-4 hover:bg-[#faf8f5]/40 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/5 text-indigo-500 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition duration-300">
                💻
              </div>
              <h3 className="text-xl font-bold font-outfit text-stone-900">Visual Agent IDE</h3>
              <p className="text-stone-500 text-sm leading-relaxed font-outfit">
                An intuitive workspace to edit designs, components, and layout structures collaboratively with the Groq agent.
              </p>
            </div>

            {/* Card 2: Mission Control Ingestion */}
            <div className="bg-white border border-stone-200 hover:border-amber-500/20 rounded-xl p-8 space-y-4 hover:bg-[#faf8f5]/40 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-amber-500/5 text-amber-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition duration-300">
                📄
              </div>
              <h3 className="text-xl font-bold font-outfit text-stone-900">99.4% Ingestion Rate</h3>
              <p className="text-stone-500 text-sm leading-relaxed font-outfit">
                Groq extracts credentials, achievements, and tech stack details instantly from raw PDF/Word document streams.
              </p>
            </div>

            {/* Card 3: Developer CLI */}
            <div className="bg-white border border-stone-200 hover:border-amber-500/20 rounded-xl p-8 space-y-4 hover:bg-[#faf8f5]/40 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/5 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition duration-300">
                ⚡
              </div>
              <h3 className="text-xl font-bold font-outfit text-stone-900">Automated Portfolio CLI</h3>
              <p className="text-stone-500 text-sm leading-relaxed font-outfit">
                Run command-line commands to trigger agent updates, pull themes, and redeploy build folders instantly.
              </p>
            </div>

            {/* Card 4: Global CDN */}
            <div className="bg-white border border-stone-200 hover:border-amber-500/20 rounded-xl p-8 space-y-4 hover:bg-[#faf8f5]/40 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-red-500/5 text-red-500 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition duration-300">
                🌐
              </div>
              <h3 className="text-xl font-bold font-outfit text-stone-900">CDN Subdomain Deploy</h3>
              <p className="text-stone-500 text-sm leading-relaxed font-outfit">
                Published subdomains are cached globally with automatic SSL certificates and quick delivery.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section className="pt-10 max-w-5xl mx-auto px-6">
          <div className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 p-12 text-center space-y-6">
            {/* Internal glow backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-indigo-500/5 to-transparent pointer-events-none"></div>

            <h2 className="text-3xl md:text-5xl font-bold font-outfit text-stone-900">
              Ready to experience liftoff?
            </h2>
            <p className="text-stone-500 text-sm md:text-base font-outfit max-w-md mx-auto">
              Build your custom developer website, presentation video, and launch your subdomain today.
            </p>
            <div className="flex justify-center pt-2">
              <Link
                to={user ? "/dashboard" : "/get-started"}
                className="px-10 py-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-semibold text-lg transition shadow-lg shadow-stone-900/10 active:scale-95 font-outfit animate-pulse"
              >
                Launch Ingestion Engine
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-[#09090b] py-16 z-10 font-outfit text-stone-400">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {/* Top Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-lg text-black">P</div>
                <span className="font-semibold text-xl tracking-tight text-white">Primefolio</span>
              </div>
              <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
                Generate high-performance, 3D interactive developer portfolios autonomously from your resume in minutes.
              </p>
              <div className="flex space-x-4 text-stone-500">
                <span className="hover:text-white transition cursor-pointer">📸</span>
                <span className="hover:text-white transition cursor-pointer">💻</span>
                <span className="hover:text-white transition cursor-pointer">🌐</span>
              </div>
            </div>

            {/* Product Column */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-extrabold text-stone-500 tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm text-stone-300 font-medium">
                <li><Link to="/get-started" className="hover:text-white transition">Templates Mode</Link></li>
                <li><Link to="/get-started" className="hover:text-white transition">AI Generator</Link></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing Plans</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-extrabold text-stone-500 tracking-wider">Resources</h4>
              <ul className="space-y-2 text-sm text-stone-300 font-medium">
                <li><a href="https://antigravity.google/docs" className="hover:text-white transition">Documentation</a></li>
                <li><a href="https://antigravity.google/support" className="hover:text-white transition">Help Center</a></li>
                <li><a href="https://antigravity.google/support" className="hover:text-white transition">Customer Support</a></li>
                <li><a href="https://antigravity.google/changelog" className="hover:text-white transition">Changelog</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-extrabold text-stone-500 tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-stone-300 font-medium">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Sales</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="border-t border-stone-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>© {new Date().getFullYear()} Primefolio. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-stone-300 transition">Privacy Policy</a>
              <a href="#" className="hover:text-stone-300 transition">Terms of Service</a>
              <a href="#" className="hover:text-stone-300 transition">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
