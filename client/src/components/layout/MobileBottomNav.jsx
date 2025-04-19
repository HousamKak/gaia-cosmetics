// frontend/src/components/layout/MobileBottomNav.jsx
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  GiftIcon, 
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

import { 
  HomeIcon as HomeIconSolid, 
  ShoppingBagIcon as ShoppingBagIconSolid, 
  GiftIcon as GiftIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';

const MobileBottomNav = () => {
  // Use custom hook instead of manually checking window width
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Don't render the navigation if not on mobile
  if (!isMobile) return null;

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: 'Shop', path: '/category/makeup', icon: ShoppingBagIcon, activeIcon: ShoppingBagIconSolid },
    { name: 'Gift', path: '/category/gift', icon: GiftIcon, activeIcon: GiftIconSolid },
    { name: 'Explore', path: '/search', icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassIconSolid },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-2 z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 ${
                isActive ? 'text-neutral-900' : 'text-neutral-500'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;