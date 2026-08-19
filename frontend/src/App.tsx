import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import * as Sentry from '@sentry/react';

interface ErrorFallbackProps {
  error: unknown;
}

function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-slate-400 text-sm">
          An unexpected error has occurred. Sentry has been notified and we are looking into the issue.
        </p>
        {!!error && (
          <div className="bg-slate-950 border border-slate-800/50 rounded-lg p-3 text-left text-xs font-mono text-rose-400/80 overflow-auto max-h-32">
            {error instanceof Error ? error.message : String(error)}
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={({ error }) => <ErrorFallback error={error} />}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}

export default App;
