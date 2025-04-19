// frontend/src/components/admin/ProductForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import ImageUploader from '../common/ImageUploader';
import productService from '../../services/product.service';
import categoryService from '../../services/category.service';

const ProductForm = ({ product = null, isEditing = false }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    discountPercentage: '',
    description: '',
    ingredients: '',
    howToUse: '',
    inventoryStatus: 'in-stock',
    inventoryMessage: ''
  });
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState({ name: '', value: '#ffffff' });
  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        showError('Failed to load categories. Please try again.');
      }
    };

    fetchCategories();

    // Initialize form with product data if editing
    if (isEditing && product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        discountPercentage: product.discountPercentage || '',
        description: product.description || '',
        ingredients: product.ingredients || '',
        howToUse: product.howToUse || '',
        inventoryStatus: product.inventoryStatus || 'in-stock',
        inventoryMessage: product.inventoryMessage || ''
      });

      if (product.colors) {
        setColors(product.colors);
      }

      if (product.images) {
        setImages(product.images);
        const primaryImageIdx = product.images.findIndex(img => img.isPrimary);
        if (primaryImageIdx !== -1) {
          setPrimaryImageIndex(primaryImageIdx);
        }
      }
    }
  }, [isEditing, product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorInputChange = (e) => {
    const { name, value } = e.target;
    setNewColor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addColor = () => {
    if (newColor.name.trim() === '') {
      showError('Color name is required');
      return;
    }

    setColors(prev => [...prev, { ...newColor }]);
    setNewColor({ name: '', value: '#ffffff' });
  };

  const removeColor = (index) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (file) => {
    // Create a preview URL for the file
    const imageUrl = URL.createObjectURL(file);
    
    // Add to images array with file and preview URL
    setImages(prev => [...prev, {
      file,
      previewUrl: imageUrl,
      isPrimary: images.length === 0 // First image is primary by default
    }]);

    // If this is the first image, set it as primary
    if (images.length === 0) {
      setPrimaryImageIndex(0);
    }
  };

  const removeImage = (index) => {
    // Revoke object URL to avoid memory leaks
    if (images[index].previewUrl) {
      URL.revokeObjectURL(images[index].previewUrl);
    }

    // Remove the image
    setImages(prev => prev.filter((_, i) => i !== index));

    // Update primary image index if needed
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(images.length > 1 ? 0 : -1);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  const setPrimaryImage = (index) => {
    setPrimaryImageIndex(index);
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.category || !formData.price) {
      showError('Name, category, and price are required');
      return;
    }

    try {
      setLoading(true);

      let productData = {
        ...formData,
        colors: JSON.stringify(colors)
      };

      let productId;
      
      if (isEditing) {
        // Update existing product
        const response = await productService.updateProduct(product.id, productData);
        productId = product.id;
        showSuccess('Product updated successfully');
      } else {
        // Create new product
        const response = await productService.createProduct(productData);
        productId = response.data.id;
        showSuccess('Product created successfully');
      }

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Skip images that are already uploaded (for editing)
        if (!image.file) continue;
        
        const formData = new FormData();
        formData.append('image', image.file);
        formData.append('isPrimary', image.isPrimary ? 'true' : 'false');
        
        await productService.uploadProductImage(productId, formData);
      }

      setLoading(false);
      
      // Redirect to products list
      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      showError('Failed to save product. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-neutral-900">Product Information</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Basic information about the product.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-neutral-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-neutral-700">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="originalPrice" className="block text-sm font-medium text-neutral-700">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  id="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                />
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="discountPercentage" className="block text-sm font-medium text-neutral-700">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  id="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                />
              </div>

              <div className="col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-neutral-300 rounded-md"
                ></textarea>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="ingredients" className="block text-sm font-medium text-neutral-700">
                  Ingredients
                </label>
                <textarea
                  id="ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-neutral-300 rounded-md"
                ></textarea>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="howToUse" className="block text-sm font-medium text-neutral-700">
                  How to Use
                </label>
                <textarea
                  id="howToUse"
                  name="howToUse"
                  value={formData.howToUse}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border border-neutral-300 rounded-md"
                ></textarea>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="inventoryStatus" className="block text-sm font-medium text-neutral-700">
                  Inventory Status
                </label>
                <select
                  id="inventoryStatus"
                  name="inventoryStatus"
                  value={formData.inventoryStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-neutral-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="inventoryMessage" className="block text-sm font-medium text-neutral-700">
                  Inventory Message
                </label>
                <input
                  type="text"
                  name="inventoryMessage"
                  id="inventoryMessage"
                  value={formData.inventoryMessage}
                  onChange={handleInputChange}
                  placeholder="e.g., Only few left!"
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-neutral-900">Product Colors</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Add color variants for the product.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="space-y-6">
              {/* Current Colors */}
              {colors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">Current Colors</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {colors.map((color, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-neutral-300 rounded-md">
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded-full mr-3"
                            style={{ backgroundColor: color.value }}
                          ></div>
                          <span className="text-sm text-neutral-700">{color.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Color */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-3">Add New Color</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow">
                    <label htmlFor="colorName" className="sr-only">
                      Color Name
                    </label>
                    <input
                      type="text"
                      id="colorName"
                      name="name"
                      value={newColor.name}
                      onChange={handleColorInputChange}
                      placeholder="Color Name (e.g., Warm Beige)"
                      className="focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-300 rounded-md"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <label htmlFor="colorValue" className="sr-only">
                      Color Value
                    </label>
                    <input
                      type="color"
                      id="colorValue"
                      name="value"
                      value={newColor.value}
                      onChange={handleColorInputChange}
                      className="h-10 w-16 p-0 border border-neutral-300 rounded"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={addColor}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Add Color
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-neutral-900">Product Images</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Upload images for the product. First image will be the primary image.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="space-y-6">
              {/* Current Images */}
              {images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">Current Images</h4>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((image, index) => (
                      <div key={index} className={`relative border ${primaryImageIndex === index ? 'border-primary border-2' : 'border-neutral-300'} rounded-md overflow-hidden`}>
                        <div className="aspect-w-1 aspect-h-1">
                          <img
                            src={image.previewUrl || image.imagePath}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="absolute top-0 left-0 right-0 flex justify-between p-2 bg-black bg-opacity-50">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className={`text-xs rounded px-2 py-1 ${
                              primaryImageIndex === index
                                ? 'bg-primary text-white'
                                : 'bg-white text-neutral-900'
                            }`}
                          >
                            {primaryImageIndex === index ? 'Primary' : 'Set Primary'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-white hover:text-red-200"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Image */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-3">Upload New Image</h4>
                <ImageUploader
                  onImageChange={handleImageUpload}
                  maxSizeMB={5}
                  label=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="bg-white py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;