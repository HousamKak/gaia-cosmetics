// frontend/src/components/layout/Header.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import useOutsideClick from '../../hooks/useOutsideClick';

// Icons
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  BellIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Use custom media query hook instead of manual window width handling
  const isMobile = useIsMobile();
  
  // Use outside click hook to close mobile menu when clicking outside
  const mobileMenuRef = useOutsideClick(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  });
  
  // Use outside click hook to close search when clicking outside
  const searchRef = useOutsideClick(() => {
    if (searchOpen) setSearchOpen(false);
  });

  const categories = [
    { name: 'Makeup', icon: '/icons/makeup-icon.svg' },
    { name: 'Fragrance', icon: '/icons/fragrance-icon.svg' },
    { name: 'Skincare', icon: '/icons/skincare-icon.svg' },
    { name: 'Offers', icon: '/icons/offers-icon.svg' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          {isMobile && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-800"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? 
                <XMarkIcon className="h-6 w-6" /> : 
                <Bars3Icon className="h-6 w-6" />
              }
            </button>
          )}
          
          {/* Logo */}
          <div className={`${isMobile ? 'mx-auto' : 'mr-auto ml-0'}`}>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-heading font-bold text-neutral-900">GAIA</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          {!isMobile && (
            <nav className="hidden md:flex space-x-8 mx-auto">
              {categories.map((category) => (
                <Link 
                  key={category.name}
                  to={`/category/${category.name.toLowerCase()}`}
                  className="text-neutral-700 hover:text-neutral-900 font-medium"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Right nav icons */}
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <button 
                onClick={() => setSearchOpen(!searchOpen)} 
                className="p-1 text-neutral-700 hover:text-neutral-900"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            )}
            
            <Link 
              to="/wishlist" 
              className="p-1 text-neutral-700 hover:text-neutral-900"
              aria-label="Wishlist"
            >
              <HeartIcon className="h-6 w-6" />
            </Link>
            
            {!isMobile && (
              <Link 
                to="/notifications" 
                className="p-1 text-neutral-700 hover:text-neutral-900"
                aria-label="Notifications"
              >
                <BellIcon className="h-6 w-6" />
              </Link>
            )}
            
            <Link 
              to="/cart" 
              className="p-1 relative text-neutral-700 hover:text-neutral-900"
              aria-label="Cart"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
            
            {!isMobile && (
              <Link 
                to={user ? "/account" : "/login"} 
                className="p-1 text-neutral-700 hover:text-neutral-900"
                aria-label={user ? "My Account" : "Sign In"}
              >
                <UserIcon className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search bar (shows when search is clicked) */}
      {searchOpen && (
        <div ref={searchRef} className="container mx-auto px-4 py-3 border-t border-neutral-200">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-4 py-2 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button 
              type="submit"
              className="bg-neutral-900 text-white px-4 py-2 rounded-r-md hover:bg-neutral-800"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Category navigation (mobile) */}
      {isMobile && (
        <div className="container mx-auto px-4 py-3 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-8">
            {categories.map((category) => (
              <Link 
                key={category.name}
                to={`/category/${category.name.toLowerCase()}`}
                className="flex flex-col items-center whitespace-nowrap"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-100 mb-1">
                  <img src={category.icon} alt={category.name} className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-neutral-700">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div ref={mobileMenuRef} className="bg-white border-b border-neutral-200 py-4">
          <div className="container mx-auto px-4">
            <nav className="space-y-4">
              {user ? (
                <div className="flex items-center py-2 mb-2 border-b border-neutral-200">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-neutral-900 font-bold text-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                    <p className="text-xs text-neutral-600">{user.email}</p>
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="block py-2 text-neutral-700 hover:text-neutral-900 font-medium"
                >
                  Login / Register
                </Link>
              )}

              <Link 
                to="/" 
                className="block py-2 text-neutral-700 hover:text-neutral-900 font-medium"
              >
                Home
              </Link>
              
              {user && (
                <Link 
                  to="/account" 
                  className="block py-2 text-neutral-700 hover:text-neutral-900 font-medium"
                >
                  My Account
                </Link>
              )}
              
              {categories.map((category) => (
                <Link 
                  key={category.name}
                  to={`/category/${category.name.toLowerCase()}`}
                  className="block py-2 text-neutral-700 hover:text-neutral-900 font-medium"
                >
                  {category.name}
                </Link>
              ))}
              
              <Link 
                to="/try-on" 
                className="block py-2 text-neutral-700 hover:text-neutral-900 font-medium"
              >
                Virtual Try On
              </Link>
              
              <Link 
                to="/wishlist" 
                className="block py-2 text-neutral-700 hover:text-neutral-900 font-medium"
              >
                Wishlist
              </Link>
              
              {user && (
                <div className="pt-4 border-t border-neutral-200">
                  <button 
                    onClick={handleLogout}
                    className="block py-2 text-neutral-700 hover:text-neutral-900 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;