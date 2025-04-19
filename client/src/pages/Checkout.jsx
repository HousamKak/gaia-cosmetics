// frontend/src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import orderService from '../services/order.service';
import useForm from '../hooks/useForm';
import { isValidEmail, isValidIndianPhone, isValidIndianPostalCode } from '../utils/validation';
import { formatPrice } from '../utils/formatter';
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
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState('shipping');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      navigate('/cart');
    }
    
    // Pre-fill user information if available, but don't require login
    if (user) {
      setFormValues({
        fullName: user.name || '',
        email: user.email || ''
      });
    }
  }, [cartItems.length, navigate, user, orderComplete]);

  // Validation rules for shipping form
  const shippingValidationRules = {
    fullName: {
      required: true,
      requiredMessage: 'Full name is required'
    },
    email: {
      required: true,
      email: true,
      requiredMessage: 'Email is required',
      validate: (value) => {
        return isValidEmail(value) ? null : 'Please enter a valid email address';
      }
    },
    phone: {
      required: true,
      requiredMessage: 'Phone number is required',
      validate: (value) => {
        return isValidIndianPhone(value) ? null : 'Please enter a valid 10-digit phone number';
      }
    },
    address: {
      required: true,
      requiredMessage: 'Address is required'
    },
    city: {
      required: true,
      requiredMessage: 'City is required'
    },
    state: {
      required: true,
      requiredMessage: 'State is required'
    },
    postalCode: {
      required: true,
      requiredMessage: 'Postal code is required',
      validate: (value) => {
        return isValidIndianPostalCode(value) ? null : 'Please enter a valid 6-digit postal code';
      }
    },
    country: {
      required: true,
      requiredMessage: 'Country is required'
    }
  };

  // Validation rules for payment form
  const paymentValidationRules = {
    cardNumber: {
      required: (values) => values.paymentMethod === 'card' && values.savedCard === 'new',
      requiredMessage: 'Card number is required',
      validate: (value, values) => {
        if (values.paymentMethod !== 'card' || values.savedCard !== 'new') return null;
        return /^\d{16}$/.test(value) ? null : 'Please enter a valid 16-digit card number';
      }
    },
    nameOnCard: {
      required: (values) => values.paymentMethod === 'card' && values.savedCard === 'new',
      requiredMessage: 'Name on card is required'
    },
    expiryDate: {
      required: (values) => values.paymentMethod === 'card' && values.savedCard === 'new',
      requiredMessage: 'Expiry date is required',
      validate: (value, values) => {
        if (values.paymentMethod !== 'card' || values.savedCard !== 'new') return null;
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value) ? null : 'Please enter a valid expiry date (MM/YY)';
      }
    },
    cvv: {
      required: (values) => values.paymentMethod === 'card' && values.savedCard === 'new',
      requiredMessage: 'CVV is required',
      validate: (value, values) => {
        if (values.paymentMethod !== 'card' || values.savedCard !== 'new') return null;
        return /^\d{3,4}$/.test(value) ? null : 'Please enter a valid CVV';
      }
    }
  };

  // Initial form values
  const initialValues = {
    // Shipping Information
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    saveAddress: false,
    
    // Payment Information
    paymentMethod: 'card',
    savedCard: 'new',
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  };

  // Form submission handlers
  const handleShippingSubmit = (values) => {
    setActiveStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (values) => {
    try {
      // Prepare order data
      const orderData = {
        items: cartItems,
        subtotal,
        discount,
        shippingCost,
        total,
        shippingAddress: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country
        },
        billingAddress: sameAsShipping ? 
          {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            address: values.address,
            city: values.city,
            state: values.state,
            postalCode: values.postalCode,
            country: values.country
          } : 
          {
            // If implementing billing address form, use those values here
          },
        paymentMethod: values.paymentMethod,
        paymentDetails: values.paymentMethod === 'card' ? {
          cardType: 'visa',
          lastFour: values.cardNumber ? values.cardNumber.slice(-4) : '',
          expiryDate: values.expiryDate
        } : null
      };

      // Use order service to create order
      let response;
      if (user) {
        // Logged in user
        response = await orderService.createOrder(orderData);
      } else {
        // Guest checkout
        const userInfo = {
          email: values.email,
          name: values.fullName
        };
        response = await orderService.guestCheckout({
          ...orderData,
          userInfo
        });
      }

      // Generate a random order ID if not provided by API
      const generatedOrderId = response.data?.orderNumber || 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      setOrderId(generatedOrderId);
      setOrderComplete(true);
      clearCart();
      
      showSuccess('Order placed successfully!');
    } catch (err) {
      console.error('Error placing order:', err);
      showError(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  // Use the useForm hook for shipping form
  const { 
    values: shippingValues, 
    errors: shippingErrors, 
    handleChange: handleShippingChange, 
    handleBlur: handleShippingBlur,
    handleSubmit: submitShippingForm,
    setValues: setFormValues
  } = useForm(initialValues, shippingValidationRules, handleShippingSubmit);
  
  // Use the useForm hook for payment form
  const { 
    values: paymentValues, 
    errors: paymentErrors, 
    handleChange: handlePaymentChange, 
    handleBlur: handlePaymentBlur,
    handleSubmit: submitPaymentForm,
    setValues: setPaymentValues
  } = useForm(initialValues, paymentValidationRules, handlePaymentSubmit);

  useEffect(() => {
    // Keep both forms in sync
    setPaymentValues(shippingValues);
  }, [shippingValues]);

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
                A confirmation email has been sent to {shippingValues.email}. We'll notify you when your order ships.
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
                <form onSubmit={submitShippingForm}>
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
                            value={shippingValues.fullName}
                            onChange={handleShippingChange}
                            onBlur={handleShippingBlur}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              shippingErrors.fullName ? 'border-red-300' : ''
                            }`}
                          />
                          {shippingErrors.fullName && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.fullName}</p>
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
                            value={shippingValues.email}
                            onChange={handleShippingChange}
                            onBlur={handleShippingBlur}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              shippingErrors.email ? 'border-red-300' : ''
                            }`}
                          />
                          {shippingErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.email}</p>
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
                            value={shippingValues.phone}
                            onChange={handleShippingChange}
                            onBlur={handleShippingBlur}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              shippingErrors.phone ? 'border-red-300' : ''
                            }`}
                          />
                          {shippingErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.phone}</p>
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
                            value={shippingValues.address}
                            onChange={handleShippingChange}
                            onBlur={handleShippingBlur}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              shippingErrors.address ? 'border-red-300' : ''
                            }`}
                          />
                          {shippingErrors.address && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.address}</p>
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
                            value={shippingValues.city}
                            onChange={handleShippingChange}
                            onBlur={handleShippingBlur}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              shippingErrors.city ? 'border-red-300' : ''
                            }`}
                          />
                          {shippingErrors.city && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.city}</p>
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
                            value={shippingValues.state}
                            onChange={handleShippingChange}
                            onBlur={handleShippingBlur}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              shippingErrors.state ? 'border-red-300' : ''
                            }`}
                          />
                          {shippingErrors.state && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.state}</p>
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
                            value={shippingValues.postalCode}
                            onChange={handleShippingChange}
                            onBlur={handleShippingBlur}
                            className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                              shippingErrors.postalCode ? 'border-red-300' : ''
                            }`}
                          />
                          {shippingErrors.postalCode && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.postalCode}</p>
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
                            value={shippingValues.country}
                            onChange={handleShippingChange}
                            onBlur={handleShippingBlur}
                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                          >
                            <option value="India">India</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                          </select>
                          {shippingErrors.country && (
                            <p className="mt-1 text-sm text-red-600">{shippingErrors.country}</p>
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
                            checked={shippingValues.saveAddress}
                            onChange={handleShippingChange}
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
                <form onSubmit={submitPaymentForm}>
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
                              checked={paymentValues.paymentMethod === 'card'}
                              onChange={handlePaymentChange}
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
                              checked={paymentValues.paymentMethod === 'cod'}
                              onChange={handlePaymentChange}
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
                    {paymentValues.paymentMethod === 'card' && (
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
                                      checked={paymentValues.savedCard === 'mastercard'}
                                      onChange={handlePaymentChange}
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
                                      checked={paymentValues.savedCard === 'amex'}
                                      onChange={handlePaymentChange}
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
                                      checked={paymentValues.savedCard === 'new'}
                                      onChange={handlePaymentChange}
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
                          {paymentValues.savedCard === 'new' && (
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
                                    value={paymentValues.cardNumber}
                                    onChange={handlePaymentChange}
                                    onBlur={handlePaymentBlur}
                                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                                      paymentErrors.cardNumber ? 'border-red-300' : ''
                                    }`}
                                  />
                                  {paymentErrors.cardNumber && (
                                    <p className="mt-1 text-sm text-red-600">{paymentErrors.cardNumber}</p>
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
                                    value={paymentValues.nameOnCard}
                                    onChange={handlePaymentChange}
                                    onBlur={handlePaymentBlur}
                                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                                      paymentErrors.nameOnCard ? 'border-red-300' : ''
                                    }`}
                                  />
                                  {paymentErrors.nameOnCard && (
                                    <p className="mt-1 text-sm text-red-600">{paymentErrors.nameOnCard}</p>
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
                                    value={paymentValues.expiryDate}
                                    onChange={handlePaymentChange}
                                    onBlur={handlePaymentBlur}
                                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                                      paymentErrors.expiryDate ? 'border-red-300' : ''
                                    }`}
                                  />
                                  {paymentErrors.expiryDate && (
                                    <p className="mt-1 text-sm text-red-600">{paymentErrors.expiryDate}</p>
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
                                    value={paymentValues.cvv}
                                    onChange={handlePaymentChange}
                                    onBlur={handlePaymentBlur}
                                    className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md ${
                                      paymentErrors.cvv ? 'border-red-300' : ''
                                    }`}
                                  />
                                  {paymentErrors.cvv && (
                                    <p className="mt-1 text-sm text-red-600">{paymentErrors.cvv}</p>
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
                                    checked={paymentValues.saveCard}
                                    onChange={handlePaymentChange}
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
                          checked={sameAsShipping}
                          onChange={() => setSameAsShipping(!sameAsShipping)}
                          className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                        />
                        <label htmlFor="sameAsShipping" className="ml-2 block text-sm text-neutral-700">
                          Same as shipping address
                        </label>
                      </div>
                      
                      {/* If not same as shipping, show billing address form here */}
                    </div>
                    
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
                        className="py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Place Order
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
                            <p className="text-sm font-medium text-neutral-900">{formatPrice(item.price * item.quantity)}</p>
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
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm text-neutral-700">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                  
                  <div className="border-t border-neutral-200 pt-3 mt-3">
                    <div className="flex justify-between text-base font-bold text-neutral-900">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
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