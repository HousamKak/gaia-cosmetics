import { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import * as faceapi from 'face-api.js';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { 
  CameraIcon, 
  ArrowPathIcon, 
  PhotoIcon,
  ShoppingBagIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const TryOn = () => {
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('lips');
  const [cameraActive, setCameraActive] = useState(false);
  const [imageSource, setImageSource] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectedFace, setDetectedFace] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [colorIntensity, setColorIntensity] = useState(0.8);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const photoRef = useRef(null);
  const faceCanvasRef = useRef(null);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const productCategories = [
    { id: 'lips', name: 'Lipstick & Gloss' },
    { id: 'eyes', name: 'Eye Makeup' },
    { id: 'face', name: 'Foundation' },
    { id: 'blush', name: 'Blush & Highlighter' }
  ];
  
  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setProcessing(true);
        
        // Load models from public folder
        await Promise.all([
          faceapi.nets.tinyFaceDetector.load('/models'),
          faceapi.nets.faceLandmark68Net.load('/models'),
          faceapi.nets.faceRecognitionNet.load('/models')
        ]);
        
        setModelsLoaded(true);
        setProcessing(false);
      } catch (error) {
        console.error('Error loading face detection models:', error);
        showError('Failed to load face detection models. Please refresh the page.');
        setProcessing(false);
      }
    };
    
    loadModels();
    
    return () => {
      // Clean up video stream when component unmounts
      stopCamera();
    };
  }, []);
  
  // Set up product data
  useEffect(() => {
    // In a real app, this would come from an API
    const products = [
      { 
        id: 1, 
        name: 'Plush Warm Beige', 
        category: 'lips', 
        price: 499, 
        originalPrice: 999, 
        colors: [
          {name: 'Warm Beige', value: '#DEB887'},
          {name: 'Dusty Rose', value: '#D8A4B1'},
          {name: 'Soft Coral', value: '#E8927C'}
        ],
        image: '/images/product-lipstick-beige.jpg',
        regions: ['lips'],
        applicationMethod: 'overlay'
      },
      { 
        id: 2, 
        name: 'Glossy Lip Oil', 
        category: 'lips', 
        price: 399, 
        originalPrice: 599, 
        colors: [
          {name: 'Pink Shimmer', value: '#FFB6C1'},
          {name: 'Clear Shine', value: '#FFF5EE'} 
        ],
        image: '/images/product-lip-oil.jpg',
        regions: ['lips'],
        applicationMethod: 'highlight'
      },
      { 
        id: 3, 
        name: 'Matte Red Lipstick', 
        category: 'lips', 
        price: 549, 
        originalPrice: 899, 
        colors: [
          {name: 'Classic Red', value: '#FF0000'},
          {name: 'Wine Red', value: '#C70039'}
        ],
        image: '/images/product-lipstick-red.jpg',
        regions: ['lips'],
        applicationMethod: 'overlay' 
      },
      { 
        id: 4, 
        name: 'Velvet Matte Eyeliner', 
        category: 'eyes', 
        price: 349, 
        originalPrice: 499, 
        colors: [
          {name: 'Intense Black', value: '#000000'},
          {name: 'Deep Brown', value: '#8B4513'}
        ],
        image: '/images/product-eyeliner.jpg',
        regions: ['eyes'],
        applicationMethod: 'line'
      },
      { 
        id: 5, 
        name: 'Volume Mascara', 
        category: 'eyes', 
        price: 399, 
        originalPrice: 599, 
        colors: [{name: 'Ultra Black', value: '#000000'}],
        image: '/images/product-mascara.jpg',
        regions: ['eyes'],
        applicationMethod: 'enhance'
      },
      { 
        id: 6, 
        name: 'Silk Foundation Medium', 
        category: 'face', 
        price: 799, 
        originalPrice: 1299, 
        colors: [
          {name: 'Fair', value: '#F5DEB3'},
          {name: 'Medium', value: '#E3BC9A'},
          {name: 'Tan', value: '#D2B48C'},
          {name: 'Deep', value: '#BC8F8F'}
        ],
        image: '/images/product-foundation.jpg',
        regions: ['face'],
        applicationMethod: 'base'
      },
      { 
        id: 7, 
        name: 'Rose Gold Highlighter', 
        category: 'blush', 
        price: 599, 
        originalPrice: 899, 
        colors: [
          {name: 'Rose Gold', value: '#FFD700'},
          {name: 'Champagne', value: '#F0E68C'},
          {name: 'Pink Pearl', value: '#FFC0CB'}
        ],
        image: '/images/product-highlighter.jpg',
        regions: ['cheeks', 'browbone'],
        applicationMethod: 'highlight'
      },
      { 
        id: 8, 
        name: 'Warm Peach Blush', 
        category: 'blush', 
        price: 499, 
        originalPrice: 799, 
        colors: [
          {name: 'Peach', value: '#FFDAB9'},
          {name: 'Coral', value: '#FF7F50'},
          {name: 'Rose', value: '#FFB6C1'}
        ],
        image: '/images/product-blush.jpg',
        regions: ['cheeks'],
        applicationMethod: 'blend'
      }
    ];
    
    setAllProducts(products);
    filterProductsByCategory(activeTab, products);
  }, []);
  
  useEffect(() => {
    filterProductsByCategory(activeTab, allProducts);
  }, [activeTab]);
  
  const filterProductsByCategory = (category, products) => {
    if (!products) return;
    setFilteredProducts(products.filter(product => product.category === category));
  };
  
  // Handle camera activation
  const activateCamera = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      // Set video source to camera
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
      
      setCameraActive(true);
      
      // Start face detection if models are loaded
      if (modelsLoaded) {
        startFaceDetection();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      showError('Unable to access your camera. Please make sure you have a camera connected and have granted permission to use it.');
    }
  };
  
  // Start face detection loop
  const startFaceDetection = () => {
    if (!modelsLoaded || !videoRef.current) return;
    
    // Create detection loop
    const detectFace = async () => {
      if (!videoRef.current || !cameraActive) return;
      
      try {
        const detections = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();
        
        if (detections) {
          setDetectedFace(detections);
          
          // If a product is selected, apply it to the detected face
          if (selectedProduct && imageSource) {
            applyMakeup(detections);
          }
        }
        
        // Continue detection loop if camera is still active
        if (cameraActive) {
          requestAnimationFrame(detectFace);
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    };
    
    // Start detection loop
    detectFace();
  };
  
  // Handle stopping the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setDetectedFace(null);
  };
  
  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setProcessing(true);
        
        // Create file URL
        const imageUrl = URL.createObjectURL(file);
        setImageSource(imageUrl);
        
        // Load image for processing
        const img = new Image();
        img.src = imageUrl;
        
        img.onload = async () => {
          // Clear previous detection
          setDetectedFace(null);
          
          // Load image to photo reference
          if (photoRef.current) {
            photoRef.current.src = imageUrl;
            photoRef.current.onload = async () => {
              // Detect face in uploaded image
              if (modelsLoaded && photoRef.current) {
                try {
                  const detections = await faceapi.detectSingleFace(
                    photoRef.current, 
                    new faceapi.TinyFaceDetectorOptions()
                  ).withFaceLandmarks();
                  
                  if (detections) {
                    setDetectedFace(detections);
                    
                    // If a product is selected, apply it
                    if (selectedProduct) {
                      applyMakeup(detections);
                    }
                  } else {
                    showError('No face detected in the uploaded image. Please try another photo.');
                  }
                } catch (error) {
                  console.error('Error detecting face in image:', error);
                  showError('Error processing the image. Please try another photo.');
                }
              }
              
              setProcessing(false);
            };
          }
        };
        
        // Stop camera if it's active
        stopCamera();
      } catch (error) {
        console.error('Error processing uploaded file:', error);
        showError('Failed to process the uploaded image. Please try again.');
        setProcessing(false);
      }
    }
  };
  
  // Handle taking a photo
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        setProcessing(true);
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        setImageSource(dataUrl);
        
        // Process the captured image
        if (photoRef.current) {
          photoRef.current.src = dataUrl;
          photoRef.current.onload = () => {
            // Apply makeup if a product is selected
            if (selectedProduct && detectedFace) {
              applyMakeup(detectedFace);
            }
            setProcessing(false);
          };
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        showError('Failed to capture photo. Please try again.');
        setProcessing(false);
      }
    }
  };
  
  // Apply makeup based on the selected product and detected face
  const applyMakeup = (faceDetection) => {
    if (!selectedProduct || !faceDetection || !faceCanvasRef.current || !photoRef.current) return;
    
    const canvas = faceCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = photoRef.current;
    
    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Get facial landmarks
    const landmarks = faceDetection.landmarks;
    
    // Apply makeup based on product category and application method
    const selectedColor = selectedProduct.colors && selectedProduct.colors.length > 0 ? 
      selectedProduct.colors[0].value : '#FF0000';
      
    // Apply based on product type and region
    switch (selectedProduct.category) {
      case 'lips':
        applyLipProduct(ctx, landmarks, selectedColor);
        break;
      case 'eyes':
        if (selectedProduct.applicationMethod === 'line') {
          applyEyeliner(ctx, landmarks, selectedColor);
        } else {
          applyEyeMakeup(ctx, landmarks, selectedColor);
        }
        break;
      case 'face':
        applyFoundation(ctx, landmarks, selectedColor);
        break;
      case 'blush':
        applyBlush(ctx, landmarks, selectedColor);
        break;
      default:
        break;
    }
  };
  
  // Apply lip product
  const applyLipProduct = (ctx, landmarks, color) => {
    const points = landmarks.getMouth();
    
    // Create a path for the lips
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    // Upper lip
    for (let i = 1; i < 7; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    // Lower lip
    for (let i = 12; i > 6; i--) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.closePath();
    
    // Apply color with transparency for realism
    ctx.fillStyle = hexToRgba(color, colorIntensity);
    ctx.fill();
    
    // Add slight shine
    if (selectedProduct.applicationMethod === 'highlight') {
      ctx.beginPath();
      ctx.moveTo(points[3].x - 5, points[3].y - 2);
      ctx.quadraticCurveTo(
        points[4].x, points[4].y - 5,
        points[5].x + 5, points[5].y - 2
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  };
  
  // Apply eyeliner
  const applyEyeliner = (ctx, landmarks, color) => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    // Draw eyeliner
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    
    // Left eye
    ctx.beginPath();
    ctx.moveTo(leftEye[0].x, leftEye[0].y);
    for (let i = 1; i < leftEye.length; i++) {
      ctx.lineTo(leftEye[i].x, leftEye[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Right eye
    ctx.beginPath();
    ctx.moveTo(rightEye[0].x, rightEye[0].y);
    for (let i = 1; i < rightEye.length; i++) {
      ctx.lineTo(rightEye[i].x, rightEye[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Winged tips for dramatic eyeliner
    ctx.beginPath();
    ctx.moveTo(leftEye[0].x, leftEye[0].y);
    ctx.lineTo(leftEye[0].x - 5, leftEye[0].y - 5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(rightEye[3].x, rightEye[3].y);
    ctx.lineTo(rightEye[3].x + 5, rightEye[3].y - 5);
    ctx.stroke();
  };
  
  // Apply eye makeup (eyeshadow, mascara)
  const applyEyeMakeup = (ctx, landmarks, color) => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    // Create eyeshadow region (above the eye)
    const createEyeshadowRegion = (eyePoints) => {
      const topPoint = { x: eyePoints[1].x, y: eyePoints[1].y - 10 };
      const endPoint = { x: eyePoints[4].x, y: eyePoints[4].y - 8 };
      
      ctx.beginPath();
      ctx.moveTo(eyePoints[0].x, eyePoints[0].y);
      
      // Top eyelid
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(eyePoints[i].x, eyePoints[i].y);
      }
      
      // Extended eyeshadow region
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.quadraticCurveTo(
        eyePoints[2].x, eyePoints[2].y - 15,
        topPoint.x, topPoint.y
      );
      ctx.quadraticCurveTo(
        eyePoints[0].x, eyePoints[0].y - 15,
        eyePoints[0].x, eyePoints[0].y
      );
      
      ctx.closePath();
    };
    
    // Apply eyeshadow to left eye
    createEyeshadowRegion(leftEye);
    ctx.fillStyle = hexToRgba(color, colorIntensity * 0.7);
    ctx.fill();
    
    // Apply eyeshadow to right eye
    createEyeshadowRegion(rightEye);
    ctx.fillStyle = hexToRgba(color, colorIntensity * 0.7);
    ctx.fill();
  };
  
  // Apply foundation
  const applyFoundation = (ctx, landmarks, color) => {
    const jaw = landmarks.getJawOutline();
    const nose = landmarks.getNose();
    
    // Get bounds of face
    const minX = Math.min(...jaw.map(pt => pt.x));
    const maxX = Math.max(...jaw.map(pt => pt.x));
    const minY = Math.min(...jaw.map(pt => pt.y));
    const maxY = Math.max(...jaw.map(pt => pt.y));
    
    // Create a gradient for more realistic foundation
    const gradient = ctx.createRadialGradient(
      nose[0].x, nose[0].y, 5, 
      nose[0].x, nose[0].y, maxX - minX
    );
    
    gradient.addColorStop(0, hexToRgba(color, colorIntensity * 0.6));
    gradient.addColorStop(1, hexToRgba(color, 0));
    
    // Apply foundation over face
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(jaw[0].x, jaw[0].y);
    
    // Draw jaw outline
    for (let i = 1; i < jaw.length; i++) {
      ctx.lineTo(jaw[i].x, jaw[i].y);
    }
    
    // Close the top of the face with an arc
    ctx.arc(
      (jaw[0].x + jaw[jaw.length - 1].x) / 2, 
      minY - 30, 
      (maxX - minX) / 2 + 20, 
      Math.PI, 0, true
    );
    
    ctx.closePath();
    ctx.fill();
  };
  
  // Apply blush
  const applyBlush = (ctx, landmarks, color) => {
    const nose = landmarks.getNose();
    const jaw = landmarks.getJawOutline();
    
    // Apply to left cheek
    ctx.beginPath();
    const leftCenterX = (jaw[2].x + nose[0].x) / 2;
    const leftCenterY = (jaw[2].y + nose[0].y) / 2;
    
    // Create a radial gradient for more realistic blush
    const leftGradient = ctx.createRadialGradient(
      leftCenterX, leftCenterY, 5,
      leftCenterX, leftCenterY, 30
    );
    
    leftGradient.addColorStop(0, hexToRgba(color, colorIntensity * 0.7));
    leftGradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = leftGradient;
    ctx.arc(leftCenterX, leftCenterY, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply to right cheek
    ctx.beginPath();
    const rightCenterX = (jaw[14].x + nose[0].x) / 2;
    const rightCenterY = (jaw[14].y + nose[0].y) / 2;
    
    // Create a radial gradient for more realistic blush
    const rightGradient = ctx.createRadialGradient(
      rightCenterX, rightCenterY, 5,
      rightCenterX, rightCenterY, 30
    );
    
    rightGradient.addColorStop(0, hexToRgba(color, colorIntensity * 0.7));
    rightGradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = rightGradient;
    ctx.arc(rightCenterX, rightCenterY, 30, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Reset image/camera
  const resetImage = () => {
    setImageSource(null);
    setSelectedProduct(null);
    setDetectedFace(null);
    
    // Clear canvases
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    if (faceCanvasRef.current) {
      const context = faceCanvasRef.current.getContext('2d');
      context.clearRect(0, 0, faceCanvasRef.current.width, faceCanvasRef.current.height);
    }
  };
  
  // Select a product to try on
  const selectProduct = (product) => {
    setSelectedProduct(product);
    
    // Apply makeup if a face is already detected
    if (detectedFace && (imageSource || cameraActive)) {
      applyMakeup(detectedFace);
    }
  };
  
  // Toggle wishlist
  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showSuccess('Product removed from wishlist');
    } else {
      addToWishlist(product);
      showSuccess('Product added to wishlist');
    }
  };
  
  // Add to cart
  const handleAddToCart = (product) => {
    const color = product.colors && product.colors.length > 0 ? product.colors[0].value : null;
    
    addToCart({
      ...product,
      selectedColor: color,
      quantity: 1
    });
    
    showSuccess('Product added to cart');
  };
  
  // Handle color intensity change
  const handleIntensityChange = (e) => {
    setColorIntensity(parseFloat(e.target.value));
    
    // Reapply makeup with new intensity if a face is detected
    if (detectedFace && selectedProduct) {
      applyMakeup(detectedFace);
    }
  };
  
  // Select product color
  const handleColorSelect = (color) => {
    if (!selectedProduct || !selectedProduct.colors) return;
    
    // Update selected product with new selected color
    setSelectedProduct({
      ...selectedProduct,
      colors: [
        color,
        ...selectedProduct.colors.filter(c => c.value !== color.value)
      ]
    });
    
    // Reapply makeup with new color
    if (detectedFace) {
      setTimeout(() => applyMakeup(detectedFace), 0);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-heading font-bold mb-2">Virtual Try On</h1>
        <p className="text-neutral-600 mb-6">
          Try on makeup virtually using your camera or by uploading a photo.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera/Image View - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-900">Your Look</h2>
              </div>
              
              <div className="p-4">
                <div className="aspect-w-16 aspect-h-12 bg-neutral-100 rounded-lg overflow-hidden relative">
                  {/* Camera View */}
                  {cameraActive && !imageSource && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Image View */}
                  {imageSource && (
                    <div className="relative w-full h-full">
                      <img
                        ref={photoRef}
                        src={imageSource}
                        alt="Your photo"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Makeup Canvas Overlay */}
                      <canvas 
                        ref={faceCanvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />
                    </div>
                  )}
                  
                  {/* Placeholder when no camera or image */}
                  {!cameraActive && !imageSource && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="p-4 bg-neutral-200 rounded-full mb-4">
                        <CameraIcon className="h-12 w-12 text-neutral-500" />
                      </div>
                      <p className="text-lg text-neutral-600">
                        Activate your camera or upload a photo to get started
                      </p>
                    </div>
                  )}
                  
                  {/* Loading Overlay */}
                  {processing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    {!cameraActive && !imageSource && (
                      <button
                        onClick={activateCamera}
                        className="bg-primary text-white px-4 py-2 rounded-full shadow hover:bg-primary-dark flex items-center"
                        disabled={processing}
                      >
                        <CameraIcon className="h-5 w-5 mr-2" />
                        Start Camera
                      </button>
                    )}
                    
                    {cameraActive && !imageSource && (
                      <button
                        onClick={takePhoto}
                        className="bg-primary text-white px-4 py-2 rounded-full shadow hover:bg-primary-dark"
                        disabled={processing}
                      >
                        Take Photo
                      </button>
                    )}
                    
                    {imageSource && (
                      <button
                        onClick={resetImage}
                        className="bg-neutral-800 text-white px-4 py-2 rounded-full shadow hover:bg-neutral-900 flex items-center"
                        disabled={processing}
                      >
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Reset
                      </button>
                    )}
                    
                    {/* File upload button */}
                    <label className={`bg-neutral-800 text-white px-4 py-2 rounded-full shadow hover:bg-neutral-900 flex items-center cursor-pointer ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={processing}
                      />
                    </label>
                  </div>
                </div>
                
                {/* Hidden canvas for taking photos */}
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Color Intensity Slider - Only shown when a product is selected */}
                {selectedProduct && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Color Intensity
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={colorIntensity}
                      onChange={handleIntensityChange}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-neutral-500 mt-1">
                      <span>Subtle</span>
                      <span>Intense</span>
                    </div>
                  </div>
                )}
                
                {/* Try On Instructions */}
                <div className="mt-6 bg-neutral-100 rounded-lg p-4">
                  <h3 className="text-base font-medium text-neutral-800 mb-2">How it works:</h3>
                  <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-1">
                    <li>Activate your camera or upload a photo</li>
                    <li>Browse products from the categories on the right</li>
                    <li>Click on any product to see how it looks on you</li>
                    <li>Adjust color intensity with the slider</li>
                    <li>Try different color options</li>
                    <li>Add your favorite products to cart or wishlist</li>
                  </ol>
                  <p className="text-xs text-neutral-500 mt-2">
                    Note: Virtual try-on is an approximation. Colors may appear different in person.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Selection - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-900">Select Products</h2>
              </div>
              
              {/* Category Tabs */}
              <div className="border-b border-neutral-200">
                <div className="flex overflow-x-auto">
                  {productCategories.map((category) => (
                    <button
                      key={category.id}
                      className={`py-3 px-4 text-sm font-medium whitespace-nowrap ${
                        activeTab === category.id
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                      }`}
                      onClick={() => setActiveTab(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Product List */}
              <div className="p-4 max-h-[500px] overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">
                    No products found in this category
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedProduct?.id === product.id
                            ? 'border-primary shadow-md'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => selectProduct(product)}
                      >
                        <div className="flex p-3">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-neutral-100 rounded overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-neutral-900">{product.name}</h3>
                            <p className="text-sm text-neutral-500">{product.category}</p>
                            
                            <div className="flex items-center mt-1">
                              <span className="text-sm font-medium text-neutral-900">₹{product.price}</span>
                              {product.originalPrice > product.price && (
                                <span className="ml-2 text-xs text-neutral-500 line-through">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                            </div>
                            
                            {/* Color Swatches */}
                            {product.colors && product.colors.length > 0 && (
                              <div className="flex mt-2 space-x-1">
                                {product.colors.map((color, index) => (
                                  <button
                                    key={index}
                                    className={`w-4 h-4 rounded-full border ${
                                      selectedProduct?.id === product.id && index === 0
                                        ? 'ring-2 ring-primary ring-offset-1' 
                                        : 'border-neutral-300'
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleColorSelect(color);
                                    }}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex border-t border-neutral-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product);
                            }}
                            className="flex-1 py-2 text-sm text-neutral-600 hover:text-neutral-900 flex items-center justify-center"
                          >
                            {isInWishlist(product.id) ? (
                              <HeartIconSolid className="h-4 w-4 text-accent mr-1" />
                            ) : (
                              <HeartIcon className="h-4 w-4 mr-1" />
                            )}
                            <span>{isInWishlist(product.id) ? 'Saved' : 'Save'}</span>
                          </button>
                          
                          <div className="border-r border-neutral-200"></div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="flex-1 py-2 text-sm text-neutral-600 hover:text-neutral-900 flex items-center justify-center"
                          >
                            <ShoppingBagIcon className="h-4 w-4 mr-1" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Selected Product Details */}
            {selectedProduct && (
              <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-neutral-200">
                  <h2 className="text-lg font-medium text-neutral-900">Selected Product</h2>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-neutral-900">{selectedProduct.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm font-medium text-neutral-900">₹{selectedProduct.price}</span>
                        {selectedProduct.originalPrice > selectedProduct.price && (
                          <span className="ml-2 text-xs text-neutral-500 line-through">
                            ₹{selectedProduct.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Selection */}
                  {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-neutral-900 mb-2">Available Colors:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map((color, index) => (
                          <button
                            key={index}
                            className={`w-8 h-8 rounded-full border ${
                              index === 0 ? 'ring-2 ring-primary ring-offset-1' : 'border-neutral-300'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => handleColorSelect(color)}
                            title={color.name}
                          >
                            <span className="sr-only">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* View Product Link */}
                  <div className="mt-4 flex space-x-3">
                    <a
                      href={`/product/${selectedProduct.id}`}
                      className="flex-1 py-2 text-center border border-neutral-300 rounded text-neutral-700 bg-white hover:bg-neutral-50"
                    >
                      View Details
                    </a>
                    <button
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="flex-1 py-2 text-center border border-transparent rounded text-white bg-primary hover:bg-primary-dark"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryOn;