// frontend/src/pages/TryOn.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  CameraIcon, 
  ArrowPathIcon, 
  PhotoIcon,
  ShoppingBagIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

const TryOn = () => {
  const [activeTab, setActiveTab] = useState('lips');
  const [cameraActive, setCameraActive] = useState(false);
  const [imageSource, setImageSource] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const productCategories = [
    { id: 'lips', name: 'Lipstick & Gloss' },
    { id: 'eyes', name: 'Eye Makeup' },
    { id: 'face', name: 'Foundation' },
    { id: 'blush', name: 'Blush & Highlighter' }
  ];
  
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
        colors: ['#FFB6C1', '#D3D3D3', '#DEB887', '#FF7F7F'],
        image: '/images/product-lipstick-beige.jpg',
        virtualImage: '/images/virtual-lipstick-beige.png' 
      },
      { 
        id: 2, 
        name: 'Glossy Lip Oil', 
        category: 'lips', 
        price: 399, 
        originalPrice: 599, 
        colors: ['#FFB6C1', '#FF7F7F'],
        image: '/images/product-lip-oil.jpg',
        virtualImage: '/images/virtual-lip-oil.png' 
      },
      { 
        id: 3, 
        name: 'Matte Red Lipstick', 
        category: 'lips', 
        price: 549, 
        originalPrice: 899, 
        colors: ['#FF0000', '#C70039'],
        image: '/images/product-lipstick-red.jpg',
        virtualImage: '/images/virtual-lipstick-red.png' 
      },
      { 
        id: 4, 
        name: 'Velvet Matte Eyeliner', 
        category: 'eyes', 
        price: 349, 
        originalPrice: 499, 
        colors: ['#000000', '#8B4513'],
        image: '/images/product-eyeliner.jpg',
        virtualImage: '/images/virtual-eyeliner.png' 
      },
      { 
        id: 5, 
        name: 'Volume Mascara', 
        category: 'eyes', 
        price: 399, 
        originalPrice: 599, 
        colors: ['#000000'],
        image: '/images/product-mascara.jpg',
        virtualImage: '/images/virtual-mascara.png' 
      },
      { 
        id: 6, 
        name: 'Silk Foundation Medium', 
        category: 'face', 
        price: 799, 
        originalPrice: 1299, 
        colors: ['#E3BC9A', '#D2B48C', '#BC8F8F'],
        image: '/images/product-foundation.jpg',
        virtualImage: '/images/virtual-foundation.png' 
      },
      { 
        id: 7, 
        name: 'Rose Gold Highlighter', 
        category: 'blush', 
        price: 599, 
        originalPrice: 899, 
        colors: ['#FFD700', '#F0E68C', '#FFC0CB'],
        image: '/images/product-highlighter.jpg',
        virtualImage: '/images/virtual-highlighter.png' 
      },
      { 
        id: 8, 
        name: 'Warm Peach Blush', 
        category: 'blush', 
        price: 499, 
        originalPrice: 799, 
        colors: ['#FFDAB9', '#FFE4B5', '#FFC0CB'],
        image: '/images/product-blush.jpg',
        virtualImage: '/images/virtual-blush.png' 
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
        video: { facingMode: 'user' }
      });
      
      // Set video source to camera
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access your camera. Please make sure you have a camera connected and have granted permission to use it.');
    }
  };
  
  // Handle stopping the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSource(event.target.result);
      };
      reader.readAsDataURL(file);
      stopCamera();
    }
  };
  
  // Handle taking a photo
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
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
    }
  };
  
  // Reset image/camera
  const resetImage = () => {
    setImageSource(null);
    setSelectedProduct(null);
  };
  
  // Select a product to try on
  const selectProduct = (product) => {
    setSelectedProduct(product);
  };
  
  // Toggle wishlist
  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  // Add to cart
  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      selectedColor: product.colors ? product.colors[0] : null,
      quantity: 1
    });
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
                        src={imageSource}
                        alt="Your photo"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Virtual Try On Overlay */}
                      {selectedProduct && (
                        <div className="absolute inset-0 pointer-events-none">
                          <img
                            src={selectedProduct.virtualImage}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover opacity-80"
                          />
                        </div>
                      )}
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
                  
                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    {!cameraActive && !imageSource && (
                      <button
                        onClick={activateCamera}
                        className="bg-primary text-white px-4 py-2 rounded-full shadow hover:bg-primary-dark flex items-center"
                      >
                        <CameraIcon className="h-5 w-5 mr-2" />
                        Start Camera
                      </button>
                    )}
                    
                    {cameraActive && !imageSource && (
                      <button
                        onClick={takePhoto}
                        className="bg-primary text-white px-4 py-2 rounded-full shadow hover:bg-primary-dark"
                      >
                        Take Photo
                      </button>
                    )}
                    
                    {imageSource && (
                      <button
                        onClick={resetImage}
                        className="bg-neutral-800 text-white px-4 py-2 rounded-full shadow hover:bg-neutral-900 flex items-center"
                      >
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Reset
                      </button>
                    )}
                    
                    {/* File upload button */}
                    <label className="bg-neutral-800 text-white px-4 py-2 rounded-full shadow hover:bg-neutral-900 flex items-center cursor-pointer">
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
                
                {/* Hidden canvas for taking photos */}
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Try On Instructions */}
                <div className="mt-6 bg-neutral-100 rounded-lg p-4">
                  <h3 className="text-base font-medium text-neutral-800 mb-2">How it works:</h3>
                  <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-1">
                    <li>Activate your camera or upload a photo</li>
                    <li>Browse products from the categories on the right</li>
                    <li>Click on any product to see how it looks on you</li>
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
                                {product.colors.slice(0, 3).map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-4 h-4 rounded-full border border-neutral-300"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                                {product.colors.length > 3 && (
                                  <span className="text-xs text-neutral-500">+{product.colors.length - 3}</span>
                                )}
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
                  
                  {/* View Product Link */}
                  <div className="mt-4 flex space-x-3">
                    <Link
                      to={`/product/${selectedProduct.id}`}
                      className="flex-1 py-2 text-center border border-neutral-300 rounded text-neutral-700 bg-white hover:bg-neutral-50"
                    >
                      View Details
                    </Link>
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