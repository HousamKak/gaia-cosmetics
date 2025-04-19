// frontend/src/pages/SearchResults.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    // Set search term from URL
    setSearchTerm(searchQuery);
    
    // Fetch search results
    fetchSearchResults(searchQuery);
  }, [searchQuery]);
  
  const fetchSearchResults = async (query) => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      // const response = await axios.get(`/api/products/search?q=${query}&category=${selectedCategory}`);
      
      // For now, we'll simulate with sample data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const allProducts = [
        { id: 1, name: 'Plush Warm Beige Lipstick', price: 499, originalPrice: 999, category: 'Lips', colors: ['#FFB6C1', '#D3D3D3', '#DEB887', '#FF7F7F'], image: '/images/product-lipstick-beige.jpg' },
        { id: 2, name: 'Silk Foundation Medium', price: 799, originalPrice: 1299, category: 'Face', colors: ['#E3BC9A', '#D2B48C', '#BC8F8F'], image: '/images/product-foundation.jpg' },
        { id: 3, name: 'Rose Gold Highlighter', price: 599, originalPrice: 899, category: 'Face', colors: ['#FFD700', '#F0E68C', '#FFC0CB'], image: '/images/product-highlighter.jpg' },
        { id: 4, name: 'Velvet Matte Eyeliner', price: 349, originalPrice: 499, category: 'Eyes', colors: ['#000000', '#8B4513'], image: '/images/product-eyeliner.jpg' },
        { id: 5, name: 'Dewy Setting Spray', price: 449, originalPrice: 699, category: 'Face', colors: [], image: '/images/product-setting-spray.jpg' },
        { id: 6, name: 'Glossy Lip Oil', price: 399, originalPrice: 599, category: 'Lips', colors: ['#FFB6C1', '#FF7F7F'], image: '/images/product-lip-oil.jpg' },
        { id: 7, name: 'Creamy Concealer', price: 449, originalPrice: 699, category: 'Face', colors: ['#E3BC9A', '#D2B48C', '#BC8F8F'], image: '/images/product-concealer.jpg' },
        { id: 8, name: 'Volume Mascara', price: 399, originalPrice: 599, category: 'Eyes', colors: ['#000000'], image: '/images/product-mascara.jpg' },
        { id: 9, name: 'Hydrating Face Mist', price: 349, originalPrice: 499, category: 'Skincare', colors: [], image: '/images/product-face-mist.jpg' },
        { id: 10, name: 'Rose Quartz Face Roller', price: 799, originalPrice: 1299, category: 'Skincare', colors: [], image: '/images/product-face-roller.jpg' },
        { id: 11, name: 'Citrus Blossom Perfume', price: 1299, originalPrice: 1999, category: 'Fragrance', colors: [], image: '/images/product-citrus-perfume.jpg' },
        { id: 12, name: 'Velvet Brow Pencil', price: 299, originalPrice: 449, category: 'Eyes', colors: ['#8B4513', '#000000', '#A52A2A'], image: '/images/product-brow-pencil.jpg' }
      ];
      
      // Filter by search term (case insensitive)
      let filteredResults = allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      
      // Filter by category if selected
      if (selectedCategory) {
        filteredResults = filteredResults.filter(product => 
          product.category === selectedCategory
        );
      }
      
      // Extract unique categories from results
      const uniqueCategories = [...new Set(filteredResults.map(item => item.category))];
      setCategories(uniqueCategories);
      
      setResults(filteredResults);
      setLoading(false);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('An error occurred while searching. Please try again.');
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    // Update URL with search query
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };
  
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };
  
  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-heading font-bold mb-6">Search Results</h1>
        
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex rounded-md shadow-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-primary focus:border-primary flex-grow block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-neutral-300"
              placeholder="Search for products..."
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              <span className="ml-2">Search</span>
            </button>
          </form>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-block p-4 bg-neutral-100 rounded-full mb-4">
              <MagnifyingGlassIcon className="h-12 w-12 text-neutral-400" />
            </div>
            <h2 className="text-xl font-medium text-neutral-900 mb-2">No results found</h2>
            <p className="text-neutral-500 mb-6">
              We couldn't find any products matching "{searchQuery}".
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  navigate('/search');
                }}
                className="inline-flex items-center px-4 py-2 border border-neutral-300 shadow-sm text-base font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
              >
                Clear Search
              </button>
              <button
                onClick={() => navigate('/category/makeup')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                Browse Products
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-sm text-neutral-500">
                {results.length} {results.length === 1 ? 'result' : 'results'} for "{searchQuery}"
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Category Filters */}
              {categories.length > 1 && (
                <div className="w-full md:w-64">
                  <div className="bg-white rounded-lg shadow p-4 sticky top-24">
                    <h2 className="font-medium text-neutral-900 mb-4">Filter by Category</h2>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center">
                          <button
                            onClick={() => handleCategoryFilter(category)}
                            className={`flex items-center ${
                              selectedCategory === category 
                                ? 'text-primary font-medium' 
                                : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full mr-2 ${
                              selectedCategory === category ? 'bg-primary' : 'bg-neutral-300'
                            }`}></span>
                            {category} ({results.filter(item => item.category === category).length})
                          </button>
                        </div>
                      ))}
                      
                      {selectedCategory && (
                        <button
                          onClick={() => setSelectedCategory('')}
                          className="text-sm text-primary hover:text-primary-dark mt-2"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Products Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results
                    .filter(product => !selectedCategory || product.category === selectedCategory)
                    .map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;