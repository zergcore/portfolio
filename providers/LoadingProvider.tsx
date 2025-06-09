'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import SpiralLoader from '@/components/loader'

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [minTimeReached, setMinTimeReached] = useState(false);

  const handleLoadingComplete = () => {
    if (minTimeReached) {
      setIsLoading(false);
      setTimeout(() => setShowLoader(false), 300);
    }
  };

  useEffect(() => {
    // Minimum loading time
    const minLoadTime = setTimeout(() => {
      setMinTimeReached(true);
      if (!isLoading) {
        handleLoadingComplete();
      }
    }, 6000); // Minimum 6 seconds

    const maxLoadTime = setTimeout(() => {
        setMinTimeReached(true);
        handleLoadingComplete();
    }, 15000); // Max 5 seconds

    return () =>{
      clearTimeout(minLoadTime);
      clearTimeout(maxLoadTime)
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && minTimeReached) {
      handleLoadingComplete();
    }
  }, [isLoading, minTimeReached]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, handleLoadingComplete }}>
      {showLoader && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: isLoading ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: isLoading ? 'auto' : 'none'
        }}>
          <SpiralLoader onComplete={handleLoadingComplete} />
        </div>
      )}
      <div style={{
        opacity: isLoading ? 0 : 1,
        transition: 'opacity 0.3s ease-in',
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </LoadingContext.Provider>
  );
};
