// frontend/src/pages/admin/ContentEditor.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import contentService from '../../services/content.service';

const ContentEditor = () => {
  const { user } = useAuth();
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [newContent, setNewContent] = useState({
    section: '',
    key: '',
    value: '',
    type: 'text'
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch content on component mount
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await contentService.getAllContent();
      setContent(response.data);

      if (!activeSection && Object.keys(response.data).length > 0) {
        setActiveSection(Object.keys(response.data)[0]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content. Please try again.');
      setLoading(false);
    }
  };

  const handleEditClick = (section, key, item) => {
    setEditingContent({
      id: item.id,
      section,
      key,
      value: item.value,
      type: item.type
    });
  };

  const handleCancelEdit = () => {
    setEditingContent(null);
  };

  const handleUpdateContent = async () => {
    try {
      setLoading(true);

      if (editingContent.type === 'image' && typeof editingContent.value === 'object') {
        // Handle image upload
        const formData = new FormData();
        formData.append('image', editingContent.value);

        await contentService.uploadContentImage(editingContent.id, formData);
      } else {
        // Handle text content update
        await contentService.updateContent(editingContent.id, {
          value: editingContent.value
        });
      }

      // Show success message
      setSuccessMessage('Content updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset state and fetch updated content
      setEditingContent(null);
      fetchContent();
    } catch (err) {
      console.error('Error updating content:', err);
      setError('Failed to update content. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (editingContent) {
      if (e.target.type === 'file') {
        setEditingContent({
          ...editingContent,
          value: e.target.files[0]
        });
      } else {
        setEditingContent({
          ...editingContent,
          value: e.target.value
        });
      }
    }
  };

  const handleNewContentChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setNewContent({
        ...newContent,
        value: files[0],
        type: 'image'
      });
    } else {
      setNewContent({
        ...newContent,
        [name]: value
      });
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (newContent.type === 'image' && typeof newContent.value === 'object') {
        // This is a multi-step process for image content
        // 1. Create the content item first
        const response = await contentService.addContent({
          section: newContent.section,
          key: newContent.key,
          value: '', // Temporary empty value
          type: 'image'
        });

        // 2. Then upload the image
        const contentId = response.data.id;
        const formData = new FormData();
        formData.append('image', newContent.value);

        await contentService.uploadContentImage(contentId, formData);
      } else {
        // Regular text content
        await contentService.addContent(newContent);
      }

      // Show success message
      setSuccessMessage('Content added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset form and fetch updated content
      setNewContent({
        section: '',
        key: '',
        value: '',
        type: 'text'
      });
      fetchContent();
    } catch (err) {
      console.error('Error adding content:', err);
      setError('Failed to add content. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      setLoading(true);

      await contentService.deleteContent(id);

      // Show success message
      setSuccessMessage('Content deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Fetch updated content
      fetchContent();
    } catch (err) {
      console.error('Error deleting content:', err);
      setError('Failed to delete content. Please try again.');
      setLoading(false);
    }
  };

  if (loading && Object.keys(content).length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button 
          onClick={fetchContent}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const sections = Object.keys(content);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-heading font-bold mb-6">Content Management</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-neutral-800 text-white py-3 px-4">
              <h2 className="font-bold">Sections</h2>
            </div>
            <nav className="divide-y divide-neutral-200">
              {sections.map((section) => (
                <button
                  key={section}
                  className={`w-full text-left px-4 py-3 hover:bg-neutral-100 ${
                    activeSection === section ? 'bg-neutral-100 font-medium' : ''
                  }`}
                  onClick={() => setActiveSection(section)}
                >
                  {section.replace('_', ' ').charAt(0).toUpperCase() + section.replace('_', ' ').slice(1)}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Add New Content Form */}
          <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
            <div className="bg-neutral-800 text-white py-3 px-4">
              <h2 className="font-bold">Add New Content</h2>
            </div>
            <form onSubmit={handleAddContent} className="p-4">
              <div className="mb-4">
                <label className="block text-neutral-700 text-sm font-bold mb-2">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={newContent.section}
                  onChange={handleNewContentChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-neutral-700 text-sm font-bold mb-2">
                  Key
                </label>
                <input
                  type="text"
                  name="key"
                  value={newContent.key}
                  onChange={handleNewContentChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-neutral-700 text-sm font-bold mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={newContent.type}
                  onChange={handleNewContentChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-neutral-700 text-sm font-bold mb-2">
                  Value
                </label>
                {newContent.type === 'image' ? (
                  <input
                    type="file"
                    name="value"
                    onChange={handleNewContentChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                    accept="image/*"
                  />
                ) : (
                  <textarea
                    name="value"
                    value={newContent.value}
                    onChange={handleNewContentChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                  ></textarea>
                )}
              </div>
              
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Content'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Content Editing Area */}
        <div className="md:col-span-3">
          {activeSection && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-neutral-800 text-white py-3 px-4">
                <h2 className="font-bold">
                  {activeSection.replace('_', ' ').charAt(0).toUpperCase() + activeSection.replace('_', ' ').slice(1)} Content
                </h2>
              </div>
              
              <div className="p-4">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {Object.keys(content[activeSection]).map((key) => {
                      const item = content[activeSection][key];
                      const isEditing = editingContent && editingContent.id === item.id;
                      
                      return (
                        <tr key={key}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                            {key}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {item.type}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-500">
                            {isEditing ? (
                              item.type === 'image' ? (
                                <div>
                                  <div className="mb-2">
                                    <img 
                                      src={typeof item.value === 'string' ? item.value : URL.createObjectURL(item.value)} 
                                      alt={key}
                                      className="max-h-24"
                                    />
                                  </div>
                                  <input
                                    type="file"
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                                    accept="image/*"
                                  />
                                </div>
                              ) : (
                                <textarea
                                  value={editingContent.value}
                                  onChange={handleInputChange}
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline"
                                  rows="3"
                                ></textarea>
                              )
                            ) : (
                              item.type === 'image' ? (
                                <img 
                                  src={item.value} 
                                  alt={key}
                                  className="max-h-24"
                                />
                              ) : (
                                <div className="max-h-24 overflow-y-auto">
                                  {item.value}
                                </div>
                              )
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {isEditing ? (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={handleUpdateContent}
                                  className="text-green-600 hover:text-green-900"
                                  disabled={loading}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-neutral-600 hover:text-neutral-900"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-4">
                                <button
                                  onClick={() => handleEditClick(activeSection, key, item)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteContent(item.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;