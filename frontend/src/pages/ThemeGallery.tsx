import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

interface ThemeItem {
  id: string;
  name: string;
  slug: string;
  config: {
    primary: string;
    secondary: string;
    font: string;
    background: string;
    layout: string;
  };
}

export const ThemeGallery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');

  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittingMsg, setSubmittingMsg] = useState('');
  const [splineLoaded, setSplineLoaded] = useState(false);

  useEffect(() => {
    // If resumeId is missing, redirect to uploader
    if (!resumeId) {
      setErrorMsg('No active resume profile selected. Redirecting to upload...');
      setTimeout(() => {
        navigate('/upload');
      }, 2000);
      return;
    }

    const fetchThemes = async () => {
      try {
        const res = await apiService.listThemes();
        if (res.success && res.themes) {
          setThemes(res.themes);
        }
      } catch (err: any) {
        setErrorMsg('Failed to load portfolio themes from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [resumeId, navigate]);

  const handleSelectTheme = async (themeSlug: string) => {
    if (!resumeId || submitting) return;

    setSubmitting(true);
    setSubmittingMsg('Groq AI is writing your portfolio content...');
    setErrorMsg('');

    try {
      const res = await apiService.generatePortfolio(resumeId, themeSlug);
      if (res.success && res.portfolio) {
        setSubmittingMsg('Portfolio layout generated!');
        setTimeout(() => {
          navigate(`/portfolio/preview/${res.portfolio.id}`);
        }, 1000);
      } else {
        throw new Error('Server did not return generated portfolio data.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || err.message || 'Error generating your portfolio.'
      );
      setSubmitting(false);
    }
  };

  const renderThemeThumbnail = (slug: string, name: string) => {
    if (slug === 'minimalist') {
      return (
        <div className="w-full h-full bg-[#f9fafb] border border-stone-200 p-3 flex flex-col justify-between text-stone-900 rounded-lg relative overflow-hidden">
          <div className="flex justify-between items-center opacity-60 border-b border-stone-150 pb-1">
            <span className="text-[7px] font-bold font-mono">PORTFOLIO</span>
            <div className="flex space-x-1.5 text-[5px] font-semibold">
              <span>About</span>
              <span>Works</span>
            </div>
          </div>
          <div className="space-y-1.5 my-2 flex-grow flex flex-col justify-center">
            <div className="w-6 h-6 rounded-full bg-stone-200"></div>
            <div className="h-2 w-16 bg-stone-900 rounded-sm"></div>
            <div className="h-1.5 w-24 bg-stone-400 rounded-sm"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-4 w-full bg-white border border-stone-200 rounded"></div>
            <div className="h-4 w-full bg-white border border-stone-200 rounded"></div>
          </div>
        </div>
      );
    }
    if (slug === 'modern-dark') {
      return (
        <div className="w-full h-full bg-[#0f172a] p-3 flex flex-col justify-between text-white rounded-lg relative overflow-hidden border border-indigo-950">
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-center opacity-60 border-b border-slate-800 pb-1">
            <span className="text-[7px] font-bold text-indigo-400 font-mono">CYBER</span>
            <div className="flex space-x-1.5 text-[5px] font-semibold">
              <span>Home</span>
              <span>Projects</span>
            </div>
          </div>
          <div className="space-y-1.5 my-2 flex-grow flex flex-col justify-center">
            <div className="h-2 w-14 bg-indigo-400 rounded-sm shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
            <div className="h-1.5 w-20 bg-slate-500 rounded-sm"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-4 w-full bg-slate-900 border border-indigo-500/25 rounded-md backdrop-blur-sm"></div>
            <div className="h-4 w-full bg-slate-900 border border-indigo-500/25 rounded-md backdrop-blur-sm"></div>
          </div>
        </div>
      );
    }
    if (slug === 'neobrutalist') {
      return (
        <div className="w-full h-full bg-[#ff6b6b] p-3 flex flex-col justify-between text-black rounded-lg border-2 border-black relative overflow-hidden">
          <div className="flex justify-between items-center border-b-2 border-black pb-1">
            <span className="text-[7px] font-black tracking-wider">POP.IO</span>
            <span className="text-[5px] font-bold border border-black bg-[#ffde47] px-1 rounded">Menu</span>
          </div>
          <div className="space-y-1 my-2 flex-grow flex flex-col justify-center">
            <div className="bg-[#ffde47] border-2 border-black p-1 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] text-[6px] font-black w-20">
              HELLO WORLD!
            </div>
            <div className="h-1.5 w-24 bg-white border border-black"></div>
          </div>
          <div className="h-5 w-full bg-white border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"></div>
        </div>
      );
    }
    if (slug === 'creative-gradient') {
      return (
        <div className="w-full h-full bg-[#0a0a0a] p-3 flex flex-col justify-between text-white rounded-lg relative overflow-hidden border border-stone-900">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-8 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-lg rounded-full"></div>
          <div className="flex justify-between items-center opacity-60 pb-1 border-b border-stone-850">
            <span className="text-[7px] font-bold font-mono bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">CREATIVE</span>
            <span className="text-[5px]">Info</span>
          </div>
          <div className="space-y-1.5 my-2 flex-grow flex flex-col justify-center text-center items-center">
            <div className="h-2 w-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
            <div className="h-1.5 w-12 bg-stone-500 rounded-full"></div>
          </div>
          <div className="h-4 w-full bg-stone-950 border border-stone-850 rounded flex items-center justify-between px-2">
            <span className="w-1 h-1 rounded-full bg-pink-500"></span>
            <span className="w-1 h-1 rounded-full bg-purple-500"></span>
            <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
          </div>
        </div>
      );
    }
    if (slug === 'cosmic-creative') {
      return (
        <div 
          className="w-full h-full p-3 flex flex-col justify-between text-slate-300 rounded-lg relative overflow-hidden border border-indigo-950"
          style={{ background: 'radial-gradient(circle at 50% 30%, #170d38 0%, #060214 100%)' }}
        >
          <div className="absolute w-12 h-12 rounded-full bg-purple-500/20 blur-md top-1/3 left-1/3 animate-pulse"></div>
          <div className="flex justify-between items-center border-b border-indigo-950/60 pb-1">
            <span className="text-[8px] font-black text-purple-400 font-mono">Ʃ</span>
            <div className="flex space-x-1.5 text-[5px] font-semibold text-slate-400">
              <span>Home</span>
              <span>Lab</span>
            </div>
          </div>
          <div className="my-2 flex-grow flex flex-col items-center justify-center relative">
            <div className="w-8 h-8 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-end justify-center overflow-hidden">
              <div className="w-6 h-4 bg-zinc-800 rounded-t-sm border-b border-zinc-700/80"></div>
            </div>
            <span className="text-[5px] text-purple-400 font-mono scale-[0.8] mt-1 font-bold">Hello I am Ibrahim</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[5px]">📘</div>
            <div className="w-4 h-4 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-[6px] font-bold text-purple-400">Ʃ</div>
            <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[5px]">⚛️</div>
          </div>
        </div>
      );
    }
    if (slug === 'creative-showcase') {
      return (
        <div className="w-full h-full bg-[#1c1917] p-3 flex flex-col justify-between text-white rounded-lg relative overflow-hidden border border-stone-850">
          <div className="flex justify-between items-center opacity-60 border-b border-stone-800 pb-1">
            <span className="text-[7px] font-bold font-mono">SHOWCASE</span>
            <div className="flex space-x-1.5 text-[5px] font-semibold">
              <span>Home</span>
              <span>Projects</span>
            </div>
          </div>
          <div className="my-2 flex-grow flex items-center justify-between space-x-2">
            <div className="space-y-1 flex-grow">
              <div className="h-2 w-16 bg-white rounded-sm"></div>
              <div className="h-1.5 w-24 bg-stone-500 rounded-sm"></div>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-700/80 border border-stone-600 flex-shrink-0 flex items-center justify-center text-[8px]">👤</div>
          </div>
          <div className="h-3 w-full bg-stone-900 rounded flex items-center justify-between px-2">
            <span className="h-1 w-8 bg-stone-600 rounded-sm"></span>
            <span className="h-1 w-6 bg-stone-600 rounded-sm"></span>
          </div>
        </div>
      );
    }
    if (slug === 'portfolio-2023') {
      return (
        <div className="w-full h-full bg-[#0b0f19] p-3 flex flex-col justify-between text-slate-200 rounded-lg relative overflow-hidden border border-teal-950">
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-center opacity-75 border-b border-slate-900 pb-1">
            <span className="text-[7px] font-black tracking-wider text-teal-400 font-mono">PORTFOLIO '23</span>
            <div className="flex space-x-1 text-[4px] font-semibold text-slate-400">
              <span>Bento</span>
              <span>Works</span>
            </div>
          </div>
          <div className="my-1.5 flex-grow grid grid-cols-3 gap-1">
            <div className="col-span-2 bg-[#111827]/60 border border-slate-800/80 rounded p-1 flex flex-col justify-between">
              <div className="w-3.5 h-3.5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-[5px]">👨‍💻</div>
              <div className="h-1 w-8 bg-slate-100 rounded-full"></div>
            </div>
            <div className="bg-[#111827]/60 border border-slate-800/80 rounded p-1 flex flex-col justify-between">
              <div className="h-1 w-full bg-indigo-500/40 rounded-full"></div>
              <div className="h-1.5 w-4 bg-teal-400 rounded-full"></div>
            </div>
            <div className="col-span-3 bg-[#111827]/60 border border-slate-800/80 rounded p-1 flex items-center justify-between">
              <div className="h-1 w-12 bg-slate-400 rounded-full"></div>
              <span className="text-[4px] text-teal-400">→</span>
            </div>
          </div>
          <div className="h-3 w-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded text-[5px] font-bold text-white flex items-center justify-center">
            Duplicated 1.2k Times
          </div>
        </div>
      );
    }
    if (slug === 'playful-retro') {
      return (
        <div className="w-full h-full bg-[#ebebeb] p-3 flex flex-col justify-between text-black rounded-lg border-2 border-black relative overflow-hidden">
          <div className="flex justify-between items-center border-b-2 border-black pb-0.5">
            <span className="text-[6px] font-black tracking-widest bg-yellow-300 border border-black px-1 rounded-sm">RETRO</span>
            <span className="text-[5px] font-bold text-stone-600">★ ★</span>
          </div>
          <div className="space-y-1.5 my-2 flex-grow flex flex-col justify-center items-center relative">
            <div className="absolute top-0 right-0 text-[10px]">🌸</div>
            <div className="absolute bottom-0 left-0 text-[10px]">🌈</div>
            <div className="bg-[#85d0f0] border border-black px-1.5 py-0.5 rounded shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] text-[7px] font-black leading-none">
              PORTFOLIO
            </div>
            <div className="h-1 w-12 bg-white border border-black rounded-sm"></div>
          </div>
          <div className="h-3.5 w-full bg-[#ffa8e2] border border-black rounded shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-[5px] font-black uppercase">
            UIUX Design
          </div>
        </div>
      );
    }
    if (slug === 'fig-designer') {
      return (
        <div className="w-full h-full bg-black p-3 flex flex-col justify-between text-white rounded-lg border border-stone-800 relative overflow-hidden">
          {/* Splash background texture effect */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-stone-800/40 blur-xl rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-center opacity-85 border-b border-stone-900 pb-1 z-10">
            <span className="text-[6px] font-black tracking-tight text-white border-b border-white">Muhammad A.</span>
            <div className="flex space-x-1 text-[4px] font-semibold text-stone-400">
              <span>Home</span>
              <span>Works</span>
            </div>
          </div>
          
          <div className="my-2 flex-grow flex items-center justify-between gap-2 z-10">
            <div className="space-y-1 flex-grow text-left">
              <span className="text-[5px] text-stone-500 block">Hi, I'm Aqsam</span>
              <h4 className="font-extrabold text-[9px] text-white leading-none tracking-tight">I'm A Fig<br/><span className="text-[10px]">DESIGNER</span></h4>
              <div className="h-1 w-10 bg-indigo-600 rounded-sm mt-1"></div>
            </div>
            
            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full border border-white flex-shrink-0 flex items-center justify-center bg-stone-900/50 overflow-hidden relative">
              <span className="text-[14px]">😷</span>
            </div>
          </div>
          
          <div className="h-3 w-full bg-stone-900 rounded flex items-center justify-between px-2 z-10 border border-stone-850">
            <span className="text-[4px] text-stone-400 font-mono">figma.com/@aqsam</span>
            <span className="text-[4px] text-stone-300">View →</span>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-100 rounded-lg text-[10px] font-bold uppercase tracking-wider text-stone-500 border border-stone-200">
        {name}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col justify-between font-outfit relative">
      {/* Dynamic Background Glows matching the rest of the application */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Navbar header */}
      <header className="border-b border-stone-200/60 bg-[#fcfbf9]/85 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center font-bold text-lg text-white">P</div>
            <span className="font-semibold text-xl tracking-tight text-stone-900">Primefolio</span>
          </Link>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition font-outfit">
          Dashboard →
        </Link>
      </header>

      {/* Redesigned Immersive Stacked Selector Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 space-y-12 relative z-10">
        
        {/* Top Section: Interactive 3D Canvas Banner (Blends seamlessly with the page background) */}
        <div className="w-full relative h-[320px] md:h-[400px] z-10 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          
          {/* Text content side (Readable dark stone typography) */}
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6 text-left order-2 md:order-1 relative z-20">
            <div>
              <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#f4f3ef] text-amber-700 border border-stone-200 shadow-sm select-none">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Experience Theme Presets Live</span>
              </span>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Select a Design Theme
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed max-w-lg font-medium">
                Choose a baseline style preset for your portfolio website. Our engine will shape your copywriting layout and write customized portfolio copywriting tailored to this exact look.
              </p>
            </div>
          </div>

          {/* Interactive WebGL Canvas side (Border-free and shadow-free to blend perfectly) */}
          <div className="w-full md:w-1/2 h-[280px] md:h-full relative overflow-hidden order-1 md:order-2 z-10 rounded-3xl md:-translate-x-32">
            {!splineLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#fcfbf9] z-10 transition-opacity duration-500">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-4 border-stone-950 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-[11px] text-stone-500 font-bold tracking-wide uppercase">Initializing 3D Engine...</p>
                </div>
              </div>
            )}
            <iframe
              src="https://my.spline.design/projectpromolookatmouse-gOW6d9KaYLiOqaVVw8LZytCz/"
              frameBorder="0"
              width="100%"
              height="100%"
              className="w-full h-full pointer-events-auto"
              onLoad={() => setSplineLoaded(true)}
              title="Spline 3D Scene"
            />
            {/* Cover overlay to hide the cross-origin Spline watermark */}
            <div className="absolute bottom-0 right-0 w-[170px] h-[65px] bg-[#fcfbf9] z-20 pointer-events-auto" />
          </div>
        </div>

        {/* Bottom Section: Themes Selection Presets list */}
        <div className="space-y-6">
          
          {errorMsg && (
            <div className="w-full p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium text-center shadow-sm">
              {errorMsg}
            </div>
          )}

          {submitting && (
            <div className="w-full border border-stone-200 rounded-2xl p-10 bg-white text-center space-y-4 shadow-md flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 border-4 border-stone-950 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-extrabold text-stone-800 text-lg pt-2">{submittingMsg}</p>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">Please do not refresh the page while the AI model generates your static files.</p>
            </div>
          )}

          {loading && !submitting && (
            <div className="py-20 text-center w-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-stone-500 font-medium">Retrieving configuration presets from Supabase CDN...</p>
            </div>
          )}

          {!loading && !submitting && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.slug)}
                  className="bg-white border border-stone-200 hover:border-stone-400 rounded-2xl p-5 cursor-pointer flex flex-col justify-between space-y-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-98 group relative overflow-hidden"
                >
                  {/* Subtle top primary color accent bar that lights up on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: theme.config.primary }}
                  />

                  <div className="space-y-4">
                    {/* Visual Preset Representation Card */}
                    <div className="h-32 w-full rounded-xl relative overflow-hidden bg-stone-50 border border-stone-150 transition duration-300 group-hover:scale-[0.99]">
                      {renderThemeThumbnail(theme.slug, theme.name)}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-base text-stone-900 group-hover:text-stone-950 transition-colors">
                        {theme.name}
                      </h3>
                      <p className="text-[11px] text-stone-500 capitalize font-medium">
                        Layout Preset: <span className="font-mono text-stone-700 font-bold">{theme.config.layout}</span>
                      </p>
                    </div>
                  </div>

                  {/* Preset styling configuration parameters */}
                  <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider font-extrabold">Font</span>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-stone-50 border border-stone-200 text-stone-700">
                        {theme.config.font}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-200 shadow-sm"
                        style={{ backgroundColor: theme.config.primary }}
                        title="Primary Color Palette"
                      ></span>
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-200 shadow-sm"
                        style={{ backgroundColor: theme.config.secondary }}
                        title="Secondary Color Palette"
                      ></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-stone-500 text-sm bg-stone-50">
        <p>© {new Date().getFullYear()} Primefolio. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default ThemeGallery;
