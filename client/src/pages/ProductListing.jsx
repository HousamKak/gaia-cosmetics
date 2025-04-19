// frontend/src/pages/ProductListing.jsx
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  AdjustmentsHorizontalIcon, 
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../components/product/ProductCard';
import categoryService from '../services/category.service';
import contentService from '../services/content.service';
import productService from '../services/product.service';

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
      
      // Get category info first
      let categoryId = null;
      let categoryData = null;
      
      try {
        // Get all categories first to find the matching one
        const categoriesResponse = await categoryService.getAllCategories();
        if (categoriesResponse.data) {
          const matchingCategory = categoriesResponse.data.find(
            cat => cat.name.toLowerCase() === category.toLowerCase()
          );
          
          if (matchingCategory) {
            categoryId = matchingCategory.id;
            
            // Get the category banner
            const categoryContent = await contentService.getContentBySection('category');
            const bannerKey = `${category.toLowerCase()}_banner`;
            
            categoryData = {
              name: matchingCategory.name,
              description: `Explore our range of high-quality ${matchingCategory.name.toLowerCase()} products for every occasion.`,
              image: categoryContent.data?.[bannerKey]?.value || '/images/category-placeholder.jpg'
            };
          }
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        // Continue with default category info
      }
      
      // If no matching category found, use default
      if (!categoryData) {
        categoryData = {
          name: category.charAt(0).toUpperCase() + category.slice(1),
          description: `Explore our range of high-quality ${category.toLowerCase()} products for every occasion.`,
          image: '/images/category-all-banner.jpg'
        };
      }
      
      setCategoryInfo(categoryData);
      
      // Fetch products based on category and filters
      let productsData = [];
      
      // Construct query parameters
      const params = {
        sort: sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      };
      
      if (selectedColors.length > 0) {
        params.colors = selectedColors.join(',');
      }
      
      try {
        let response;
        
        if (categoryId) {
          // If we have a valid category ID, use the category products endpoint
          response = await categoryService.getCategoryProducts(categoryId, params);
        } else {
          // Otherwise, use the general products endpoint with category filter
          params.category = category;
          response = await productService.getProducts(params);
        }
        
        if (response.data && response.data.products) {
          productsData = response.data.products;
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        // If API fails, try general product search
        try {
          const response = await productService.getProducts({ 
            category: category,
            ...params
          });
          
          if (response.data && response.data.products) {
            productsData = response.data.products;
          }
        } catch (innerErr) {
          console.error('Error with fallback product fetch:', innerErr);
        }
      }
      
      setProducts(productsData);
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