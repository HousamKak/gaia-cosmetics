// frontend/src/components/common/Modal.jsx
import { Fragment, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Modal component for displaying content in an overlay
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} props.title - Modal title
 * @param {ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size (sm, md, lg, xl, full)
 * @param {boolean} props.closeOnOutsideClick - Whether to close modal when clicking outside
 * @param {boolean} props.showCloseButton - Whether to show the close button
 * @param {string} props.className - Additional CSS classes for modal content
 * @returns {JSX.Element|null} Rendered component
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnOutsideClick = true,
  showCloseButton = true,
  className = ''
}) => {
  const modalRef = useRef(null);
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen, onClose]);
  
  // Handle clicks outside modal
  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Determine width class based on size prop
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'lg': return 'max-w-3xl';
      case 'xl': return 'max-w-5xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-lg'; // md is default
    }
  };
  
  // Don't render anything if the modal is closed
  if (!isOpen) return null;
  
  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleOutsideClick}
        aria-hidden="true"
      ></div>
      
      {/* Modal container */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal content */}
          <div
            ref={modalRef}
            className={`bg-white rounded-lg shadow-xl w-full ${getSizeClass()} transform transition-all ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal header */}
            {(title || showCloseButton) && (
              <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                {title && (
                  <h3 id="modal-title" className="text-lg font-medium text-neutral-900">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    className="text-neutral-400 hover:text-neutral-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">Close</span>
                  </button>
                )}
              </div>
            )}
            
            {/* Modal body */}
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Modal;