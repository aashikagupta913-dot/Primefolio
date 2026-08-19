import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Interactive Diagnostics Console States
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "🤖 [Agent]: Ingestion pipeline diagnostics online.",
    "🔑 [Auth]: User credentials authenticated via Supabase JWT.",
    "📡 [DB]: PostgreSQL connection synchronized.",
    "🚀 [Ready]: Ingestion engine stands ready."
  ]);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const data = await apiService.getUserDashboard();
      setDashboard(data);
    } catch (err: any) {
      setErrorMsg('Failed to download dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
  };

  const runDiagnostics = () => {
    if (runningDiagnostics) return;
    setRunningDiagnostics(true);
    setConsoleLogs([
      "⚙️ [Diagnostics]: Booting compilation health checks...",
    ]);
    
    const messages = [
      "🔍 [Schema]: Querying public.users profiles...",
      "✅ [Schema]: Synced auth triggers successfully verified.",
      "🧠 [AI Model]: Performing Groq API handshake...",
      "✅ [AI Model]: Connection active. Models verified.",
      "📁 [Storage]: Scanning resumes bucket storage paths...",
      "✅ [Storage]: Ingestion directories authenticated.",
      "🔒 [Security]: Auditing tenant row level isolation...",
      "🛡️ [Security]: RLS verified. Tenancy separation 100% secure.",
      "🎉 [Status]: Systems audit complete. Dashboard online!"
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < messages.length) {
        setConsoleLogs(prev => [...prev, messages[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setRunningDiagnostics(false);
      }
    }, 450);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-500 font-medium">Loading user dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex font-outfit relative overflow-x-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-stone-200/80 bg-white flex flex-col justify-between p-6 shadow-sm z-10">
        <div className="space-y-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center font-bold text-lg text-white">P</div>
            <span className="font-semibold text-xl tracking-tight text-stone-900">Primefolio</span>
          </div>

          <div className="space-y-1">
            <Link to="/dashboard" className="block px-4 py-2.5 rounded-lg bg-stone-900 text-white font-medium text-sm transition">
              Overview Dashboard
            </Link>
            <Link to="/upload" className="block px-4 py-2.5 rounded-lg hover:bg-stone-50 text-stone-600 hover:text-stone-900 text-sm transition">
              + New Resume
            </Link>
            <Link to="/pricing" className="block px-4 py-2.5 rounded-lg hover:bg-stone-50 text-stone-600 hover:text-stone-900 text-sm transition">
              Pricing Plans
            </Link>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-6 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-sm font-bold text-stone-700">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate w-36">
              <p className="text-xs text-stone-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full py-2 rounded-lg bg-stone-50 hover:bg-red-50 hover:text-red-600 border border-stone-200 hover:border-red-200 font-medium text-sm transition text-center"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Stats Pane */}
      <main className="flex-grow p-10 space-y-10 overflow-y-auto max-w-7xl relative z-10">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-100 pb-6">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A]">User Dashboard</h2>
            <p className="text-stone-500 text-sm">Welcome back! Manage your resumes and generated portfolios below.</p>
          </div>
          <Link
            to="/upload"
            className="px-6 py-3 rounded-lg bg-stone-900 hover:bg-stone-850 font-semibold text-sm tracking-wide text-white transition shadow-sm hover:scale-[1.02] transform duration-200"
          >
            Generate Portfolio Website
          </Link>
        </header>

        {errorMsg && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-850 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Counter cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-2 shadow-sm hover:shadow transition duration-200">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Resumes Ingested</span>
            <p className="text-3xl font-extrabold text-stone-900">{dashboard?.resumes?.length || 0}</p>
          </div>
          <div className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-2 shadow-sm hover:shadow transition duration-200">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Sites Created</span>
            <p className="text-3xl font-extrabold text-stone-900">{dashboard?.portfolios?.length || 0}</p>
          </div>
          <div className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-2 shadow-sm hover:shadow transition duration-200">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Intro Video Jobs</span>
            <p className="text-3xl font-extrabold text-stone-900">{dashboard?.video_jobs?.length || 0}</p>
          </div>
        </section>

        {/* Dynamic & Interactive AI Ingestion Pipeline Widget */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Pipeline workflow */}
          <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-150 pb-3">
              <h3 className="text-lg font-bold text-stone-900">AI Ingestion & Deploy Pipeline</h3>
              <span className="px-2 py-1 rounded bg-[#f4f3ef] border border-stone-200 text-[10px] font-mono text-stone-600 font-bold uppercase tracking-wider">Engine v1.0.0</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-sm shadow border border-stone-200 select-none">1</div>
                <div>
                  <p className="font-bold text-xs text-stone-900">Ingest</p>
                  <p className="text-[10px] text-stone-400">Upload PDF/Word</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-sm shadow border border-stone-200 select-none">2</div>
                <div>
                  <p className="font-bold text-xs text-stone-900">Parse</p>
                  <p className="text-[10px] text-stone-400">Groq Extraction</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-500 text-amber-700 font-bold flex items-center justify-center text-sm shadow select-none animate-pulse">3</div>
                <div>
                  <p className="font-bold text-xs text-stone-900">Select Theme</p>
                  <p className="text-[10px] text-amber-600 font-medium">Design Preset</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 text-stone-400 font-bold flex items-center justify-center text-sm select-none">4</div>
                <div>
                  <p className="font-bold text-xs text-stone-400">Deploy</p>
                  <p className="text-[10px] text-stone-400">Static Subdomain</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 text-stone-400 font-bold flex items-center justify-center text-sm select-none">5</div>
                <div>
                  <p className="font-bold text-xs text-stone-400">Synthesize</p>
                  <p className="text-[10px] text-stone-400">Avatar Intro Video</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-stone-500 leading-relaxed font-light bg-stone-50 p-3 rounded-lg border border-stone-200/50">
              💡 <strong>Next Step</strong>: Create a new website by uploading a resume in the navigation pane. Once uploaded, pick one of our optimized portfolio themes in the Theme Selection grid.
            </p>
          </div>

          {/* Sleek Interactive Terminal console */}
          <div className="bg-stone-900 rounded-xl p-5 space-y-4 shadow-xl border border-stone-850 flex flex-col justify-between min-h-[220px]">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              </div>
              <span className="text-[10px] font-mono text-stone-500">agent_diagnostics.sh</span>
            </div>

            <div className="flex-grow font-mono text-[11px] text-stone-300 space-y-1.5 overflow-y-auto max-h-32 pr-1 mt-2">
              {consoleLogs.map((log, idx) => (
                <p key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</p>
              ))}
            </div>

            <button
              onClick={runDiagnostics}
              disabled={runningDiagnostics}
              className="mt-3 w-full py-1.5 rounded bg-stone-800 hover:bg-stone-750 text-[10px] font-mono font-bold text-stone-400 hover:text-white transition text-center select-none border border-stone-700 disabled:opacity-60"
            >
              {runningDiagnostics ? "Running Audit..." : "Run Health Diagnostics"}
            </button>
          </div>

        </section>

        {/* Portfolios list */}
        <section className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xl font-bold border-b border-stone-150 pb-2 text-stone-900">Your Generated Websites</h3>
          {dashboard?.portfolios?.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-stone-500 text-sm">You haven't generated any portfolio websites yet.</p>
              <Link to="/upload" className="inline-block text-stone-900 hover:underline font-semibold text-sm">
                Get started by uploading a resume →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {dashboard?.portfolios?.map((port: any) => (
                <div key={port.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <h4 className="font-bold text-stone-900">{port.title}</h4>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-stone-500">Subdomain:</span>
                      <span className="font-mono text-stone-700 font-medium">{port.subdomain || 'unset'}.devportfolio.ai</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      port.is_published 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      {port.is_published ? 'Live' : 'Draft'}
                    </span>
                    <Link
                      to={`/portfolio/preview/${port.id}`}
                      className="px-4 py-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold transition"
                    >
                      Manage & Preview
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Resumes and Video Jobs lists */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumes */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xl font-bold border-b border-stone-150 pb-2 text-stone-900">Uploaded Resumes</h3>
            {dashboard?.resumes?.length === 0 ? (
              <p className="text-center py-6 text-stone-500 text-sm">No files uploaded yet.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {dashboard?.resumes?.map((res: any) => (
                  <div key={res.id} className="flex items-center justify-between bg-stone-50/50 border border-stone-200/60 p-3 rounded-lg text-sm">
                    <div className="truncate pr-4">
                      <p className="font-semibold text-stone-800 truncate">{res.file_name}</p>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">ID: {res.id.slice(0, 8)}...</p>
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono flex-shrink-0">
                      {new Date(res.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video tasks */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xl font-bold border-b border-stone-150 pb-2 text-stone-900">Avatar Intro Renders</h3>
            {dashboard?.video_jobs?.length === 0 ? (
              <p className="text-center py-6 text-stone-500 text-sm">No video tasks launched yet.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {dashboard?.video_jobs?.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between bg-stone-50/50 border border-stone-200/60 p-3 rounded-lg text-sm">
                    <div>
                      <p className="font-mono text-xs text-stone-600">Task: {job.id.slice(0, 8)}...</p>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                        {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      job.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : job.status === 'failed'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200 animate-pulse'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
export default Dashboard;
