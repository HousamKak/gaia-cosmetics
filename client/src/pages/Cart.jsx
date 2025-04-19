// frontend/src/pages/Cart.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { 
  TrashIcon, 
  ShoppingBagIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, discount, shippingCost, total, applyPromoCode } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const navigate = useNavigate();

  const handleQuantityChange = (id, color, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, color, newQuantity);
  };

  const handleRemoveItem = (id, color) => {
    removeFromCart(id, color);
  };

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    const result = applyPromoCode(promoCode);
    
    if (result.valid) {
      setPromoSuccess(result.message);
      setPromoError('');
      setPromoCode('');
    } else {
      setPromoError(result.message);
      setPromoSuccess('');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-heading font-bold mb-6">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-block p-4 bg-neutral-100 rounded-full mb-4">
              <ShoppingBagIcon className="h-12 w-12 text-neutral-400" />
            </div>
            <h2 className="text-xl font-medium text-neutral-900 mb-2">Your cart is empty</h2>
            <p className="text-neutral-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Link 
              to="/category/makeup" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Side */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between">
                  <h2 className="text-lg font-medium text-neutral-900">Cart Items ({cartItems.length})</h2>
                  <Link 
                    to="/category/makeup" 
                    className="text-sm text-primary hover:text-primary-dark flex items-center"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Continue Shopping
                  </Link>
                </div>
                
                <ul className="divide-y divide-neutral-200">
                  {cartItems.map((item) => {
                    const colorObj = item.colors?.find(color => color.value === item.selectedColor);
                    const colorName = colorObj?.name || '';
                    
                    return (
                      <li key={`${item.id}-${item.selectedColor}`} className="px-6 py-4">
                        <div className="flex items-center">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-20 h-20 bg-neutral-100 rounded overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-base font-medium text-neutral-900">{item.name}</h3>
                                <p className="text-sm text-neutral-500 mt-1">
                                  {colorName && (
                                    <span className="flex items-center">
                                      Color: {colorName}
                                      <span 
                                        className="ml-1 inline-block w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: item.selectedColor }}
                                      ></span>
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-base font-medium text-neutral-900">₹{item.price}</p>
                                {item.originalPrice > item.price && (
                                  <p className="text-sm text-neutral-500 line-through">₹{item.originalPrice}</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Quantity and Remove */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center border border-neutral-300 rounded">
                                <button 
                                  className="px-3 py-1 text-neutral-600"
                                  onClick={() => handleQuantityChange(item.id, item.selectedColor, item.quantity - 1)}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, item.selectedColor, parseInt(e.target.value) || 1)}
                                  className="w-12 text-center border-none focus:outline-none"
                                />
                                <button 
                                  className="px-3 py-1 text-neutral-600"
                                  onClick={() => handleQuantityChange(item.id, item.selectedColor, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => handleRemoveItem(item.id, item.selectedColor)}
                                className="text-neutral-500 hover:text-red-600"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            
            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200">
                  <h2 className="text-lg font-medium text-neutral-900">Order Summary</h2>
                </div>
                
                <div className="px-6 py-4">
                  {/* Price Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-base text-neutral-700">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-base text-neutral-700">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₹${shippingCost}`
                        )}
                      </span>
                    </div>
                    
                    <div className="border-t border-neutral-200 pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold text-neutral-900">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Inclusive of all taxes
                      </p>
                    </div>
                  </div>
                  
                  {/* Promo Code */}
                  <div className="mt-6">
                    <label htmlFor="promo-code" className="block text-sm font-medium text-neutral-700 mb-1">
                      Apply Promo Code
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        id="promo-code"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-neutral-300 shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                      <button
                        onClick={handleApplyPromoCode}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-neutral-900 hover:bg-neutral-800"
                      >
                        Apply
                      </button>
                    </div>
                    
                    {/* Promo feedback messages */}
                    {promoError && (
                      <p className="mt-2 text-sm text-red-600">
                        {promoError}
                      </p>
                    )}
                    
                    {promoSuccess && (
                      <p className="mt-2 text-sm text-green-600">
                        {promoSuccess}
                      </p>
                    )}
                  </div>
                  
                  {/* Checkout Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark disabled:bg-neutral-300 disabled:cursor-not-allowed"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                  
                  {/* Accepted Payment Methods */}
                  <div className="mt-6">
                    <p className="text-sm text-neutral-500 mb-2">We accept:</p>
                    <div className="flex space-x-2">
                      <img src="/icons/visa.svg" alt="Visa" className="h-8" />
                      <img src="/icons/mastercard.svg" alt="Mastercard" className="h-8" />
                      <img src="/icons/amex.svg" alt="American Express" className="h-8" />
                      <img src="/icons/paypal.svg" alt="PayPal" className="h-8" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shipping & Returns Info */}
              <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
                <div className="px-6 py-4">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Shipping & Returns</h3>
                  <ul className="text-sm text-neutral-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      Free shipping on orders above ₹999
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      Standard delivery: 3-5 business days
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      Easy returns within 20 days
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;