// frontend/src/pages/Wishlist.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { 
  HeartIcon, 
  ShoppingCartIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState({});

  const handleRemoveItem = (id) => {
    removeFromWishlist(id);
  };

  const handleAddToCart = (item) => {
    const color = selectedColor[item.id] || (item.colors && item.colors.length > 0 ? item.colors[0] : null);
    
    addToCart({
      ...item,
      selectedColor: color,
      quantity: 1
    });
  };

  const handleColorSelect = (itemId, color) => {
    setSelectedColor(prev => ({
      ...prev,
      [itemId]: color
    }));
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist();
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold">My Wishlist</h1>
          <Link 
            to="/" 
            className="text-sm text-primary hover:text-primary-dark flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Continue Shopping
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-block p-4 bg-neutral-100 rounded-full mb-4">
              <HeartIcon className="h-12 w-12 text-neutral-400" />
            </div>
            <h2 className="text-xl font-medium text-neutral-900 mb-2">Your wishlist is empty</h2>
            <p className="text-neutral-500 mb-6">Save items you like to your wishlist and revisit them later.</p>
            <Link 
              to="/category/makeup" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearWishlist}
                className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Clear Wishlist
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-900">Saved Items ({wishlistItems.length})</h2>
              </div>
              
              <ul className="divide-y divide-neutral-200">
                {wishlistItems.map((item) => (
                  <li key={item.id} className="px-6 py-6">
                    <div className="flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-full sm:w-40 h-40 sm:h-40 bg-neutral-100 rounded overflow-hidden mb-4 sm:mb-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="sm:ml-6 flex-1">
                        <div className="flex flex-col sm:flex-row justify-between">
                          <div>
                            <h3 className="text-base font-medium text-neutral-900">
                              <Link to={`/product/${item.id}`} className="hover:text-primary">
                                {item.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-neutral-500 mt-1">{item.category}</p>
                            
                            {/* Pricing */}
                            <div className="mt-2">
                              <p className="text-base font-medium text-neutral-900">₹{item.price}</p>
                              {item.originalPrice > item.price && (
                                <div className="flex items-center">
                                  <p className="text-sm text-neutral-500 line-through mr-2">₹{item.originalPrice}</p>
                                  <p className="text-sm text-accent">
                                    {Math.round((item.originalPrice - item.price) / item.originalPrice * 100)}% OFF
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Color Selection */}
                            {item.colors && item.colors.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm text-neutral-600 mb-2">Color:</p>
                                <div className="flex space-x-2">
                                  {item.colors.map((color, index) => (
                                    <button
                                      key={index}
                                      className={`w-8 h-8 rounded-full border ${
                                        selectedColor[item.id] === color 
                                          ? 'ring-2 ring-primary ring-offset-1' 
                                          : 'border-neutral-300'
                                      }`}
                                      style={{ backgroundColor: typeof color === 'string' ? color : color.value }}
                                      onClick={() => handleColorSelect(item.id, typeof color === 'string' ? color : color.value)}
                                      title={typeof color === 'string' ? '' : color.name}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col gap-3 justify-end">
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                            >
                              <ShoppingCartIcon className="h-4 w-4 mr-1" />
                              Add to Cart
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="inline-flex items-center px-3 py-2 border border-neutral-300 text-sm font-medium rounded-md shadow-sm text-neutral-700 bg-white hover:bg-neutral-50"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;