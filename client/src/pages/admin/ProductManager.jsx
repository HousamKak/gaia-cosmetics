// frontend/src/pages/admin/ProductManager.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import productService from '../../services/product.service';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    discountPercentage: '',
    description: '',
    inventoryStatus: 'in-stock'
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage, search, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Real API call with pagination
      const response = await productService.getProducts({
        page: pagination.currentPage,
        limit: pagination.perPage,
        category: category,
        search: search
      });

      if (response.data) {
        setProducts(response.data.products);
        setPagination({
          ...pagination,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
    // fetchProducts will be called by the useEffect
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPagination({ ...pagination, currentPage: 1 });
    // fetchProducts will be called by the useEffect
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, currentPage: newPage });
      // fetchProducts will be called by the useEffect
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Validate required fields
      if (!newProduct.name || !newProduct.category || !newProduct.price) {
        setError('Name, category, and price are required');
        setSubmitting(false);
        return;
      }

      // Create product using service
      const response = await productService.createProduct(newProduct);

      // Show success message
      setSuccessMessage('Product added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset form and close modal
      setNewProduct({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        discountPercentage: '',
        description: '',
        inventoryStatus: 'in-stock'
      });
      setIsAddModalOpen(false);
      setSubmitting(false);

      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);

      // Delete product using service
      await productService.deleteProduct(id);

      // Show success message
      setSuccessMessage('Product deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-neutral-900">Products</h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Success message */}
        {successMessage && (
          <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              className="ml-4 text-red-700 underline"
              onClick={() => {
                setError(null);
                fetchProducts();
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filters and search */}
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:flex md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Category filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
                  Filter by Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={handleCategoryChange}
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="mt-4 md:mt-0">
              <form onSubmit={handleSearch} className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="focus:ring-primary focus:border-primary flex-grow block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-neutral-300"
                  placeholder="Search products..."
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Products table */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <p className="text-neutral-500">No products found</p>
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setPagination({ ...pagination, currentPage: 1 });
                }}
                className="mt-4 text-primary hover:text-primary-dark"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Inventory
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-neutral-200 rounded-md overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center">
                              <ShoppingBagIcon className="h-6 w-6 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">{product.name}</div>
                          <div className="text-sm text-neutral-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">₹{product.price}</div>
                      {product.originalPrice > product.price && (
                        <div className="text-xs text-neutral-500 line-through">₹{product.originalPrice}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${product.inventory === 'in-stock' 
                          ? 'bg-green-100 text-green-800' 
                          : product.inventory === 'low-stock'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.inventory === 'in-stock' 
                          ? 'In Stock' 
                          : product.inventory === 'low-stock'
                          ? 'Low Stock'
                          : 'Out of Stock'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === 1
                      ? 'text-neutral-400 bg-neutral-50'
                      : 'text-neutral-700 bg-white hover:bg-neutral-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === pagination.totalPages
                      ? 'text-neutral-400 bg-neutral-50'
                      : 'text-neutral-700 bg-white hover:bg-neutral-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-700">
                    Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.perPage + 1}</span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium ${
                        pagination.currentPage === 1
                          ? 'text-neutral-400'
                          : 'text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {/* Page numbers */}
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const pageNumber = i + 1;
                      const isCurrentPage = pageNumber === pagination.currentPage;

                      // Show only current page, first, last, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === pagination.totalPages ||
                        (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              isCurrentPage
                                ? 'z-10 bg-primary text-white border-primary'
                                : 'bg-white text-neutral-500 hover:bg-neutral-50 border-neutral-300'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }

                      // Show ellipsis for skipped pages
                      if (
                        (pageNumber === 2 && pagination.currentPage > 3) ||
                        (pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700"
                          >
                            ...
                          </span>
                        );
                      }

                      return null;
                    })}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium ${
                        pagination.currentPage === pagination.totalPages
                          ? 'text-neutral-400'
                          : 'text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-neutral-900">Add New Product</h3>

                    <form onSubmit={handleAddProduct} className="mt-6">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        {/* Product Name */}
                        <div className="sm:col-span-6">
                          <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                            Product Name *
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={newProduct.name}
                              onChange={handleNewProductChange}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        {/* Category */}
                        <div className="sm:col-span-3">
                          <label htmlFor="newCategory" className="block text-sm font-medium text-neutral-700">
                            Category *
                          </label>
                          <div className="mt-1">
                            <select
                              id="newCategory"
                              name="category"
                              value={newProduct.category}
                              onChange={handleNewProductChange}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                              required
                            >
                              <option value="">Select Category</option>
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="sm:col-span-3">
                          <label htmlFor="price" className="block text-sm font-medium text-neutral-700">
                            Price (₹) *
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              name="price"
                              id="price"
                              min="0"
                              value={newProduct.price}
                              onChange={handleNewProductChange}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        {/* Original Price */}
                        <div className="sm:col-span-3">
                          <label htmlFor="originalPrice" className="block text-sm font-medium text-neutral-700">
                            Original Price (₹)
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              name="originalPrice"
                              id="originalPrice"
                              min="0"
                              value={newProduct.originalPrice}
                              onChange={handleNewProductChange}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                            />
                          </div>
                        </div>

                        {/* Discount Percentage */}
                        <div className="sm:col-span-3">
                          <label htmlFor="discountPercentage" className="block text-sm font-medium text-neutral-700">
                            Discount (%)
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              name="discountPercentage"
                              id="discountPercentage"
                              min="0"
                              max="100"
                              value={newProduct.discountPercentage}
                              onChange={handleNewProductChange}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                            />
                          </div>
                        </div>

                        {/* Inventory Status */}
                        <div className="sm:col-span-6">
                          <label htmlFor="inventoryStatus" className="block text-sm font-medium text-neutral-700">
                            Inventory Status
                          </label>
                          <div className="mt-1">
                            <select
                              id="inventoryStatus"
                              name="inventoryStatus"
                              value={newProduct.inventoryStatus}
                              onChange={handleNewProductChange}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                            >
                              <option value="in-stock">In Stock</option>
                              <option value="low-stock">Low Stock</option>
                              <option value="out-of-stock">Out of Stock</option>
                            </select>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-6">
                          <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                            Description
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="description"
                              name="description"
                              rows="3"
                              value={newProduct.description}
                              onChange={handleNewProductChange}
                              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md"
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          {submitting ? 'Adding...' : 'Add Product'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;