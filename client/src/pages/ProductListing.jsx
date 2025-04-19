import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  AdjustmentsHorizontalIcon, 
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';
import { ProductSkeleton } from '../components/product/ProductSkeleton';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { useNotification } from '../contexts/NotificationContext';
import { debounce } from '../utils/helpers';
import categoryService from '../services/category.service';
import contentService from '../services/content.service';
import productService from '../services/product.service';

const ProductListing = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const queryParams = new URLSearchParams(location.search);
  
  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // State for category information
  const [categoryInfo, setCategoryInfo] = useState(null);
  
  // State for available filters
  const [availableFilters, setAvailableFilters] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState({});
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Sort options
  const sortOptions = [
    { name: 'Newest', value: 'newest' },
    { name: 'Price: Low to High', value: 'price-asc' },
    { name: 'Price: High to Low', value: 'price-desc' },
    { name: 'Popularity', value: 'popularity' },
    { name: 'Discount', value: 'discount' }
  ];
  
  // Initialize filters from URL parameters
  useEffect(() => {
    const initialFilters = {};
    
    // Extract filters from URL query parameters
    for (const [key, value] of queryParams.entries()) {
      if (key === 'sort') {
        setSortBy(value);
      } else if (key === 'minPrice') {
        setPriceRange(prev => [parseInt(value), prev[1]]);
      } else if (key === 'maxPrice') {
        setPriceRange(prev => [prev[0], parseInt(value)]);
      } else if (key === 'colors') {
        initialFilters.colors = value.split(',');
      } else if (key !== 'page') {
        // Other filter types
        initialFilters[key] = value.split(',');
      }
    }
    
    setActiveFilters(initialFilters);
  }, [location.search]);
  
  // Fetch products on component mount and when filters change
  useEffect(() => {
    // Skip initial render to avoid double fetching
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }
    
    fetchProducts();
  }, [category, activeFilters, priceRange, sortBy]);
  
  // Debounced URL update when filters change
  const updateUrl = debounce(() => {
    const newParams = new URLSearchParams();
    
    // Add sort parameter
    if (sortBy) {
      newParams.set('sort', sortBy);
    }
    
    // Add price range
    if (priceRange[0] > 0) {
      newParams.set('minPrice', priceRange[0].toString());
    }
    
    if (priceRange[1] < 5000) {
      newParams.set('maxPrice', priceRange[1].toString());
    }
    
    // Add other active filters
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        newParams.set(key, values.join(','));
      }
    });
    
    // Update URL without triggering a page reload
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  }, 500);
  
  // Update URL when filters change
  useEffect(() => {
    if (!initialLoad) {
      updateUrl();
    }
  }, [activeFilters, priceRange, sortBy]);

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
      
      // Fetch available filters for the category
      try {
        const filtersResponse = await categoryService.getCategoryFilters(categoryId || category);
        
        if (filtersResponse.data) {
          setAvailableFilters(filtersResponse.data.filters || []);
          setAvailableColors(filtersResponse.data.colors || [
            { name: 'Pink', value: '#FFB6C1' },
            { name: 'Silver', value: '#D3D3D3' },
            { name: 'Beige', value: '#DEB887' },
            { name: 'Coral', value: '#FF7F7F' },
            { name: 'Gold', value: '#FFD700' },
            { name: 'Brown', value: '#8B4513' },
            { name: 'Red', value: '#FF0000' },
            { name: 'Nude', value: '#E3BC9A' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching filters:', err);
        // Fallback defaults
        setAvailableFilters([
          {
            id: 'finish',
            name: 'Finish',
            type: 'checkbox',
            options: [
              { value: 'matte', label: 'Matte' },
              { value: 'glossy', label: 'Glossy' },
              { value: 'satin', label: 'Satin' },
              { value: 'metallic', label: 'Metallic' }
            ]
          },
          {
            id: 'brand',
            name: 'Brand',
            type: 'checkbox',
            options: [
              { value: 'gaia', label: 'GAIA' },
              { value: 'natura', label: 'Natura' },
              { value: 'bloom', label: 'Bloom' }
            ]
          },
          {
            id: 'rating',
            name: 'Rating',
            type: 'radio',
            options: [
              { value: '4+', label: '4★ & above' },
              { value: '3+', label: '3★ & above' },
              { value: '2+', label: '2★ & above' }
            ]
          }
        ]);
        setAvailableColors([
          { name: 'Pink', value: '#FFB6C1' },
          { name: 'Silver', value: '#D3D3D3' },
          { name: 'Beige', value: '#DEB887' },
          { name: 'Coral', value: '#FF7F7F' },
          { name: 'Gold', value: '#FFD700' },
          { name: 'Brown', value: '#8B4513' },
          { name: 'Red', value: '#FF0000' },
          { name: 'Nude', value: '#E3BC9A' }
        ]);
      }
      
      // Fetch products based on category and filters
      const params = {
        sort: sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      };
      
      if (activeFilters.colors?.length) {
        params.colors = activeFilters.colors.join(',');
      }
      Object.entries(activeFilters).forEach(([key, values]) => {
        if (key !== 'colors' && values?.length) {
          params[key] = values.join(',');
        }
      });
      
      let response;
      try {
        if (categoryId) {
          response = await categoryService.getCategoryProducts(categoryId, params);
        } else {
          params.category = category;
          response = await productService.getProducts(params);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        showError('Failed to load products. Please try again.');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      setProducts(response.data?.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      showError('Failed to load products. Please try again.');
      setLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (filterName, values) => {
    setActiveFilters(prev => ({ ...prev, [filterName]: values }));
  };

  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setPriceRange([0, 2000]);
    setSortBy('newest');
    setShowMobileFilters(false);
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
          {/* Sidebar Filters */}
          <FilterSidebar 
            filters={availableFilters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            isOpen={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
            availableColors={availableColors}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
          />
          
          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-neutral-500">
                {loading ? 'Loading products...' : `${products.length} products`}
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <SkeletonLoader count={8} Component={ProductSkeleton} />
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
            
            {/* Add pagination here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
