import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleDownloadClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/get-started');
    }
  };

  return (
    <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full z-40 transition-all duration-300">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2 select-none">
        <Link to="/" className="flex items-center">
          {/* Stylized AI Chevron Logo */}
          <svg viewBox="0 0 24 24" className="w-6 h-6 mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L3.5 19.5H7.5L12 10.5L16.5 19.5H20.5L12 3Z" fill="url(#ai-gradient)" />
            <defs>
              <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex items-baseline font-outfit text-stone-900"><span className="font-semibold text-lg tracking-tight">Prime</span><span className="font-light text-lg tracking-tight ml-1">folio</span></div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="hidden md:flex items-center space-x-1 relative">
        {/* Products Menu Link */}
        <div
          className="relative"
          onMouseEnter={() => setActiveMenu('products')}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <button
            className={`px-3 py-1.5 rounded-full flex items-center space-x-1 text-sm font-outfit font-medium transition duration-200 ${
              activeMenu === 'products' ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <span>Products</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'products' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Mega Menu Dropdown */}
          <div
            className={`absolute top-full left-1/2 -translate-x-[200px] mt-2 w-[650px] bg-white border border-stone-200/80 rounded-2xl shadow-xl overflow-hidden z-50 transition-all duration-300 transform origin-top ${
              activeMenu === 'products' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <div className="grid grid-cols-12 p-8 gap-8">
              {/* Left Column: CTA */}
              <div className="col-span-5 flex flex-col justify-between border-r border-stone-100 pr-6">
                <div className="space-y-3">
                  <h3 className="font-outfit text-xl font-bold text-stone-900 leading-tight">
                    Explore our next generation products
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed font-outfit font-light">
                    Pioneering web engines and developer tools powered by advanced AI and autonomous compilation.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveMenu(null);
                    navigate('/themes');
                  }}
                  className="mt-6 px-4 py-2 self-start rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold font-outfit tracking-wide transition active:scale-95"
                >
                  See overview
                </button>
              </div>

              {/* Right Column: Links */}
              <div className="col-span-7 space-y-4">
                <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest font-outfit">
                  Products
                </h4>
                <div className="space-y-3">
                  {/* Antigravity 2.0 */}
                  <Link
                    to="/dashboard"
                    onClick={() => setActiveMenu(null)}
                    className="flex items-start space-x-3 p-2 rounded-xl hover:bg-stone-50 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      A
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 font-outfit">Antigravity 2.0</div>
                      <div className="text-[10px] text-stone-500 font-light">Next-generation Web Dev Agent</div>
                    </div>
                  </Link>

                  {/* Antigravity CLI */}
                  <Link
                    to="/dashboard"
                    onClick={() => setActiveMenu(null)}
                    className="flex items-start space-x-3 p-2 rounded-xl hover:bg-stone-50 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-605 flex items-center justify-center font-semibold text-xs shrink-0 font-mono">
                      [&gt;]
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 font-outfit">Antigravity CLI</div>
                      <div className="text-[10px] text-stone-500 font-light">Power commands to build & run</div>
                    </div>
                  </Link>

                  {/* Antigravity IDE */}
                  <Link
                    to="/dashboard"
                    onClick={() => setActiveMenu(null)}
                    className="flex items-start space-x-3 p-2 rounded-xl hover:bg-stone-50 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-650 flex items-center justify-center font-semibold text-xs shrink-0">
                      &lt;/&gt;
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 font-outfit">Antigravity IDE</div>
                      <div className="text-[10px] text-stone-500 font-light">Collaborative workspace browser</div>
                    </div>
                  </Link>

                  {/* Antigravity SDK */}
                  <Link
                    to="/dashboard"
                    onClick={() => setActiveMenu(null)}
                    className="flex items-start space-x-3 p-2 rounded-xl hover:bg-stone-50 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-semibold text-xs shrink-0">
                      ⚙️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900 font-outfit">Antigravity SDK</div>
                      <div className="text-[10px] text-stone-500 font-light">Custom programmatic extensions</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Menu Link */}
        <div
          className="relative"
          onMouseEnter={() => setActiveMenu('use-cases')}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <button
            className={`px-3 py-1.5 rounded-full flex items-center space-x-1 text-sm font-outfit font-medium transition duration-200 ${
              activeMenu === 'use-cases' ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <span>Use Cases</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'use-cases' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Use Cases Small Dropdown */}
          <div
            className={`absolute top-full left-0 mt-2 w-[220px] bg-white border border-stone-200/80 rounded-2xl shadow-xl p-4 space-y-1 z-50 transition-all duration-300 transform origin-top ${
              activeMenu === 'use-cases' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <Link
              to="/dashboard"
              onClick={() => setActiveMenu(null)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition font-outfit"
            >
              Developer Portfolios
            </Link>
            <Link
              to="/upload"
              onClick={() => setActiveMenu(null)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition font-outfit"
            >
              Resume Extraction
            </Link>
            <Link
              to="/video-generator"
              onClick={() => setActiveMenu(null)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition font-outfit"
            >
              AI Presenter Showcase
            </Link>
          </div>
        </div>

        {/* Pricing Link */}
        <Link
          to="/pricing"
          className="px-3 py-1.5 rounded-full text-sm font-outfit font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition"
        >
          Pricing
        </Link>

        {/* Enterprise Link */}
        <Link
          to="/get-started"
          className="px-3 py-1.5 rounded-full text-sm font-outfit font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition"
        >
          Enterprise
        </Link>

        {/* Resources Menu Link */}
        <div
          className="relative"
          onMouseEnter={() => setActiveMenu('resources')}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <button
            className={`px-3 py-1.5 rounded-full flex items-center space-x-1 text-sm font-outfit font-medium transition duration-200 ${
              activeMenu === 'resources' ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <span>Resources</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'resources' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Resources Small Dropdown */}
          <div
            className={`absolute top-full left-0 mt-2 w-[200px] bg-white border border-stone-200/80 rounded-2xl shadow-xl p-4 space-y-1 z-50 transition-all duration-300 transform origin-top ${
              activeMenu === 'resources' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <a
              href="https://antigravity.google/docs"
              target="_blank"
              rel="noreferrer"
              onClick={() => setActiveMenu(null)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition font-outfit"
            >
              Documentation
            </a>
            <a
              href="https://antigravity.google/support"
              target="_blank"
              rel="noreferrer"
              onClick={() => setActiveMenu(null)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition font-outfit"
            >
              Support Center
            </a>
            <a
              href="https://antigravity.google/changelog"
              target="_blank"
              rel="noreferrer"
              onClick={() => setActiveMenu(null)}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition font-outfit"
            >
              Changelog
            </a>
          </div>
        </div>
      </nav>

      {/* Download Action CTA */}
      <div className="flex items-center space-x-3">
        {!user && (
          <Link
            to="/login"
            className="hidden sm:inline-block text-sm font-outfit font-medium text-stone-500 hover:text-stone-900 transition"
          >
            Login
          </Link>
        )}
        <button
          onClick={handleDownloadClick}
          className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-850 text-white font-medium font-outfit text-sm transition duration-200 active:scale-95 shadow-md shadow-stone-950/15 flex items-center space-x-2 group"
        >
          <span>{user ? 'Dashboard' : 'Download'}</span>
          <svg
            className="w-4 h-4 text-white/90 transform transition-transform duration-200 group-hover:translate-y-[1px]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
