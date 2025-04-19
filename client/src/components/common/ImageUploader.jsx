// frontend/src/components/common/ImageUploader.jsx
import { useState, useRef, useEffect } from 'react';
import { 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  PhotoIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * Component for uploading and previewing images
 * @param {Object} props - Component props
 * @param {Function} props.onImageChange - Callback when image changes
 * @param {string} props.initialImage - Initial image URL
 * @param {string} props.label - Label text
 * @param {string} props.accept - Accepted file types (default: 'image/*')
 * @param {number} props.maxSizeMB - Maximum file size in MB (default: 5)
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @returns {JSX.Element} Rendered component
 */
const ImageUploader = ({ 
  onImageChange, 
  initialImage = null,
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 5,
  required = false,
  className = '',
  id = 'image-upload',
  name = 'image'
}) => {
  const [image, setImage] = useState(initialImage);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Update preview when initialImage changes
  useEffect(() => {
    setImage(initialImage);
    setPreview(initialImage);
  }, [initialImage]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Check file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }
    
    // Reset error
    setError(null);
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setImage(selectedFile);
    
    // Call callback function
    if (onImageChange) {
      setIsUploading(true);
      
      // Simulate upload delay in development
      // In production, this would be a real upload
      setTimeout(() => {
        onImageChange(selectedFile);
        setIsUploading(false);
      }, 1000);
    }
    
    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Clear selected image
  const handleClear = () => {
    setImage(null);
    setPreview(null);
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Call callback function
    if (onImageChange) {
      onImageChange(null);
    }
  };

  // Trigger file input click
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="mt-1 flex flex-col">
        {/* Preview container */}
        {preview ? (
          <div className="relative rounded-md overflow-hidden border border-neutral-300 mb-2 w-full aspect-w-16 aspect-h-9">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            
            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            
            {/* Remove button */}
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-neutral-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100"
            >
              <XMarkIcon className="h-5 w-5" />
              <span className="sr-only">Remove image</span>
            </button>
          </div>
        ) : (
          <div 
            onClick={handleClick}
            className="border-2 border-dashed border-neutral-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors"
          >
            <PhotoIcon className="h-12 w-12 text-neutral-400" />
            <p className="mt-2 text-sm text-neutral-500">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              PNG, JPG, WEBP up to {maxSizeMB}MB
            </p>
          </div>
        )}
        
        {/* File input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          name={name}
          accept={accept}
          onChange={handleFileChange}
          className="sr-only"
          required={required && !image}
        />
        
        {/* Error message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {/* Upload button (visible when no image is selected) */}
        {!preview && (
          <button
            type="button"
            onClick={handleClick}
            className="mt-3 inline-flex items-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Select Image
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;