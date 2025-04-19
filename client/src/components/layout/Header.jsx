// frontend/src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  BellIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { cartItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            )}
            
            <Link to="/wishlist" className="p-1 text-neutral-700 hover:text-neutral-900">
              <HeartIcon className="h-6 w-6" />
            </Link>
            
            {!isMobile && (
              <Link to="/notifications" className="p-1 text-neutral-700 hover:text-neutral-900">
                <BellIcon className="h-6 w-6" />
              </Link>
            )}
            
            <Link to="/cart" className="p-1 relative text-neutral-700 hover:text-neutral-900">
              <ShoppingBagIcon className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Search bar (shows when search is clicked) */}
      {searchOpen && (
        <div className="container mx-auto px-4 py-3 border-t border-neutral-200">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-4 py-2 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
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
        <div className="bg-white border-b border-neutral-200 py-4">
          <div className="container mx-auto px-4">
            <nav className="space-y-4">
              <Link 
                to="/account" 
                className="block py-2 text-neutral-700 hover:text-neutral-900 font-medium"
              >
                My Account
              </Link>
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
              <div className="pt-4 border-t border-neutral-200">
                <Link 
                  to="/login" 
                  className="block py-2 text-neutral-700 hover:text-neutral-900 font-medium"
                >
                  {user ? 'Logout' : 'Login / Register'}
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;