import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Braces, 
  Sparkle, 
  Check, 
  Copy, 
  GitCommit, 
  SearchCode, 
  Code, 
  CornerDownLeft, 
  Terminal, 
  LayoutGrid, 
  Sparkles, 
  Command, 
  Monitor 
} from 'lucide-react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

// Register the GSAP MotionPathPlugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(MotionPathPlugin);
}

interface RibbonNode {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  pathProgressOffset: number; // Spacing index
}

const iconsList = [
  ArrowRight,
  Braces,
  Sparkle,
  Check,
  Copy,
  GitCommit,
  SearchCode,
  Code,
  CornerDownLeft,
  Terminal,
  LayoutGrid,
  Sparkles,
  Command,
  Monitor
];

const nodesData: RibbonNode[] = iconsList.map((icon, idx) => ({
  id: idx,
  icon,
  pathProgressOffset: idx / iconsList.length
}));

export const FloatingOrbitalIcons: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  
  // Parallax layer refs
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);

  // Individual node element refs
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const tweens: gsap.core.Tween[] = [];
    const bobbingTweens: gsap.core.Tween[] = [];

    if (!pathRef.current) return;

    nodesData.forEach((item, idx) => {
      const el = nodeRefs.current[idx];
      const innerEl = innerRefs.current[idx];
      if (!el) return;

      // 1. Primary path-following animation: loop along the horizontal wave
      const t = gsap.to(el, {
        motionPath: {
          path: pathRef.current!,
          align: pathRef.current!,
          alignOrigin: [0.5, 0.5],
          autoRotate: false,
          start: item.pathProgressOffset,
          end: item.pathProgressOffset + 1.0
        },
        duration: 32,
        repeat: -1,
        ease: "none"
      });
      tweens.push(t);

      // 2. Secondary float/bobbing animation to make them feel weightless
      if (innerEl) {
        const bt = gsap.to(innerEl, {
          y: "random(-8, 8)",
          x: "random(-5, 5)",
          rotation: "random(-6, 6)",
          duration: 3.0 + Math.random() * 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        bobbingTweens.push(bt);
      }
    });

    // 3. Smooth mousemove parallax offsets
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const nx = clientX / innerWidth - 0.5;
      const ny = clientY / innerHeight - 0.5;

      // Subtle parallax shifts depending on depth layers
      gsap.to(layer1Ref.current, { x: nx * 35, y: ny * 35, duration: 1.4, ease: "power1.out" });
      gsap.to(layer2Ref.current, { x: nx * 20, y: ny * 20, duration: 1.4, ease: "power1.out" });
      gsap.to(layer3Ref.current, { x: nx * 10, y: ny * 10, duration: 1.4, ease: "power1.out" });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      tweens.forEach(t => t.kill());
      bobbingTweens.forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[260px] md:h-[320px] overflow-hidden select-none bg-transparent flex items-center justify-center"
    >
      {/* Invisible/Dashed reference wave mapping path */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-0" 
        viewBox="0 0 1200 300" 
        preserveAspectRatio="none"
      >
        {/* Horizontal sine wave path representing the ribbon */}
        <path 
          id="wavePath" 
          ref={pathRef}
          d="M-150,150 C150,20 350,280 600,150 C850,20 1050,280 1350,150" 
          stroke="rgba(214, 163, 115, 0.16)" 
          strokeWidth="1.5" 
          strokeDasharray="5,7" 
          fill="none" 
        />
      </svg>

      {/* Layer 1: Parallax Layer containing the drifting nodes */}
      <div ref={layer1Ref} className="absolute inset-0 z-10 pointer-events-none">
        {nodesData.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              ref={el => { nodeRefs.current[idx] = el; }}
              className="absolute pointer-events-auto origin-center"
              style={{ top: 0, left: 0 }}
            >
              <div 
                ref={el => { innerRefs.current[idx] = el; }}
                className="flex items-center justify-center rounded-full bg-white/45 backdrop-blur-[2px] border border-stone-200/40 shadow-sm shadow-stone-200/10 hover:scale-115 hover:bg-white/80 hover:shadow-md hover:border-amber-500/30 transition-all duration-300 cursor-pointer w-14 h-14 md:w-16 md:h-16 text-stone-800"
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6 stroke-[1.5]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FloatingOrbitalIcons;
