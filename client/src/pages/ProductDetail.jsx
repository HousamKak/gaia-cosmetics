// frontend/src/pages/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { 
  HeartIcon, 
  CameraIcon, 
  ShieldCheckIcon, 
  TruckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import productService from '../services/product.service';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await productService.getProductById(id);
        
        if (response.data) {
          setProduct(response.data);
          
          // Set initial selected color if available
          if (response.data.colors && response.data.colors.length > 0) {
            setSelectedColor(response.data.colors[0].value);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      ...product,
      selectedColor,
      quantity
    });
    // Show some feedback to the user (could add a notification here)
  };

  const toggleWishlist = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Product not found'}</p>
        <Link 
          to="/"
          className="mt-4 inline-block px-4 py-2 bg-primary text-neutral-900 rounded hover:bg-primary-dark"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Find primary image or use first image
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images - Left Side */}
        <div className="relative">
          {/* Main Image */}
          <div className="aspect-w-1 aspect-h-1 md:aspect-h-1.3 bg-neutral-100 rounded-lg overflow-hidden">
            <img
              src={primaryImage?.imagePath || '/images/product-placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {/* Try On Button - Only visible on mobile */}
            <div className="md:hidden absolute bottom-4 right-4">
              <button className="flex items-center space-x-2 bg-neutral-800 bg-opacity-75 text-white px-3 py-2 rounded">
                <CameraIcon className="h-5 w-5" />
                <span>Try It On</span>
              </button>
            </div>
          </div>
          
          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="hidden md:grid grid-cols-3 gap-4 mt-4">
              {product.images.map((image, index) => (
                <button 
                  key={index}
                  className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden ${
                    image.isPrimary ? 'ring-2 ring-neutral-900' : ''
                  }`}
                >
                  <img
                    src={image.imagePath}
                    alt={`${product.name} - View ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Try On Button - Only visible on desktop */}
          <div className="hidden md:block mt-6">
            <Link to="/try-on" className="flex items-center space-x-2 border border-neutral-300 rounded px-4 py-2 hover:bg-neutral-50">
              <CameraIcon className="h-5 w-5" />
              <span>Virtual Try On</span>
            </Link>
          </div>
        </div>

        {/* Product Details - Right Side */}
        <div>
          {/* Shop Now Pay Later Banner */}
          <div className="mb-6 p-4 border border-neutral-200 rounded-lg flex items-center">
            <div className="flex-grow">
              <p className="font-medium">Shop now pay later with <span className="font-bold">Klarna</span>.</p>
              <button className="text-sm text-primary font-medium mt-1">Learn More ↓</button>
            </div>
            <img src="/icons/klarna.svg" alt="Klarna" className="h-8" />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl font-heading font-bold">{product.name}</h1>
            <p className="text-neutral-600 mt-1">{product.category}</p>
            
            {/* Pricing */}
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-2xl font-bold">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-neutral-500 line-through">₹{product.originalPrice}</span>
              )}
              {product.discountPercentage > 0 && (
                <span className="text-accent font-bold">({product.discountPercentage}% OFF)</span>
              )}
            </div>
            
            {/* Inventory Status */}
            {product.inventoryStatus === 'low-stock' && (
              <p className="mt-2 text-accent font-medium">{product.inventoryMessage || 'Only Few Left!'}</p>
            )}
            
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-neutral-900">Color</h3>
                <div className="mt-2 flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      style={{ backgroundColor: color.value }}
                      className={`w-8 h-8 rounded-full border ${
                        selectedColor === color.value ? 'ring-2 ring-neutral-900 ring-offset-1' : 'border-neutral-300'
                      }`}
                      onClick={() => setSelectedColor(color.value)}
                      aria-label={`Select color ${color.name}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity Selector */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-900">Quantity</h3>
              <div className="mt-2 flex items-center border border-neutral-300 rounded w-32">
                <button 
                  className="px-3 py-1 text-neutral-600"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center border-none focus:outline-none"
                />
                <button 
                  className="px-3 py-1 text-neutral-600"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={toggleWishlist}
                className={`flex items-center justify-center space-x-2 px-4 py-3 border ${
                  isInWishlist(product.id) 
                    ? 'border-accent text-accent' 
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                } rounded-md`}
              >
                {isInWishlist(product.id) ? (
                  <HeartIconSolid className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>Wishlist</span>
              </button>
              
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800"
              >
                <span>Add To Cart</span>
              </button>
            </div>
            
            {/* Return Policy */}
            <div className="mt-6 flex items-center text-sm text-neutral-500">
              <TruckIcon className="h-5 w-5 mr-2" />
              <span>Free shipping on orders over ₹999</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-neutral-500">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              <span>20 Days Easy Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tab.Group>
          <Tab.List className="flex space-x-8 border-b border-neutral-200">
            {['Description', 'Ingredients', 'How to Use', 'Reviews'].map((tab, index) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  classNames(
                    'py-4 text-sm font-medium focus:outline-none whitespace-nowrap',
                    selected
                      ? 'border-b-2 border-neutral-900 text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-700'
                  )
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-6">
            {/* Description Tab */}
            <Tab.Panel className="prose prose-sm max-w-none">
              <p>{product.description}</p>
            </Tab.Panel>

            {/* Ingredients Tab */}
            <Tab.Panel className="prose prose-sm max-w-none">
              <p>{product.ingredients || 'Ingredients information not available.'}</p>
            </Tab.Panel>

            {/* How to Use Tab */}
            <Tab.Panel className="prose prose-sm max-w-none">
              <p>{product.howToUse || 'Usage information not available.'}</p>
            </Tab.Panel>

            {/* Reviews Tab */}
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Rating Summary */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-5 w-5 ${
                            star < Math.floor(4.5)
                              ? 'text-yellow-400 fill-current'
                              : star < 4.5
                              ? 'text-yellow-400 fill-current'
                              : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 font-medium">4.5 out of 5</span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-4">127 customer ratings</p>
                  
                  {/* Rating Distribution */}
                  <div className="space-y-2">
                    {[
                      { stars: 5, percentage: 72 },
                      { stars: 4, percentage: 18 },
                      { stars: 3, percentage: 6 },
                      { stars: 2, percentage: 3 },
                      { stars: 1, percentage: 1 }
                    ].map((item) => (
                      <div key={item.stars} className="flex items-center">
                        <span className="w-12 text-sm">{item.stars} stars</span>
                        <div className="w-full bg-neutral-200 rounded-full h-2 ml-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-xs text-neutral-500 ml-2">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Customer Reviews - Would add actual reviews here */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Top Customer Reviews</h3>
                  <p className="text-neutral-500">No reviews yet. Be the first to review this product!</p>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default ProductDetail;