'use client';

import { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  /** URL to the Spline scene (.splinecode file) */
  scene: string;
  /** CSS class to apply to the Spline canvas */
  className?: string;
  /** Callback fired when the scene finishes loading */
  onLoad?: (app: any) => void;
}

export function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
          }}
        >
          <LoadingSpinner />
        </div>
      }
    >
      <div className="hide-spline-watermark w-full h-full relative">
        <Spline scene={scene} className={className} onLoad={onLoad} />
      </div>
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <span
      className="inline-block animate-[spline-spin_0.8s_linear_infinite]"
      style={{
        width: 40,
        height: 40,
        border: '3px solid rgba(0, 0, 0, 0.1)',
        borderTopColor: '#1c1917',
        borderRadius: '50%',
      }}
    />
  );
}

if (typeof document !== 'undefined') {
  const styleId = 'spline-scene-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes spline-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}
