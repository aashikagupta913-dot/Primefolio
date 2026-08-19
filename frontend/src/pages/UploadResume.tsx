import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';

export const UploadResume: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [progressMsg, setProgressMsg] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (status === 'uploading' || status === 'parsing') return;
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg('');
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'docx', 'txt'];

    if (!extension || !validExtensions.includes(extension)) {
      setErrorMsg('Invalid file format. Only PDF, DOCX, and TXT are supported.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setErrorMsg('File is too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgressMsg('Uploading document to secure storage...');
    setErrorMsg('');

    try {
      // 1. Upload to Supabase Storage
      const uploadRes = await apiService.uploadResume(file);
      const resumeId = uploadRes.resume?.id;

      if (!resumeId) {
        throw new Error('Failed to retrieve resume index identifier.');
      }

      // 2. Trigger parsing service
      setStatus('parsing');
      setProgressMsg('Groq AI is parsing and structuring your experience profile...');
      
      const parseRes = await apiService.parseResume(resumeId);
      
      if (parseRes.success) {
        setStatus('success');
        setProgressMsg('Resume successfully parsed!');
        
        // 3. Route to Portfolio Creation Selector passing resume_id
        setTimeout(() => {
          navigate(`/create-portfolio?resume_id=${resumeId}`);
        }, 1000);
      } else {
        throw new Error('Structured parsing failed.');
      }

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(
        err.response?.data?.message || err.message || 'An error occurred during resume processing.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col justify-between font-outfit">
      {/* Header navbar */}
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

      {/* Main Uploader Box */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-xl w-full bg-white border border-stone-200/80 rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1A1A]">Upload Your Resume</h2>
            <p className="text-stone-500 text-sm">
              We accept PDF, Word (DOCX), or Text format (max 10MB)
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {status === 'idle' && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl p-10 text-center cursor-pointer transition bg-stone-50/50 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-stone-200/50 group-hover:text-stone-900 flex items-center justify-center mx-auto text-stone-500 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-stone-850">
                    {file ? file.name : 'Drag and drop your file here'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    or click to browse from files
                  </p>
                </div>
              </div>
            </div>
          )}

          {(status === 'uploading' || status === 'parsing' || status === 'success') && (
            <div className="border border-stone-200 rounded-xl p-8 bg-stone-50/30 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                {status === 'success' ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-stone-800">{progressMsg}</p>
                <p className="text-xs text-stone-500">File: {file?.name}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <button
                onClick={() => setStatus('idle')}
                className="px-6 py-2 rounded-lg bg-stone-100 hover:bg-stone-250 border border-stone-200 text-stone-700 font-medium transition"
              >
                Try Again
              </button>
            </div>
          )}

          {status === 'idle' && file && (
            <button
              onClick={handleUpload}
              className="w-full py-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-semibold transition text-center shadow-sm"
            >
              Process Resume with AI
            </button>
          )}
        </div>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-stone-500 text-sm bg-stone-50">
        <p>© {new Date().getFullYear()} Primefolio. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default UploadResume;
