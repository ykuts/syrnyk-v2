// hooks/useScrollToTop.js
import { useEffect } from 'react';

export const useScrollToTop = (dependency = true) => {
  useEffect(() => {
    if (dependency) {
      const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      
      const timeoutId = setTimeout(scrollToTop, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [dependency]);
};