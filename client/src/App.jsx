// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Page components
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';

// Admin components
import AdminDashboard from './pages/admin/Dashboard';
import ContentEditor from './pages/admin/ContentEditor';
import ProductManager from './pages/admin/ProductManager';
import ProductForm from './pages/admin/ProductForm';
import CategoryManager from './pages/admin/CategoryManager';
import OrderManager from './pages/admin/OrderManager';

// Layout components
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Context providers
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider position="top-right">
            <Router>
              <Routes>
                {/* Main website routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="category/:category" element={<ProductListing />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="search" element={<SearchResults />} />
                  <Route path="account" element={<Account />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="content" element={<ContentEditor />} />
                  <Route path="products" element={<ProductManager />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/edit/:id" element={<ProductForm isEditing={true} />} />
                  <Route path="categories" element={<CategoryManager />} />
                  <Route path="orders" element={<OrderManager />} />
                  {/* These components need to be created */}
                  {/*<Route path="users" element={<UserManager />} />*/}
                  {/*<Route path="settings" element={<SettingsManager />} />*/}
                </Route>
              </Routes>
            </Router>
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;