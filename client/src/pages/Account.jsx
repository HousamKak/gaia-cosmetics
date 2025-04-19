// frontend/src/pages/Account.jsx
import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
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
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        
        // In a real app, this would be an API call
        // For now, we'll simulate with sample data
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock orders data
        const mockOrders = [
          { 
            id: 'ORD-123456', 
            date: '2023-04-15', 
            status: 'Delivered', 
            total: 1299,
            items: [
              { name: 'Plush Warm Beige Lipstick', quantity: 1, price: 499 },
              { name: 'Silk Foundation Medium', quantity: 1, price: 799 }
            ]
          },
          { 
            id: 'ORD-123457', 
            date: '2023-03-20', 
            status: 'Delivered', 
            total: 998,
            items: [
              { name: 'Rose Gold Highlighter', quantity: 1, price: 599 },
              { name: 'Velvet Matte Eyeliner', quantity: 1, price: 399 }
            ]
          }
        ];
        
        setOrders(mockOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your account information. Please try again.');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

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
                        <ShoppingBagIcon className="mr-3 h-5 w-5" />
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
                    <form className="space-y-6">
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
                              defaultValue={user.name}
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
                              defaultValue={user.email}
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
                              defaultValue="+91 9876543210"
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-6">
                          <button
                            type="submit"
                            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </form>
                    
                    <div className="mt-10 pt-6 border-t border-neutral-200">
                      <h3 className="text-base font-medium text-neutral-900">Change Password</h3>
                      <form className="mt-4 space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="current-password" className="block text-sm font-medium text-neutral-700">
                              Current Password
                            </label>
                            <div className="mt-1">
                              <input
                                type="password"
                                name="current-password"
                                id="current-password"
                                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                              <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-neutral-700">
                                  New Password
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="password"
                                    name="new-password"
                                    id="new-password"
                                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700">
                                  Confirm New Password
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="password"
                                    name="confirm-password"
                                    id="confirm-password"
                                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <button
                              type="submit"
                              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              Update Password
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
                                  <h3 className="text-sm font-medium text-neutral-900">Order #{order.id}</h3>
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-500 mt-1">Placed on {order.date}</p>
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
                              {order.items.map((item, index) => (
                                <div key={index} className="py-4 flex items-center">
                                  <div className="flex-grow">
                                    <h4 className="text-sm font-medium text-neutral-900">{item.name}</h4>
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
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-medium text-neutral-900">Saved Addresses</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* Existing Address */}
                      <div className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-neutral-900">Home</h3>
                            <address className="mt-2 not-italic text-sm text-neutral-600">
                              <p>John Doe</p>
                              <p>123 Main Street, Apartment 4B</p>
                              <p>Mumbai, Maharashtra 400001</p>
                              <p>India</p>
                              <p className="mt-2">+91 9876543210</p>
                            </address>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
                            <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Add New Address */}
                      <div className="border border-dashed border-neutral-300 rounded-lg p-4 flex items-center justify-center">
                        <button
                          className="text-primary hover:text-primary-dark text-sm font-medium"
                        >
                          + Add New Address
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
                <div>
                  <div className="px-6 py-4 border-b border-neutral-200">
                    <h2 className="text-lg font-medium text-neutral-900">Saved Payment Methods</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {/* Existing Payment Method */}
                      <div className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <img src="/icons/mastercard.svg" alt="Mastercard" className="h-8 w-12" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-neutral-900">Mastercard ending in 1234</h3>
                              <p className="text-sm text-neutral-500">Expires 06/2025</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-red-600 hover:text-red-900 text-sm">Remove</button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Add New Payment Method */}
                      <div className="border border-dashed border-neutral-300 rounded-lg p-4 flex items-center justify-center">
                        <button
                          className="text-primary hover:text-primary-dark text-sm font-medium"
                        >
                          + Add New Payment Method
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;