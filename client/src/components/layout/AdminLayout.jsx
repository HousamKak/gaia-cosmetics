// frontend/src/components/layout/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  HomeIcon,
  ShoppingBagIcon,
  PhotoIcon,
  UserIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { showError } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      
      if (!user) {
        navigate('/login', { state: { from: location } });
        return;
      }
      
      // Check if the user is an admin
      const hasAdminAccess = isAdmin();
      
      if (!hasAdminAccess) {
        showError('You do not have permission to access the admin area.');
        navigate('/');
        return;
      }
      
      setIsLoading(false);
    };
    
    checkAdmin();
  }, [user, isAdmin, navigate, location, showError]);

  // Updated navigation items to match available routes
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Content', href: '/admin/content', icon: PhotoIcon },
    { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Categories', href: '/admin/categories', icon: TagIcon },
    { name: 'Orders', href: '/admin/orders', icon: ChartBarIcon },
    // Comment out sections that aren't implemented yet
    // { name: 'Users', href: '/admin/users', icon: UserIcon },
    // { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show loading state while checking admin access
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Make sure user is logged in and is admin
  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Mobile sidebar */}
      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-neutral-600 bg-opacity-75 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-neutral-800">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex-1 h-0 overflow-y-auto">
                <div className="flex items-center h-16 flex-shrink-0 px-4 bg-neutral-900">
                  <h1 className="text-xl font-heading font-bold text-white">GAIA Admin</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        location.pathname === item.href
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className="mr-3 h-6 w-6 flex-shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              
              <div className="flex-shrink-0 flex p-4 bg-neutral-700">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-neutral-300">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-neutral-800">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-neutral-900">
            <h1 className="text-xl font-heading font-bold text-white">GAIA Admin</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    (location.pathname === item.href || 
                     (item.href !== '/admin' && location.pathname.startsWith(item.href)))
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className="mr-3 h-6 w-6 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex p-4 bg-neutral-700">
            <div className="flex items-center">
              <div className="ml-3 w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-neutral-300">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 rounded-full text-neutral-300 hover:text-white"
                    title="Logout"
                  >
                    <ArrowLeftOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white shadow">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="absolute right-0 top-0 mr-4 mt-3 flex items-center">
            <button
              onClick={handleLogout}
              className="p-1 rounded-full text-neutral-500 hover:text-neutral-900"
              title="Logout"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;