// frontend/src/hooks/useOutsideClick.js
import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a specified element
 * @param {Function} callback - Function to call when a click outside is detected
 * @param {Array} deps - Dependency array for the useEffect hook
 * @returns {React.RefObject} - Ref to attach to the element
 */
function useOutsideClick(callback, deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, ...deps]);

  return ref;
}

export default useOutsideClick;