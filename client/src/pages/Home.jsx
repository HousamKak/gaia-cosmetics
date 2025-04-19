// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';

import ProductCard from '../components/product/ProductCard';
import contentService from '../services/content.service';
import productService from '../services/product.service';
import categoryService from '../services/category.service';
import { formatPrice } from '../utils/formatter';

const Home = () => {
  const [heroContent, setHeroContent] = useState({
    title: 'Beautiful Cosmetics for Every Style',
    discount: 'UP TO 50% OFF',
    image: '/images/hero-banner.jpg'
  });
  const [categories, setCategories] = useState([]);
  const [limitedEditions, setLimitedEditions] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
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
            
            setCategories(formattedCategories.slice(0, 3)); // Limit to first 3 categories
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
          const productsResponse = await productService.getProducts({ 
            limit: 4,
            sort: 'popularity' 
          });
          
          if (productsResponse.data && productsResponse.data.products) {
            setFeaturedProducts(productsResponse.data.products);
          }
        } catch (err) {
          console.error('Error fetching products:', err);
          setFeaturedProducts([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load home content. Please refresh the page.');
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-neutral-900 rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="pb-16 md:pb-0">
      {/* Hero Banner */}
      <section className="relative">
        <div className="relative h-96 overflow-hidden">
          <img 
            src={heroContent.image} 
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/category/${category.name.toLowerCase()}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="aspect-w-3 aspect-h-4">
                  <img 
                    src={category.image} 
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
                    src={edition.image} 
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
          <h2 className="text-2xl font-heading font-bold mb-8">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;