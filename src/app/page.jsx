"use client";

import { useEffect, useState } from 'react';
import PhotoEditor from '../components/PhotoEditor';

export default function Home() {
  const [openCVLoaded, setOpenCVLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let progressInterval;
    
    const loadOpenCV = () => {
      const script = document.createElement('script');
      script.src = '/opencv.js';
      script.async = true;
      
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 200);
      
      script.onload = () => {
        if (window.cv) {
          window.cv.onRuntimeInitialized = () => {
            clearInterval(progressInterval);
            setLoadingProgress(100);
            
            setTimeout(() => {
              console.log('OpenCV loaded successfully');
              setOpenCVLoaded(true);
            }, 500);
          };
        }
      };
      
      script.onerror = () => {
        clearInterval(progressInterval);
        setError("Failed to load OpenCV. Please refresh the page and try again.");
      };
      
      document.body.appendChild(script);
    };
    
    setTimeout(loadOpenCV, 300);

    return () => {
      clearInterval(progressInterval);
      const script = document.querySelector('script[src="/opencv.js"]');
      if (script) document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-base-200">
      {openCVLoaded ? (
        <PhotoEditor />
      ) : (
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Loading PhotoPro Editor</h2>
            
            {error ? (
              <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            ) : (
              <>
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <div className="w-full mt-4">
                  <progress 
                    className="progress progress-primary w-full" 
                    value={loadingProgress} 
                    max="100"
                  ></progress>
                  <p className="text-sm mt-2">Loading OpenCV ({Math.round(loadingProgress)}%)</p>
                </div>
                <p className="text-xs text-base-content/70 mt-4">
                  This may take a moment on first load
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}