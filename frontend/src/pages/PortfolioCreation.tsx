import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

export const PortfolioCreation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume_id');

  const [status, setStatus] = useState<'idle' | 'prompting' | 'generating' | 'success' | 'error'>('idle');
  const [instructions, setInstructions] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const loadingSteps = [
    'Analyzing structured resume milestones...',
    'Analyzing your dream portfolio instructions...',
    'Consulting Groq AI to design a custom blueprint...',
    'Generating persona-based headlines and narrative text...',
    'Dynamically ordering page sections based on background strength...',
    'Finalizing sandbox draft environment...'
  ];

  const presetSuggestions = [
    'Cyberpunk',
    'Apple style',
    'Luxury black and gold',
    'Futuristic AI engineer',
    'Startup founder'
  ];

  useEffect(() => {
    if (!resumeId) {
      setErrorMsg('No active resume profile selected. Redirecting...');
      setTimeout(() => {
        navigate('/upload');
      }, 2000);
    }
  }, [searchParams, navigate, resumeId]);

  // Handle progress text increments
  useEffect(() => {
    if (status !== 'generating') return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [status, loadingSteps.length]);

  const handleStartPrompting = () => {
    setStatus('prompting');
    setErrorMsg('');
  };

  const handleAiGenerate = async () => {
    if (!resumeId) return;
    setStatus('generating');
    setCurrentStep(0);
    setErrorMsg('');

    try {
      const res = await apiService.generatePortfolio(resumeId, undefined, 'ai', undefined, instructions);
      if (res.success && res.portfolio) {
        setStatus('success');
        setTimeout(() => {
          navigate(`/portfolio/preview/${res.portfolio.id}`);
        }, 1500);
      } else {
        throw new Error('Server response was missing generated data.');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(
        err.response?.data?.message || err.message || 'Error occurred during AI Generation.'
      );
    }
  };

  const handleAppendSuggestion = (suggestion: string) => {
    if (instructions.trim() === '') {
      setInstructions(suggestion);
    } else {
      setInstructions(prev => `${prev}, ${suggestion}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col justify-between font-outfit">
      {/* Header */}
      <header className="border-b border-stone-200/60 bg-[#fcfbf9]/85 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center font-bold text-lg text-white">P</div>
            <span className="font-semibold text-xl tracking-tight text-stone-900">Primefolio</span>
          </Link>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition">
          Dashboard →
        </Link>
      </header>

      {/* Main Choice Screen */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 max-w-6xl mx-auto w-full relative z-10">
        <div className="w-full max-w-4xl space-y-10">
          
          {status === 'idle' && (
            <>
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
                  Select Portfolio Creation Method
                </h2>
                <p className="text-stone-500 max-w-xl mx-auto text-base">
                  Choose how you want to design and generate your professional developer portfolio.
                </p>
              </div>

              {errorMsg && (
                <div className="max-w-md mx-auto p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium text-center">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Flow 1: Template Flow */}
                <div className="bg-white border border-stone-200/80 rounded-2xl p-8 hover:shadow-xl hover:border-stone-400 transition-all duration-300 flex flex-col justify-between space-y-8 group transform hover:scale-[1.01]">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-extrabold text-stone-900">1. Use Design Template</h3>
                      <p className="text-stone-500 text-sm leading-relaxed">
                        Select from our gallery of pre-built, high-converting style layouts (Minimalist, Midnight Dark, Neo-Brutalist, Creative Gradient). Groq will customize the text copywriting to match your selected theme.
                      </p>
                    </div>
                  </div>
                  <div>
                    <Link
                      to={`/themes?resume_id=${resumeId}`}
                      className="inline-block w-full py-4 text-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-850 font-semibold transition"
                    >
                      Browse Themes & Choose
                    </Link>
                  </div>
                </div>

                {/* Flow 2: AI Flow */}
                <div className="bg-white border border-stone-200/80 rounded-2xl p-8 hover:shadow-xl hover:border-stone-400 transition-all duration-300 flex flex-col justify-between space-y-8 group transform hover:scale-[1.01]">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-extrabold text-stone-900">2. AI-Generated Experience</h3>
                      <p className="text-stone-500 text-sm leading-relaxed">
                        Let Groq completely design your site. The AI analyzes your achievements to decide the best theme style, color palette combinations, layout grids, hero headlines, and optimal order of page sections dynamically.
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={handleStartPrompting}
                      className="w-full py-4 text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition cursor-pointer"
                    >
                      Generate via AI Engine
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {status === 'prompting' && (
            <div className="max-w-2xl mx-auto bg-white border border-stone-200/80 rounded-2xl p-8 space-y-6 shadow-md">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-extrabold text-stone-900">Describe Your Dream Portfolio</h3>
                <p className="text-stone-500 text-sm">
                  Let the AI know what look, style, or vibe you are trying to capture.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider font-extrabold text-stone-500">
                  Your Design Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe colors, aesthetics, layout style, target persona..."
                  rows={5}
                  className="w-full p-4 border border-stone-200 rounded-xl focus:border-stone-400 focus:ring-0 outline-none text-stone-800 text-sm bg-stone-50/50 resize-none font-outfit"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-[11px] uppercase tracking-wider font-bold text-stone-450">
                  Suggestions (click to apply):
                </span>
                <div className="flex flex-wrap gap-2">
                  {presetSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleAppendSuggestion(suggestion)}
                      className="px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-400 bg-white text-xs text-stone-600 hover:text-stone-900 font-medium transition cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => setStatus('idle')}
                  className="flex-1 py-3 text-center bg-stone-100 hover:bg-stone-200 text-stone-850 font-bold rounded-xl transition cursor-pointer text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={handleAiGenerate}
                  disabled={instructions.trim() === ''}
                  className="flex-grow py-3 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  Generate Portfolio Website
                </button>
              </div>
            </div>
          )}

          {status === 'generating' && (
            <div className="max-w-md mx-auto border border-stone-200 rounded-2xl p-10 bg-white text-center space-y-8 shadow-md">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  ⚡
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-stone-800">Generating Primefolio</h3>
                <p className="text-stone-500 text-sm font-medium animate-pulse min-h-[40px]">
                  {loadingSteps[currentStep]}
                </p>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="max-w-md mx-auto border border-stone-200 rounded-2xl p-10 bg-white text-center space-y-6 shadow-md">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-stone-800">Layout Decisions Confirmed!</h3>
                <p className="text-stone-500 text-sm">
                  AI generation complete. Launching sandbox preview...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="max-w-md mx-auto border border-stone-200 rounded-2xl p-10 bg-white text-center space-y-6 shadow-md">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
                !
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-stone-800">AI Generation Failed</h3>
                <p className="text-red-700 text-sm bg-red-50/50 p-3 rounded-lg border border-red-100">
                  {errorMsg}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setStatus('prompting')}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-850 font-semibold rounded-lg transition"
                >
                  Try Again
                </button>
                <Link
                  to="/dashboard"
                  className="flex-1 py-3 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold rounded-lg transition"
                >
                  Dashboard
                </Link>
              </div>
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
export default PortfolioCreation;
