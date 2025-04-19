// frontend/src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/order.service';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  CheckIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Checkout = () => {
  const { cartItems, subtotal, discount, shippingCost, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState('shipping');
  const [formData, setFormData] = useState({
    // Shipping Information
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    
    // Payment Information
    paymentMethod: 'card',
    savedCard: 'new',
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      navigate('/cart');
    }
    
    // Pre-fill user information if available, but don't require login
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    }
  }, [cartItems.length, navigate, user, orderComplete]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateShippingForm = () => {
    const newErrors = {};
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Postal code validation
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentForm = () => {
    const newErrors = {};
    
    if (formData.paymentMethod === 'card') {
      if (formData.savedCard === 'new') {
        // Validate new card details
        if (!formData.cardNumber) {
          newErrors.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(formData.cardNumber)) {
          newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        }
        
        if (!formData.nameOnCard) {
          newErrors.nameOnCard = 'Name on card is required';
        }
        
        if (!formData.expiryDate) {
          newErrors.expiryDate = 'Expiry date is required';
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
          newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
        }
        
        if (!formData.cvv) {
          newErrors.cvv = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(formData.cvv)) {
          newErrors.cvv = 'Please enter a valid CVV';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    
    if (validateShippingForm()) {
      setActiveStep('payment');
      window.scrollTo(0, 0);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (validatePaymentForm()) {
      try {
        setLoading(true);

        // Prepare order data
        const orderData = {
          items: cartItems,
          subtotal,
          discount,
          shippingCost,
          total,
          shippingAddress: formData, // Contains address info
          billingAddress: formData, // Same as shipping for now
          paymentMethod: formData.paymentMethod
        };

        // Use order service to create order
        let response;
        if (user) {
          // Logged in user
          response = await orderService.createOrder(orderData);
        } else {
          // Guest checkout
          const userInfo = {
            email: formData.email,
            name: formData.fullName
          };
          response = await orderService.guestCheckout({
            ...orderData,
            userInfo
          });
        }

        // Generate a random order ID
        const generatedOrderId = response.data.orderNumber || 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        setOrderId(generatedOrderId);
        setOrderComplete(true);
        clearCart();

        setLoading(false);
      } catch (err) {
        console.error('Error placing order:', err);
        setErrors({ submit: 'Failed to place order. Please try again.' });
        setLoading(false);
      }
    }
  };

  const handleBackToShipping = () => {
    setActiveStep('shipping');
    window.scrollTo(0, 0);
  };

  // Order confirmation view
  if (orderComplete) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
                Order Confirmed!
              </h1>
              <p className="text-neutral-600 mb-6">
                Thank you for your purchase. Your order has been placed successfully.
              </p>
              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-neutral-600 mb-1">Order ID:</p>
                <p className="text-lg font-medium text-neutral-900">{orderId}</p>
              </div>
              <p className="text-sm text-neutral-600 mb-6">
                A confirmation email has been sent to {formData.email}. We'll notify you when your order ships.
              </p>
              <div className="space-y-4">
                <Link
                  to="/"
                  className="block w-full py-3 px-4 rounded-md shadow bg-primary hover:bg-primary-dark text-white text-center font-medium"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/account/orders"
                  className="block w-full py-3 px-4 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-center font-medium"
                >
                  View Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold">Checkout</h1>
          <Link 
            to="/cart" 
            className="text-sm text-primary hover:text-primary-dark flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>
        </div>
        
        {/* Checkout Progress */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center ${activeStep === 'shipping' ? 'text-primary' : 'text-neutral-900'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              activeStep === 'shipping' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600'
            } mr-2`}>
              1
            </div>
            <span className="font-medium">Shipping</span>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-neutral-400 mx-2" />
          <div className={`flex items-center ${activeStep === 'payment' ? 'text-primary' : 'text-neutral-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              activeStep === 'payment' ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-400'
            } mr-2`}>
              2
            </div>
            <span className="font-medium">Payment</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Shipping Information */}
              {activeStep === 'shipping' && (
                <form onSubmit={handleContinueToPayment}>
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-medium text-neutral-900">Shipping Information</h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {/* Full Name */}
                      <div className="sm:col-span-3">
                        <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700">
                          Full Name *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              errors.fullName ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.fullName && (
                            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Email */}
                      <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                          Email Address *
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              errors.email ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Phone */}
                      <div className="sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                          Phone Number *
                        </label>
                        <div className="mt-1">
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              errors.phone ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Address */}
                      <div className="sm:col-span-6">
                        <label htmlFor="address" className="block text-sm font-medium text-neutral-700">
                          Address *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              errors.address ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* City */}
                      <div className="sm:col-span-2">
                        <label htmlFor="city" className="block text-sm font-medium text-neutral-700">
                          City *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              errors.city ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.city && (
                            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* State */}
                      <div className="sm:col-span-2">
                        <label htmlFor="state" className="block text-sm font-medium text-neutral-700">
                          State *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              errors.state ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.state && (
                            <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Postal Code */}
                      <div className="sm:col-span-2">
                        <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-700">
                          Postal Code *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              errors.postalCode ? 'border-red-300' : ''
                            }`}
                          />
                          {errors.postalCode && (
                            <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Country */}
                      <div className="sm:col-span-3">
                        <label htmlFor="country" className="block text-sm font-medium text-neutral-700">
                          Country *
                        </label>
                        <div className="mt-1">
                          <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                          >
                            <option value="India">India</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                          </select>
                          {errors.country && (
                            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Save address checkbox */}
                      <div className="sm:col-span-6">
                        <div className="flex items-center">
                          <input
                            id="saveAddress"
                            name="saveAddress"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                          />
                          <label htmlFor="saveAddress" className="ml-2 block text-sm text-neutral-700">
                            Save this address for future orders
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </form>
              )}
              
              {/* Payment Information */}
              {activeStep === 'payment' && (
                <form onSubmit={handlePlaceOrder}>
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-medium text-neutral-900">Payment Method</h2>
                  </div>
                  
                  <div className="p-6">
                    {/* Payment Method Selection */}
                    <fieldset>
                      <legend className="sr-only">Payment Method</legend>
                      <div className="space-y-4">
                        {/* Credit Card Option */}
                        <div className="relative bg-white rounded-lg border border-neutral-200 p-4 flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="card"
                              name="paymentMethod"
                              type="radio"
                              value="card"
                              checked={formData.paymentMethod === 'card'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                            />
                          </div>
                          <div className="ml-3 flex justify-between w-full">
                            <label htmlFor="card" className="text-sm font-medium text-neutral-900">
                              Credit / Debit Card
                            </label>
                            <div className="flex space-x-2">
                              <img src="/icons/visa.svg" alt="Visa" className="h-6" />
                              <img src="/icons/mastercard.svg" alt="Mastercard" className="h-6" />
                              <img src="/icons/amex.svg" alt="American Express" className="h-6" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Cash on Delivery Option */}
                        <div className="relative bg-white rounded-lg border border-neutral-200 p-4 flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="cod"
                              name="paymentMethod"
                              type="radio"
                              value="cod"
                              checked={formData.paymentMethod === 'cod'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                            />
                          </div>
                          <div className="ml-3">
                            <label htmlFor="cod" className="text-sm font-medium text-neutral-900">
                              Cash on Delivery
                            </label>
                            <p className="text-sm text-neutral-500">
                              Pay when your order is delivered
                            </p>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    
                    {/* Credit Card Details */}
                    {formData.paymentMethod === 'card' && (
                      <div className="mt-6">
                        <div className="border-t border-neutral-200 pt-6">
                          <h3 className="text-base font-medium text-neutral-900 mb-4">Card Details</h3>
                          
                          {/* Saved Cards */}
                          <div className="mb-4">
                            <fieldset>
                              <legend className="sr-only">Saved Cards</legend>
                              <div className="space-y-4">
                                {/* Saved Card 1 */}
                                <div className="relative bg-white rounded-lg border border-neutral-200 p-4 flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="savedCard1"
                                      name="savedCard"
                                      type="radio"
                                      value="mastercard"
                                      checked={formData.savedCard === 'mastercard'}
                                      onChange={handleInputChange}
                                      className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                                    />
                                  </div>
                                  <div className="ml-3 flex justify-between w-full">
                                    <div>
                                      <label htmlFor="savedCard1" className="text-sm font-medium text-neutral-900">
                                        Mastercard ending in 1209
                                      </label>
                                      <p className="text-sm text-neutral-500">Expires 08/2025</p>
                                    </div>
                                    <img src="/icons/mastercard.svg" alt="Mastercard" className="h-6" />
                                  </div>
                                </div>
                                
                                {/* Saved Card 2 */}
                                <div className="relative bg-white rounded-lg border border-neutral-200 p-4 flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="savedCard2"
                                      name="savedCard"
                                      type="radio"
                                      value="amex"
                                      checked={formData.savedCard === 'amex'}
                                      onChange={handleInputChange}
                                      className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                                    />
                                  </div>
                                  <div className="ml-3 flex justify-between w-full">
                                    <div>
                                      <label htmlFor="savedCard2" className="text-sm font-medium text-neutral-900">
                                        American Express ending in 1309
                                      </label>
                                      <p className="text-sm text-neutral-500">Expires 05/2024</p>
                                    </div>
                                    <img src="/icons/amex.svg" alt="American Express" className="h-6" />
                                  </div>
                                </div>
                                
                                {/* New Card */}
                                <div className="relative bg-white rounded-lg border border-neutral-200 p-4 flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="newCard"
                                      name="savedCard"
                                      type="radio"
                                      value="new"
                                      checked={formData.savedCard === 'new'}
                                      onChange={handleInputChange}
                                      className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                                    />
                                  </div>
                                  <div className="ml-3">
                                    <label htmlFor="newCard" className="text-sm font-medium text-neutral-900">
                                      Use a new card
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </fieldset>
                          </div>
                          
                          {/* New Card Form */}
                          {formData.savedCard === 'new' && (
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                              {/* Card Number */}
                              <div className="sm:col-span-6">
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-neutral-700">
                                  Card Number *
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="text"
                                    id="cardNumber"
                                    name="cardNumber"
                                    placeholder="1234 5678 9012 3456"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                                      errors.cardNumber ? 'border-red-300' : ''
                                    }`}
                                  />
                                  {errors.cardNumber && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Name on Card */}
                              <div className="sm:col-span-6">
                                <label htmlFor="nameOnCard" className="block text-sm font-medium text-neutral-700">
                                  Name on Card *
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="text"
                                    id="nameOnCard"
                                    name="nameOnCard"
                                    value={formData.nameOnCard}
                                    onChange={handleInputChange}
                                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                                      errors.nameOnCard ? 'border-red-300' : ''
                                    }`}
                                  />
                                  {errors.nameOnCard && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nameOnCard}</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Expiry Date */}
                              <div className="sm:col-span-3">
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-neutral-700">
                                  Expiry Date (MM/YY) *
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="text"
                                    id="expiryDate"
                                    name="expiryDate"
                                    placeholder="MM/YY"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                                      errors.expiryDate ? 'border-red-300' : ''
                                    }`}
                                  />
                                  {errors.expiryDate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* CVV */}
                              <div className="sm:col-span-3">
                                <label htmlFor="cvv" className="block text-sm font-medium text-neutral-700">
                                  CVV *
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="text"
                                    id="cvv"
                                    name="cvv"
                                    placeholder="123"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                                      errors.cvv ? 'border-red-300' : ''
                                    }`}
                                  />
                                  {errors.cvv && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Save card checkbox */}
                              <div className="sm:col-span-6">
                                <div className="flex items-center">
                                  <input
                                    id="saveCard"
                                    name="saveCard"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                                  />
                                  <label htmlFor="saveCard" className="ml-2 block text-sm text-neutral-700">
                                    Save this card for future payments
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Billing Address */}
                    <div className="mt-6 border-t border-neutral-200 pt-6">
                      <h3 className="text-base font-medium text-neutral-900 mb-4">Billing Address</h3>
                      
                      <div className="flex items-center mb-4">
                        <input
                          id="sameAsShipping"
                          name="sameAsShipping"
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                        />
                        <label htmlFor="sameAsShipping" className="ml-2 block text-sm text-neutral-700">
                          Same as shipping address
                        </label>
                      </div>
                    </div>
                    
                    {/* Errors */}
                    {errors.submit && (
                      <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                              {errors.submit}
                            </h3>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Navigation Buttons */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={handleBackToShipping}
                        className="py-3 px-4 border border-neutral-300 rounded-md shadow-sm text-base font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-neutral-300 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Processing...' : 'Place Order'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
          
          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-900">Order Summary</h2>
              </div>
              
              <div className="px-6 py-4">
                {/* Items */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-900 mb-3">Items ({cartItems.length})</h3>
                  <ul className="divide-y divide-neutral-200">
                    {cartItems.map((item) => (
                      <li key={`${item.id}-${item.selectedColor}`} className="py-3 flex">
                        <div className="flex-shrink-0 w-16 h-16 bg-neutral-100 rounded overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                Qty: {item.quantity}
                              </p>
                              {item.selectedColor && (
                                <div className="flex items-center mt-0.5">
                                  <span 
                                    className="inline-block w-3 h-3 rounded-full mr-1" 
                                    style={{ backgroundColor: item.selectedColor }}
                                  ></span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium text-neutral-900">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Price Details */}
                <div className="space-y-3 border-t border-neutral-200 pt-4">
                  <div className="flex justify-between text-sm text-neutral-700">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-neutral-700">
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
                    <div className="flex justify-between text-base font-bold text-neutral-900">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Inclusive of all taxes
                    </p>
                  </div>
                </div>
                
                {/* Security Notice */}
                <div className="mt-6 border-t border-neutral-200 pt-4">
                  <div className="flex items-center text-sm text-neutral-500">
                    <ShieldCheckIcon className="h-5 w-5 text-neutral-400 mr-2" />
                    <p>
                      All transactions are secure and encrypted. Your personal information is protected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;