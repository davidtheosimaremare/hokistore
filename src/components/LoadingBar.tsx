"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const LoadingBar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(10);
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
    };

    // Listen to route changes
    let progressInterval: NodeJS.Timeout;
    
    if (isLoading) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading]);

  // Trigger loading on pathname change
  useEffect(() => {
    setIsLoading(true);
    setProgress(10);
    
    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-red-100">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ease-out shadow-lg"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.7)'
          }}
        />
      </div>
    </div>
  );
};

export default LoadingBar; 