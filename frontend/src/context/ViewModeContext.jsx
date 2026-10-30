import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewModeContext = createContext(null);

export const ViewModeProvider = ({ children }) => {
  // 'auto' | 'mobile' | 'desktop'
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem('ruang_laundry_view_mode') || 'auto';
  });

  const [isScreenMobile, setIsScreenMobile] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsScreenMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setViewMode = (mode) => {
    setPreference(mode);
    localStorage.setItem('ruang_laundry_view_mode', mode);
  };

  const isMobile =
    preference === 'mobile'
      ? true
      : preference === 'desktop'
      ? false
      : isScreenMobile;

  const toggleViewMode = () => {
    const next = isMobile ? 'desktop' : 'mobile';
    setViewMode(next);
  };

  return (
    <ViewModeContext.Provider
      value={{
        isMobile,
        preference,
        setViewMode,
        toggleViewMode,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error('useViewMode harus digunakan di dalam ViewModeProvider');
  }
  return ctx;
};

