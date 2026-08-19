import React from 'react';
import { Link } from 'react-router-dom';

export const Pricing: React.FC = () => {
  const tiers = [
    {
      name: 'Starter Draft',
      price: '$0',
      description: 'Ideal for inspecting layouts and testing AI models.',
      features: [
        'Upload up to 3 resumes',
        'AI Structured Resume Parsing',
        'Theme configuration previews',
        'Unpublished local drafts',
      ],
      cta: 'Get Started for Free',
      popular: false,
    },
    {
      name: 'Professional Developer',
      price: '$19',
      period: '/mo',
      description: 'Perfect for publishing and syncing live personal sites.',
      features: [
        'Unlimited published subdomains',
        'Tailored AI copywriting config',
        'Full premium Theme Gallery access',
        '1 HD Avatar video introduction / month',
        'Custom social links & assets folder',
      ],
      cta: 'Go Pro Now',
      popular: true,
    },
    {
      name: 'Elite Executive',
      price: '$49',
      period: '/mo',
      description: 'Designed for advanced brand tracking and custom pipelines.',
      features: [
        'Custom personal domain mapping (e.g. john.dev)',
        'Unlimited HD video avatar generations',
        'Exclusive AI presenter templates & custom voice uploads',
        'Priority Gemini-2.5 parsing queues',
        'Detailed view visitor analytics',
      ],
      cta: 'Upgrade to Elite',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col justify-between overflow-x-hidden relative">
      {/* Subtle backdrop glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Navbar header */}
      <header className="border-b border-stone-200/60 bg-[#fcfbf9]/85 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center font-bold text-lg text-white">P</div>
            <span className="font-semibold text-xl tracking-tight font-outfit text-stone-900">Primefolio</span>
          </Link>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition font-outfit">
          Dashboard →
        </Link>
      </header>

      {/* Main Grid */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-16 space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-outfit text-stone-900">Simple, Transparent Pricing</h2>
          <p className="text-stone-500 max-w-md mx-auto text-sm font-light">
            Choose the package that fits your career goals. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`bg-white border rounded-2xl p-8 flex flex-col justify-between space-y-8 relative hover:shadow-md transition duration-300 ${
                tier.popular
                  ? 'border-2 border-stone-900 shadow-lg shadow-stone-900/5'
                  : 'border-stone-200/80 shadow-sm'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-stone-900 text-white text-[9px] uppercase font-bold tracking-widest font-mono">
                  Most Popular
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-stone-850 font-outfit uppercase tracking-wide">{tier.name}</h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed font-light">{tier.description}</p>
                </div>
                <div className="flex items-baseline space-x-1 border-b border-stone-100 pb-4">
                  <span className="text-4xl font-extrabold text-stone-900">{tier.price}</span>
                  {tier.period && <span className="text-stone-500 text-sm font-light">{tier.period}</span>}
                </div>
                <ul className="space-y-3.5">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-3 text-sm text-stone-600 font-light">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/dashboard"
                className={`w-full py-3 rounded-lg text-center font-bold text-xs uppercase tracking-wider transition ${
                  tier.popular
                    ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-md shadow-stone-900/10'
                    : 'bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-stone-500 text-sm z-10 bg-stone-50">
        <p className="font-outfit">© {new Date().getFullYear()} Primefolio. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default Pricing;
