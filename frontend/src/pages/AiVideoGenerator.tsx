import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

interface SceneItem {
  scene_number: number;
  visual_prompt: string;
  voiceover: string;
}

export const AiVideoGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('portfolio_id');

  const [script, setScript] = useState<any | null>(null);
  const [loadingScript, setLoadingScript] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Video Job States
  const [avatarId, setAvatarId] = useState('anthony_casual');
  const [voiceId, setVoiceId] = useState('en-US-Standard-C');
  const [job, setJob] = useState<any | null>(null);
  const [submittingJob, setSubmittingJob] = useState(false);

  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!portfolioId) {
      setErrorMsg('No portfolio ID specified. Redirecting to dashboard...');
      return;
    }

    const fetchOrGenerateScript = async () => {
      try {
        const res = await apiService.generateScript(portfolioId);
        if (res.success && res.script) {
          setScript(res.script);
        }
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message || 'Failed to generate video script using Groq.'
        );
      } finally {
        setLoadingScript(false);
      }
    };

    fetchOrGenerateScript();

    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, [portfolioId]);

  const handleStartRender = async () => {
    if (!script || submittingJob) return;
    setSubmittingJob(true);
    setErrorMsg('');

    try {
      const res = await apiService.generateVideo(script.id, avatarId, voiceId);
      if (res.success && res.job) {
        setJob(res.job);
        // Start polling status
        startPolling(res.job.id);
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to dispatch rendering task.'
      );
      setSubmittingJob(false);
    }
  };

  const startPolling = (jobId: string) => {
    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const jobStatus = await apiService.getVideoJobStatus(jobId);
        setJob(jobStatus);

        if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
          if (pollIntervalRef.current) {
            window.clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setSubmittingJob(false);
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 3000); // Poll status every 3 seconds
  };

  if (errorMsg && !script && !job) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex items-center justify-center px-6 font-outfit">
        <div className="max-w-md w-full bg-white border border-stone-200/80 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <p className="font-semibold text-red-800">{errorMsg}</p>
          <Link to="/dashboard" className="inline-block px-6 py-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 transition text-sm font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col justify-between font-outfit">
      {/* Header bar */}
      <header className="border-b border-stone-200/60 bg-[#fcfbf9]/85 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-stone-500 hover:text-stone-900 transition">
            ← Dashboard
          </Link>
          <div className="h-4 w-px bg-stone-200"></div>
          <span className="font-semibold text-lg text-stone-900">AI Video Presenter Setup</span>
        </div>
      </header>

      {/* Main interface layout */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Script storyboard editor */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-2xl font-bold border-b border-stone-150 pb-2 text-stone-900 font-outfit">AI Generated Voiceover Script</h3>
            
            {loadingScript ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-stone-500 text-sm">Structuring video script via Groq...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1">Narration Title</h4>
                  <p className="text-lg font-bold text-stone-900">{script?.title}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-stone-500 font-bold mb-1.5">Full Narration Text</h4>
                  <p className="text-sm text-stone-700 leading-relaxed bg-stone-50/50 p-4 rounded-lg border border-stone-200/60">
                    {script?.script_text}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!loadingScript && script && (
            <div className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold border-b border-stone-150 pb-2 text-stone-900">Video Scenes Storyboard</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {script.scenes.map((scene: SceneItem, idx: number) => (
                  <div key={idx} className="bg-stone-50/30 border border-stone-200/60 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                    <div className="md:col-span-1 border-r border-stone-200 pr-2">
                      <span className="text-xs font-mono font-bold text-stone-900">SCENE #{scene.scene_number}</span>
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <div>
                        <span className="text-[10px] uppercase text-stone-500 font-bold">Visual Cue Prompt:</span>
                        <p className="text-xs text-stone-500 font-mono italic">{scene.visual_prompt}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-stone-500 font-bold">Avatar Voice Script:</span>
                        <p className="text-sm text-stone-850">{scene.voiceover}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Customization & Render status */}
        <section className="space-y-6">
          {/* Settings Customizer */}
          <div className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-6 shadow-sm">
            <h3 className="text-xl font-bold border-b border-stone-150 pb-2 text-stone-900">Presenter Customization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">AI Avatar Presenter</label>
                <select
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  disabled={submittingJob || (job && job.status === 'processing')}
                  className="w-full px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition"
                >
                  <option value="anthony_casual">Anthony (Casual Outfit)</option>
                  <option value="helena_business">Helena (Business Formal)</option>
                  <option value="marcus_tech">Marcus (Tech Hoodie)</option>
                  <option value="chloe_office">Chloe (Smart Casual)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Narrator Voice Accent</label>
                <select
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  disabled={submittingJob || (job && job.status === 'processing')}
                  className="w-full px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition"
                >
                  <option value="en-US-Standard-C">American English (Male)</option>
                  <option value="en-US-Standard-E">American English (Female)</option>
                  <option value="en-GB-Standard-B">British English (Male)</option>
                  <option value="en-AU-Standard-A">Australian Accent (Female)</option>
                </select>
              </div>
            </div>

            {!job && (
              <button
                onClick={handleStartRender}
                disabled={loadingScript || !script}
                className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold transition tracking-wide text-center shadow-sm"
              >
                Render Avatar Video
              </button>
            )}
          </div>

          {/* Render Queue status */}
          {job && (
            <div className="bg-white border border-stone-200/80 rounded-xl p-6 space-y-6 shadow-sm">
              <h3 className="text-xl font-bold border-b border-stone-150 pb-2 text-stone-900">Generation Status</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-stone-50/50 p-4 rounded-lg border border-stone-200/60">
                  <span className="text-sm font-medium text-stone-500">Queue State:</span>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${
                    job.status === 'completed' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : job.status === 'failed'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200 animate-pulse'
                  }`}>
                    {job.status}
                  </span>
                </div>

                {(job.status === 'pending' || job.status === 'processing') && (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      AI is rendering video frames and syncing synthetic audio voiceover. This takes roughly 15 seconds. Please do not close the window.
                    </p>
                  </div>
                )}

                {job.status === 'failed' && (
                  <div className="p-4 rounded bg-red-50 text-red-800 text-xs border border-red-200 font-medium">
                    Error: {job.error_message || 'Video render pipeline crash.'}
                  </div>
                )}

                {job.status === 'completed' && job.video_url && (
                  <div className="space-y-4">
                    <div className="w-full aspect-video rounded-lg overflow-hidden border border-stone-200 bg-black">
                      <video src={job.video_url} controls className="w-full h-full object-cover"></video>
                    </div>
                    <a
                      href={job.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-sm text-stone-700 font-medium transition"
                    >
                      Open Video in New Tab
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-stone-500 text-sm bg-stone-50">
        <p>© {new Date().getFullYear()} Primefolio. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default AiVideoGenerator;
