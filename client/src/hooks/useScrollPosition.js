// frontend/src/hooks/useScrollPosition.js
import { useState, useEffect } from 'react';

/**
 * Custom hook to track scroll position
 * @returns {Object} - Object containing scroll position information
 */
function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({
    scrollX: 0,
    scrollY: 0,
    direction: 'none',
    lastScrollY: 0,
  });

  useEffect(() => {
    let ticking = false;
    
    const updatePosition = () => {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const direction = scrollY > scrollPosition.lastScrollY ? 'down' : 'up';
      
      setScrollPosition({
        scrollX,
        scrollY,
        direction,
        lastScrollY: scrollY,
      });
      
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updatePosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollPosition.lastScrollY]);

  return scrollPosition;
}

export default useScrollPosition;