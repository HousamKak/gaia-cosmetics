// frontend/src/pages/ProductListing.jsx
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  AdjustmentsHorizontalIcon, 
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../components/product/ProductCard';

const ProductListing = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State for products and filters
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'newest');
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Available filter options
  const colorOptions = [
    { name: 'Pink', value: '#FFB6C1' },
    { name: 'Silver', value: '#D3D3D3' },
    { name: 'Beige', value: '#DEB887' },
    { name: 'Coral', value: '#FF7F7F' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Brown', value: '#8B4513' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Nude', value: '#E3BC9A' }
  ];
  
  const sortOptions = [
    { name: 'Newest', value: 'newest' },
    { name: 'Price: Low to High', value: 'price-asc' },
    { name: 'Price: High to Low', value: 'price-desc' },
    { name: 'Popularity', value: 'popularity' },
    { name: 'Discount', value: 'discount' }
  ];

  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [category, sortBy, selectedColors, priceRange]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call with all filters
      // For now, we'll simulate with sample data
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Construct a query string from filters
      let queryStr = '';
      if (sortBy) queryStr += `&sort=${sortBy}`;
      if (selectedColors.length > 0) queryStr += `&colors=${selectedColors.join(',')}`;
      if (priceRange[0] > 0 || priceRange[1] < 2000) {
        queryStr += `&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`;
      }
      
      // This would be a fetch in a real app
      // const response = await axios.get(`/api/products?category=${category}${queryStr}`);
      
      // Sample product data based on category
      let productData = [];
      let categoryData = null;
      
      // Different products based on category
      if (category === 'makeup') {
        categoryData = {
          name: 'Makeup',
          description: 'Explore our range of high-quality makeup products for every occasion.',
          image: '/images/category-makeup-banner.jpg'
        };
        
        productData = [
          { id: 1, name: 'Plush Warm Beige Lipstick', price: 499, originalPrice: 999, category: 'Lips', colors: ['#FFB6C1', '#D3D3D3', '#DEB887', '#FF7F7F'], image: '/images/product-lipstick-beige.jpg' },
          { id: 2, name: 'Silk Foundation Medium', price: 799, originalPrice: 1299, category: 'Face', colors: ['#E3BC9A', '#D2B48C', '#BC8F8F'], image: '/images/product-foundation.jpg' },
          { id: 6, name: 'Glossy Lip Oil', price: 399, originalPrice: 599, category: 'Lips', colors: ['#FFB6C1', '#FF7F7F'], image: '/images/product-lip-oil.jpg' },
          { id: 7, name: 'Creamy Concealer', price: 449, originalPrice: 699, category: 'Face', colors: ['#E3BC9A', '#D2B48C', '#BC8F8F'], image: '/images/product-concealer.jpg' },
          { id: 8, name: 'Volume Mascara', price: 399, originalPrice: 599, category: 'Eyes', colors: ['#000000'], image: '/images/product-mascara.jpg' }
        ];
      } else if (category === 'skincare') {
        categoryData = {
          name: 'Skincare',
          description: 'Pamper your skin with our natural and effective skincare products.',
          image: '/images/category-skincare-banner.jpg'
        };
        
        productData = [
          { id: 9, name: 'Hydrating Face Mist', price: 349, originalPrice: 499, category: 'Skincare', colors: [], image: '/images/product-face-mist.jpg' },
          { id: 10, name: 'Rose Quartz Face Roller', price: 799, originalPrice: 1299, category: 'Skincare', colors: [], image: '/images/product-face-roller.jpg' },
          { id: 14, name: 'Vitamin C Serum', price: 699, originalPrice: 999, category: 'Skincare', colors: [], image: '/images/product-vitamin-c.jpg' },
          { id: 15, name: 'Hydrating Night Cream', price: 599, originalPrice: 899, category: 'Skincare', colors: [], image: '/images/product-night-cream.jpg' },
          { id: 16, name: 'Exfoliating Face Scrub', price: 449, originalPrice: 699, category: 'Skincare', colors: [], image: '/images/product-face-scrub.jpg' }
        ];
      } else if (category === 'fragrance') {
        categoryData = {
          name: 'Fragrance',
          description: 'Discover our collection of enchanting and long-lasting fragrances.',
          image: '/images/category-fragrance-banner.jpg'
        };
        
        productData = [
          { id: 11, name: 'Citrus Blossom Perfume', price: 1299, originalPrice: 1999, category: 'Fragrance', colors: [], image: '/images/product-citrus-perfume.jpg' },
          { id: 17, name: 'Wild Rose Eau de Parfum', price: 1499, originalPrice: 1999, category: 'Fragrance', colors: [], image: '/images/product-rose-perfume.jpg' },
          { id: 18, name: 'Ocean Breeze Body Mist', price: 599, originalPrice: 799, category: 'Fragrance', colors: [], image: '/images/product-body-mist.jpg' },
          { id: 19, name: 'Vanilla Dream Perfume', price: 1199, originalPrice: 1699, category: 'Fragrance', colors: [], image: '/images/product-vanilla-perfume.jpg' },
          { id: 20, name: 'Amber Nights Cologne', price: 1399, originalPrice: 1899, category: 'Fragrance', colors: [], image: '/images/product-cologne.jpg' }
        ];
      } else {
        // Default category or "All Products"
        categoryData = {
          name: 'All Products',
          description: 'Browse our complete collection of beauty products.',
          image: '/images/category-all-banner.jpg'
        };
        
        productData = [
          { id: 1, name: 'Plush Warm Beige Lipstick', price: 499, originalPrice: 999, category: 'Lips', colors: ['#FFB6C1', '#D3D3D3', '#DEB887', '#FF7F7F'], image: '/images/product-lipstick-beige.jpg' },
          { id: 2, name: 'Silk Foundation Medium', price: 799, originalPrice: 1299, category: 'Face', colors: ['#E3BC9A', '#D2B48C', '#BC8F8F'], image: '/images/product-foundation.jpg' },
          { id: 3, name: 'Rose Gold Highlighter', price: 599, originalPrice: 899, category: 'Face', colors: ['#FFD700', '#F0E68C', '#FFC0CB'], image: '/images/product-highlighter.jpg' },
          { id: 4, name: 'Velvet Matte Eyeliner', price: 349, originalPrice: 499, category: 'Eyes', colors: ['#000000', '#8B4513'], image: '/images/product-eyeliner.jpg' },
          { id: 9, name: 'Hydrating Face Mist', price: 349, originalPrice: 499, category: 'Skincare', colors: [], image: '/images/product-face-mist.jpg' },
          { id: 11, name: 'Citrus Blossom Perfume', price: 1299, originalPrice: 1999, category: 'Fragrance', colors: [], image: '/images/product-citrus-perfume.jpg' }
        ];
      }
      
      // Apply filters (would be done by the server in a real app)
      
      // Filter by price range
      let filteredProducts = productData.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
      
      // Filter by selected colors
      if (selectedColors.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
          if (!product.colors || product.colors.length === 0) return false;
          return selectedColors.some(color => product.colors.includes(color));
        });
      }
      
      // Apply sorting
      if (sortBy === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'discount') {
        filteredProducts.sort((a, b) => {
          const discountA = a.originalPrice - a.price;
          const discountB = b.originalPrice - b.price;
          return discountB - discountA;
        });
      }
      
      setProducts(filteredProducts);
      setCategoryInfo(categoryData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    
    // Update URL with new sort parameter
    queryParams.set('sort', newSortBy);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const handleColorFilter = (color) => {
    setSelectedColors(prevColors => {
      if (prevColors.includes(color)) {
        return prevColors.filter(c => c !== color);
      } else {
        return [...prevColors, color];
      }
    });
  };

  const handlePriceRangeChange = (e, index) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => {
      const newRange = [...prev];
      newRange[index] = value;
      return newRange;
    });
  };

  const clearFilters = () => {
    setPriceRange([0, 2000]);
    setSelectedColors([]);
    setSortBy('newest');
    
    // Update URL to remove sort parameter
    queryParams.delete('sort');
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <div className="bg-neutral-50">
      {/* Category Banner */}
      {categoryInfo && (
        <div className="relative">
          <div className="h-64 w-full overflow-hidden">
            <img
              src={categoryInfo.image}
              alt={categoryInfo.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
              <div className="container mx-auto px-4">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                  {categoryInfo.name}
                </h1>
                <p className="text-white text-lg max-w-xl">
                  {categoryInfo.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={toggleMobileFilters}
            className="flex items-center text-sm font-medium text-neutral-700 px-4 py-2 border rounded shadow-sm"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Filters & Sort
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchProducts}
              className="ml-4 font-medium underline"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row">
          {/* Desktop Sidebar Filters */}
          <div className="hidden md:block w-64 mr-8">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-neutral-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Clear all
                </button>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Price Range</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-500">₹{priceRange[0]}</span>
                  <span className="text-sm text-neutral-500">₹{priceRange[1]}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="100"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(e, 0)}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(e, 1)}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none pointer-events-none"
                  />
                </div>
              </div>
              
              {/* Color Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border ${
                        selectedColors.includes(color.value) ? 'ring-2 ring-primary ring-offset-1' : 'border-neutral-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorFilter(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters (Slide-out) */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-40 flex md:hidden">
              {/* Overlay */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-25" 
                onClick={toggleMobileFilters}
              ></div>
              
              {/* Slide-out panel */}
              <div className="relative w-4/5 max-w-xs bg-white h-full shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-medium text-neutral-900">Filters</h2>
                  <button onClick={toggleMobileFilters}>
                    <XMarkIcon className="h-6 w-6 text-neutral-500" />
                  </button>
                </div>
                
                <div className="overflow-y-auto flex-1 p-4">
                  {/* Sort Options */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-900 mb-2">Sort By</h3>
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-full p-2 border border-neutral-300 rounded shadow-sm focus:ring-primary focus:border-primary"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Price Range Filter */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-900 mb-2">Price Range</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-500">₹{priceRange[0]}</span>
                      <span className="text-sm text-neutral-500">₹{priceRange[1]}</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="100"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceRangeChange(e, 0)}
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceRangeChange(e, 1)}
                        className="absolute top-0 w-full h-2 bg-transparent appearance-none pointer-events-none"
                      />
                    </div>
                  </div>
                  
                  {/* Color Filter */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-900 mb-2">Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          className={`w-8 h-8 rounded-full border ${
                            selectedColors.includes(color.value) ? 'ring-2 ring-primary ring-offset-1' : 'border-neutral-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => handleColorFilter(color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border-t p-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={clearFilters}
                      className="flex-1 py-2 px-4 border border-neutral-300 rounded text-neutral-700 bg-white hover:bg-neutral-50"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={toggleMobileFilters}
                      className="flex-1 py-2 px-4 border border-transparent rounded text-white bg-primary hover:bg-primary-dark"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-neutral-500">
                {products.length} products
              </p>
              <div className="hidden md:block">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-neutral-700">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="pl-3 pr-10 py-2 text-sm border-neutral-300 rounded appearance-none bg-white focus:outline-none focus:ring-primary focus:border-primary"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
                      <ChevronDownIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow py-8 px-4 text-center">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No products found</h3>
                <p className="text-neutral-500 mb-4">Try adjusting your filters or browse other categories.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;