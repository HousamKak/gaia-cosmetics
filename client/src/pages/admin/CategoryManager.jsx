// frontend/src/pages/admin/CategoryManager.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import ImageUploader from '../../components/common/ImageUploader';
import Modal from '../../components/common/Modal';
import categoryService from '../../services/category.service';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const CategoryManager = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  
  // New/Edit Category State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoryService.getAllCategories();
      
      if (response.data) {
        setCategories(response.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Client-side filtering by name
    // In a production app, this might be a server-side search
  };

  const handleSort = (field) => {
    // If same field, toggle direction
    if (field === sortBy) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDir === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'productCount') {
      return sortDir === 'asc'
        ? a.product_count - b.product_count
        : b.product_count - a.product_count;
    }
    return 0;
  });

  const filteredCategories = sortedCategories.filter(category => 
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (file) => {
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      image: null
    });
    setIsEditing(false);
    setCurrentCategoryId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: null // Don't set the image, let user decide if they want to change it
    });
    setIsEditing(true);
    setCurrentCategoryId(category.id);
    setIsModalOpen(true);
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      showError('Category name is required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const categoryData = new FormData();
      categoryData.append('name', formData.name);
      if (formData.description) {
        categoryData.append('description', formData.description);
      }
      if (formData.image) {
        categoryData.append('image', formData.image);
      }
      
      if (isEditing) {
        // Update existing category
        await categoryService.updateCategory(currentCategoryId, categoryData);
        showSuccess('Category updated successfully');
      } else {
        // Create new category
        await categoryService.createCategory(categoryData);
        showSuccess('Category created successfully');
      }
      
      // Close modal and refresh categories
      setIsModalOpen(false);
      fetchCategories();
      
    } catch (err) {
      console.error('Error saving category:', err);
      showError(err.response?.data?.message || 'Failed to save category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      setSubmitting(true);
      
      await categoryService.deleteCategory(categoryToDelete.id);
      
      showSuccess('Category deleted successfully');
      
      // Close modal and refresh categories
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
      
    } catch (err) {
      console.error('Error deleting category:', err);
      
      // Check if error is due to products using this category
      if (err.response?.data?.productCount) {
        showError(`Cannot delete category with ${err.response.data.productCount} associated products. Reassign products first.`);
      } else {
        showError('Failed to delete category. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-neutral-900">Categories</h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Error message */}
        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              className="ml-4 text-red-700 underline"
              onClick={fetchCategories}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and filters */}
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <form onSubmit={handleSearch} className="flex rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:ring-primary focus:border-primary flex-grow block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-neutral-300"
              placeholder="Search categories..."
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-neutral-500">No categories found</p>
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
              >
                Add your first category
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {sortBy === 'name' && (
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('productCount')}
                  >
                    <div className="flex items-center">
                      Products
                      {sortBy === 'productCount' && (
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
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
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          {category.image_path ? (
                            <img
                              src={category.image_path}
                              alt={category.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-neutral-200 flex items-center justify-center">
                              <span className="text-neutral-500 font-bold">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-neutral-500">{category.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {category.product_count} products
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => confirmDelete(category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Category Image
            </label>
            <ImageUploader
              onImageChange={handleImageChange}
              initialImage={isEditing ? `/uploads/categories/${currentCategoryId}.jpg` : null}
              label=""
            />
            
            {isEditing && !formData.image && (
              <p className="mt-2 text-sm text-neutral-500">
                Leave empty to keep the current image
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="inline-flex justify-center py-2 px-4 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
      >
        <div className="space-y-6">
          <p className="text-neutral-700">
            Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?
            {categoryToDelete?.product_count > 0 && (
              <span className="block mt-2 text-red-500">
                Warning: This category has {categoryToDelete.product_count} associated products. Deleting it may affect these products.
              </span>
            )}
          </p>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="inline-flex justify-center py-2 px-4 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteCategory}
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryManager;