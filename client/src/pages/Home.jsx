// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import 'swiper/css';
import 'swiper/css/pagination';

import ProductCard from '../components/product/ProductCard';
import contentService from '../services/content.service';
import productService from '../services/product.service';
import categoryService from '../services/category.service';
import { formatPrice } from '../utils/formatter';

import.meta.env.VITE_SERVER_BASE_URL;

const Home = () => {
  const { showError } = useNotification();
  const [heroContent, setHeroContent] = useState({
    title: 'Beautiful Cosmetics for Every Style',
    discount: 'UP TO 50% OFF',
    image: '/images/hero-banner.jpg'
  });
  const [categories, setCategories] = useState([]);
  const [limitedEditions, setLimitedEditions] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch hero content
        try {
          const heroResponse = await contentService.getContentBySection('hero');
          if (heroResponse.data) {
            setHeroContent({
              title: heroResponse.data.title?.value || 'Beautiful Cosmetics for Every Style',
              discount: heroResponse.data.discount?.value || 'UP TO 50% OFF',
              image: heroResponse.data.image?.value || '/images/hero-banner.jpg'
            });
          }
        } catch (err) {
          console.error('Error fetching hero content:', err);
          // Keep default hero content on error
        }
        
        // Fetch categories
        try {
          const categoryResponse = await categoryService.getAllCategories();
          if (categoryResponse.data) {
            // Format categories for display
            const formattedCategories = categoryResponse.data.map(category => ({
              id: category.id,
              name: category.name,
              image: category.image_path || '/images/category-placeholder.jpg',
              productCount: `${category.product_count || 0}+ products`
            }));
            
            setCategories(formattedCategories.slice(0, 4)); // Limit to first 4 categories
          }
        } catch (err) {
          console.error('Error fetching categories:', err);
          setCategories([]);
        }
        
        // Fetch limited editions content
        try {
          const limitedEditionsResponse = await contentService.getContentBySection('limited_editions');
          if (limitedEditionsResponse.data) {
            // Format limited editions for display
            const limitedEditionsData = [
              {
                id: 1,
                name: limitedEditionsResponse.data.summer_title?.value || 'Summer Collection',
                image: limitedEditionsResponse.data.summer_image?.value || '/images/limited-summer.jpg',
                discount: limitedEditionsResponse.data.summer_discount?.value || '30% OFF'
              },
              {
                id: 2,
                name: limitedEditionsResponse.data.bridal_title?.value || 'Bridal Collection',
                image: limitedEditionsResponse.data.bridal_image?.value || '/images/limited-bridal.jpg',
                discount: limitedEditionsResponse.data.bridal_discount?.value || '20% OFF'
              }
            ];
            
            setLimitedEditions(limitedEditionsData);
          }
        } catch (err) {
          console.error('Error fetching limited editions content:', err);
          // Set default limited editions
          setLimitedEditions([
            {
              id: 1,
              name: 'Summer Collection',
              image: '/images/limited-summer.jpg',
              discount: '30% OFF'
            },
            {
              id: 2,
              name: 'Bridal Collection',
              image: '/images/limited-bridal.jpg',
              discount: '20% OFF'
            }
          ]);
        }
        
        // Fetch featured products
        try {
          const featuredResponse = await productService.getProducts({ 
            limit: 4,
            sort: 'featured'
          });
          
          if (featuredResponse.data && featuredResponse.data.products) {
            setFeaturedProducts(featuredResponse.data.products);
          }
        } catch (err) {
          console.error('Error fetching featured products:', err);
          setFeaturedProducts([]);
        }
        
        // Fetch bestsellers
        try {
          const bestSellersResponse = await productService.getProducts({ 
            limit: 4,
            sort: 'popularity'
          });
          
          if (bestSellersResponse.data && bestSellersResponse.data.products) {
            setBestSellers(bestSellersResponse.data.products);
          }
        } catch (err) {
          console.error('Error fetching bestseller products:', err);
          setBestSellers([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load home content. Please refresh the page.');
        showError('Failed to load home content. Please refresh the page.');
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  if (loading && !categories.length && !featuredProducts.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pb-16 md:pb-0">
      {/* Hero Banner */}
      <section className="relative">
        <div className="relative h-96 overflow-hidden">
          <img 
            src={`${import.meta.env.VITE_SERVER_BASE_URL}${heroContent.image || '/images/product-placeholder.jpg'}`} 
            alt="GAIA Cosmetics" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center p-8">
            <div className="max-w-lg">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
                {heroContent.title}
              </h1>
              <div className="inline-block bg-accent px-4 py-2 text-white font-bold mb-6">
                {heroContent.discount}
              </div>
              <Link 
                to="/category/makeup" 
                className="inline-block bg-white text-neutral-900 px-6 py-3 font-bold rounded-md hover:bg-neutral-100 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-heading font-bold mb-8">Shop By Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/category/${category.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-w-3 aspect-h-4">
                  <img 
                    src={`${import.meta.env.VITE_SERVER_BASE_URL}${category.image}`} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-4">
                  <h3 className="text-xl font-bold text-white">{category.name}</h3>
                  <p className="text-sm text-white opacity-80">{category.productCount}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Limited Editions */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-heading font-bold">Limited Editions</h2>
            <Link 
              to="/category/limited-editions" 
              className="text-neutral-600 hover:text-neutral-900"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {limitedEditions.map((edition) => (
              <Link 
                key={edition.id} 
                to={`/category/limited-editions/${edition.id}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={`${import.meta.env.VITE_SERVER_BASE_URL}${edition.image}`} 
                    alt={edition.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-end p-6">
                  <div className="inline-block bg-accent px-3 py-1 text-white text-sm font-bold mb-2">
                    {edition.discount}
                  </div>
                  <h3 className="text-xl font-bold text-white">{edition.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-heading font-bold">Featured Products</h2>
            <Link 
              to="/category/featured" 
              className="text-neutral-600 hover:text-neutral-900"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Bestsellers */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-heading font-bold">Bestsellers</h2>
            <Link 
              to="/category/bestsellers" 
              className="text-neutral-600 hover:text-neutral-900"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-primary-light rounded-lg py-10 px-6 md:py-16 md:px-12">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-heading font-bold mb-4">Join Our Newsletter</h2>
              <p className="text-neutral-700 mb-6">
                Sign up to receive updates on new products, beauty tips, and exclusive offers.
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-md transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;