// frontend/src/pages/Account.jsx
import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import userService from '../services/user.service';
import orderService from '../services/order.service';
import Modal from '../components/common/Modal';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  MapPinIcon, 
  CreditCardIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const Account = () => {
  const { user, logout, isAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
    isDefault: false
  });
  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardType: 'visa',
    isDefault: false
  });
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: '/account' }} />;
  }

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get user addresses
        try {
          const addressesResponse = await userService.getUserAddresses();
          setAddresses(addressesResponse.data || []);
        } catch (err) {
          console.error('Error fetching addresses:', err);
        }

        // Get user payment methods
        try {
          const paymentMethodsResponse = await userService.getUserPaymentMethods();
          setPaymentMethods(paymentMethodsResponse.data || []);
        } catch (err) {
          console.error('Error fetching payment methods:', err);
        }

        // Fetch real orders from API
        try {
          const ordersResponse = await orderService.getUserOrders();
          if (ordersResponse.data && ordersResponse.data.orders) {
            setOrders(ordersResponse.data.orders);
          } else {
            setOrders([]);
          }
        } catch (err) {
          console.error('Error fetching orders:', err);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your account information. Please try again.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const response = await userService.updateUserProfile({
        name: formData.name,
        phone: formData.phone
      });
      
      // Update local user data
      if (response.data) {
        // Show success message
        showSuccess('Profile updated successfully');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      showError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      showError('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      showError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      await userService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      
      // Show success message and reset password fields
      showSuccess('Password changed successfully');
      
      setFormData(prevState => ({
        ...prevState,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setLoading(false);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
      showError('Failed to change password. Please try again.');
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.addAddress(addressFormData);
      
      if (response.data) {
        // Add the new address to the state
        setAddresses(prev => [...prev, response.data]);
        showSuccess('Address added successfully');
        setIsAddressModalOpen(false);
        
        // Reset form data
        setAddressFormData({
          name: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          phone: '',
          isDefault: false
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Failed to add address. Please try again.');
      showError('Failed to add address. Please try again.');
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Extract last 4 digits of card number
      const lastFour = paymentFormData.cardNumber.slice(-4);
      
      const paymentData = {
        cardType: paymentFormData.cardType,
        lastFour,
        expiryMonth: paymentFormData.expiryMonth,
        expiryYear: paymentFormData.expiryYear,
        isDefault: paymentFormData.isDefault
      };
      
      const response = await userService.addPaymentMethod(paymentData);
      
      if (response.data) {
        // Add the new payment method to the state
        setPaymentMethods(prev => [...prev, response.data]);
        showSuccess('Payment method added successfully');
        setIsPaymentModalOpen(false);
        
        // Reset form data
        setPaymentFormData({
          cardNumber: '',
          nameOnCard: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
          cardType: 'visa',
          isDefault: false
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error adding payment method:', err);
      setError('Failed to add payment method. Please try again.');
      showError('Failed to add payment method. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await userService.deleteAddress(id);
      
      // Remove the address from the state
      setAddresses(prev => prev.filter(address => address.id !== id));
      showSuccess('Address deleted successfully');
      
      setLoading(false);
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Failed to delete address. Please try again.');
      showError('Failed to delete address. Please try again.');
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await userService.deletePaymentMethod(id);
      
      // Remove the payment method from the state
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      showSuccess('Payment method deleted successfully');
      
      setLoading(false);
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError('Failed to delete payment method. Please try again.');
      showError('Failed to delete payment method. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-heading font-bold mb-6">My Account</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Account Navigation - Left Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* User Info */}
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-neutral-900 font-bold text-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-neutral-900">{user.name}</h2>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'profile'
                          ? 'bg-primary-light text-neutral-900'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <UserIcon className="mr-3 h-5 w-5" />
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'orders'
                          ? 'bg-primary-light text-neutral-900'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <ShoppingBagIcon className="mr-3 h-5 w-5" />
                      Orders
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/wishlist"
                      className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100"
                    >
                      <HeartIcon className="mr-3 h-5 w-5" />
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'addresses'
                          ? 'bg-primary-light text-neutral-900'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <MapPinIcon className="mr-3 h-5 w-5" />
                      Addresses
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('payment')}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        activeTab === 'payment'
                          ? 'bg-primary-light text-neutral-900'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <CreditCardIcon className="mr-3 h-5 w-5" />
                      Payment Methods
                    </button>
                  </li>
                  
                  {/* Admin Link - Only visible for admin users */}
                  {isAdmin && isAdmin() && (
                    <li>
                      <Link
                        to="/admin"
                        className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100"
                      >
                        <UserIcon className="mr-3 h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  
                  {/* Logout */}
                  <li className="pt-4 border-t border-neutral-200 mt-4">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100"
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Account Content - Right Side */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-medium text-neutral-900">Profile Information</h2>
                  </div>
                  <div className="p-6">
                    <form className="space-y-6" onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                            Full Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                            Email
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              disabled
                              className="shadow-sm bg-neutral-100 focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                            />
                          </div>
                          <p className="mt-1 text-xs text-neutral-500">Email cannot be changed.</p>
                        </div>
                        
                        <div className="sm:col-span-3">
                          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                            Phone Number
                          </label>
                          <div className="mt-1">
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-6">
                          <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </form>
                    
                    <div className="mt-10 pt-6 border-t border-neutral-200">
                      <h3 className="text-base font-medium text-neutral-900">Change Password</h3>
                      <form className="mt-4 space-y-6" onSubmit={handlePasswordChange}>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700">
                              Current Password
                            </label>
                            <div className="mt-1">
                              <input
                                type="password"
                                name="currentPassword"
                                id="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                              <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700">
                                  New Password
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="password"
                                    name="newPassword"
                                    id="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                                  Confirm New Password
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <button
                              type="submit"
                              disabled={loading}
                              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              {loading ? 'Updating...' : 'Update Password'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-medium text-neutral-900">My Orders</h2>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-neutral-500 mb-4">You haven't placed any orders yet.</p>
                        <Link
                          to="/category/makeup"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <div key={order.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                            <div className="bg-neutral-50 px-6 py-4 flex justify-between items-center">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="text-sm font-medium text-neutral-900">Order #{order.orderNumber || order.id}</h3>
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-500 mt-1">
                                  Placed on {new Date(order.created_at || order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-neutral-900">₹{order.total}</p>
                                <Link
                                  to={`/account/orders/${order.id}`}
                                  className="text-xs text-primary hover:text-primary-dark"
                                >
                                  View Order
                                </Link>
                              </div>
                            </div>
                            <div className="px-6 py-4 divide-y divide-neutral-200">
                              {(order.items || []).map((item, index) => (
                                <div key={index} className="py-4 flex items-center">
                                  <div className="flex-grow">
                                    <h4 className="text-sm font-medium text-neutral-900">{item.product_name || item.name}</h4>
                                    <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                                  </div>
                                  <div className="text-sm font-medium text-neutral-900">
                                    ₹{item.price}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-neutral-900">Saved Addresses</h2>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                    >
                      Add New Address
                    </button>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-neutral-500 mb-4">You don't have any saved addresses yet.</p>
                        <button
                          onClick={() => setIsAddressModalOpen(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                        >
                          Add New Address
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {addresses.map((address) => (
                          <div key={address.id} className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-sm font-medium text-neutral-900">{address.name}</h3>
                                <address className="mt-2 not-italic text-sm text-neutral-600">
                                  <p>{address.address}</p>
                                  <p>{address.city}, {address.state} {address.postal_code}</p>
                                  <p>{address.country}</p>
                                  <p className="mt-2">{address.phone}</p>
                                </address>
                                {address.is_default && (
                                  <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleDeleteAddress(address.id)} 
                                  className="text-red-600 hover:text-red-900 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
                <div>
                  <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-neutral-900">Saved Payment Methods</h2>
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                    >
                      Add Payment Method
                    </button>
                  </div>
                  <div className="p-6">
                    {loading ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : paymentMethods.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-neutral-500 mb-4">You don't have any saved payment methods yet.</p>
                        <button
                          onClick={() => setIsPaymentModalOpen(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                        >
                          Add Payment Method
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <img 
                                  src={`/icons/${method.card_type.toLowerCase()}.svg`} 
                                  alt={method.card_type} 
                                  className="h-8 w-12" 
                                />
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-neutral-900">
                                    {method.card_type} ending in {method.last_four}
                                  </h3>
                                  <p className="text-sm text-neutral-500">
                                    Expires {method.expiry_month}/{method.expiry_year}
                                  </p>
                                  {method.is_default && (
                                    <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleDeletePaymentMethod(method.id)} 
                                className="text-red-600 hover:text-red-900 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add New Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={addressFormData.name}
              onChange={handleAddressInputChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-neutral-700">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={addressFormData.address}
              onChange={handleAddressInputChange}
              rows={3}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-neutral-700">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={addressFormData.city}
                onChange={handleAddressInputChange}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-neutral-700">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={addressFormData.state}
                onChange={handleAddressInputChange}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-700">
                Postal Code *
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={addressFormData.postalCode}
                onChange={handleAddressInputChange}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-neutral-700">
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={addressFormData.country}
                onChange={handleAddressInputChange}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={addressFormData.phone}
              onChange={handleAddressInputChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="isDefault"
              name="isDefault"
              type="checkbox"
              checked={addressFormData.isDefault}
              onChange={handleAddressInputChange}
              className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-neutral-700">
              Set as default address
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="inline-flex justify-center py-2 px-4 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Payment Method Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Add Payment Method"
      >
        <form onSubmit={handleAddPaymentMethod} className="space-y-4">
          <div>
            <label htmlFor="cardType" className="block text-sm font-medium text-neutral-700">
              Card Type *
            </label>
            <select
              id="cardType"
              name="cardType"
              value={paymentFormData.cardType}
              onChange={handlePaymentInputChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
              <option value="discover">Discover</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-neutral-700">
              Card Number *
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentFormData.cardNumber}
              onChange={handlePaymentInputChange}
              placeholder="1234 5678 9012 3456"
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="nameOnCard" className="block text-sm font-medium text-neutral-700">
              Name on Card *
            </label>
            <input
              type="text"
              id="nameOnCard"
              name="nameOnCard"
              value={paymentFormData.nameOnCard}
              onChange={handlePaymentInputChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label htmlFor="expiryMonth" className="block text-sm font-medium text-neutral-700">
                Expiry Month *
              </label>
              <select
                id="expiryMonth"
                name="expiryMonth"
                value={paymentFormData.expiryMonth}
                onChange={handlePaymentInputChange}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, '0');
                  return (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div className="col-span-1">
              <label htmlFor="expiryYear" className="block text-sm font-medium text-neutral-700">
                Expiry Year *
              </label>
              <select
                id="expiryYear"
                name="expiryYear"
                value={paymentFormData.expiryYear}
                onChange={handlePaymentInputChange}
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              >
                <option value="">YY</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = (new Date().getFullYear() + i).toString().slice(-2);
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div className="col-span-1">
              <label htmlFor="cvv" className="block text-sm font-medium text-neutral-700">
                CVV *
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentFormData.cvv}
                onChange={handlePaymentInputChange}
                placeholder="123"
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="isDefaultPayment"
              name="isDefault"
              type="checkbox"
              checked={paymentFormData.isDefault}
              onChange={handlePaymentInputChange}
              className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
            />
            <label htmlFor="isDefaultPayment" className="ml-2 block text-sm text-neutral-700">
              Set as default payment method
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="inline-flex justify-center py-2 px-4 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? 'Saving...' : 'Save Payment Method'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Account;