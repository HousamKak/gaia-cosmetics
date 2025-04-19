// frontend/src/pages/admin/OrderManager.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../../components/common/Modal';
import orderService from '../../services/order.service';
import { formatPrice } from '../../utils/formatter';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    'processing': { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
    'shipped': { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
    'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    'returned': { color: 'bg-orange-100 text-orange-800', label: 'Returned' },
    'refunded': { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

const OrderManager = () => {
  const { showSuccess, showError } = useNotification();
  
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  // Update status modal
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch orders on component mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [pagination.currentPage, statusFilter, sortBy, sortDir]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.currentPage,
        limit: pagination.perPage,
        status: statusFilter || undefined,
        sort: sortBy,
        dir: sortDir
      };
      
      if (dateRange.start) {
        params.startDate = dateRange.start;
      }
      
      if (dateRange.end) {
        params.endDate = dateRange.end;
      }
      
      if (search) {
        params.search = search;
      }
      
      const response = await orderService.getAllOrders(params);
      
      if (response.data) {
        setOrders(response.data.orders);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
          perPage: response.data.pagination.perPage
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'statusFilter') {
      setStatusFilter(value);
    } else if (name === 'startDate') {
      setDateRange(prev => ({ ...prev, start: value }));
    } else if (name === 'endDate') {
      setDateRange(prev => ({ ...prev, end: value }));
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDateRange({ start: '', end: '' });
    setSortBy('date');
    setSortDir('desc');
    setFiltersOpen(false);
    
    // Reset to first page and fetch orders
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    // fetchOrders will be called by the useEffect
  };

  const handleSort = (field) => {
    if (field === sortBy) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const openUpdateStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setUpdateStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      setUpdatingStatus(true);
      
      await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      
      // Update order in state
      setOrders(prev => 
        prev.map(order => 
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      setSelectedOrder(prev => ({
        ...prev,
        status: newStatus
      }));
      
      showSuccess(`Order #${selectedOrder.orderNumber} status updated to ${newStatus}`);
      setUpdateStatusModalOpen(false);
      setUpdatingStatus(false);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      showError('Failed to update order status. Please try again.');
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Orders</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Error message */}
        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              className="ml-4 text-red-700 underline"
              onClick={fetchOrders}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Form */}
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="focus:ring-primary focus:border-primary flex-grow block w-full rounded-none rounded-l-md sm:text-sm border-neutral-300"
                    placeholder="Search by order #, customer name or email"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </form>
              </div>
              
              {/* Filter Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="inline-flex items-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
                >
                  <AdjustmentsHorizontalIcon className="-ml-1 mr-2 h-5 w-5 text-neutral-500" />
                  Filters
                </button>
              </div>
            </div>
            
            {/* Advanced Filters */}
            {filtersOpen && (
              <div className="mt-4 border-t border-neutral-200 pt-4">
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-neutral-700">
                      Order Status
                    </label>
                    <select
                      id="statusFilter"
                      name="statusFilter"
                      value={statusFilter}
                      onChange={handleFilterChange}
                      className="mt-1 block w-full py-2 px-3 border border-neutral-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700">
                      From Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      value={dateRange.start}
                      onChange={handleFilterChange}
                      className="mt-1 block w-full py-2 px-3 border border-neutral-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700">
                      To Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      value={dateRange.end}
                      onChange={handleFilterChange}
                      className="mt-1 block w-full py-2 px-3 border border-neutral-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mr-4 text-sm text-neutral-700 hover:text-neutral-900"
                  >
                    Clear Filters
                  </button>
                  <button
                    type="button"
                    onClick={fetchOrders}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <p className="text-neutral-500">No orders found</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-primary hover:text-primary-dark"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        Order
                        {sortBy === 'id' && (
                          <ArrowsUpDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortBy === 'date' && (
                          <ArrowsUpDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('customer')}
                    >
                      <div className="flex items-center">
                        Customer
                        {sortBy === 'customer' && (
                          <ArrowsUpDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('total')}
                    >
                      <div className="flex items-center">
                        Total
                        {sortBy === 'total' && (
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
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {order.user_name || order.guest_name || 'Guest'}<br />
                        <span className="text-xs">{order.user_email || order.guest_email || ''}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-primary hover:text-primary-dark mr-4"
                        >
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">View</span>
                        </button>
                        <button
                          onClick={() => openUpdateStatusModal(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Update Status</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
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

      {/* Order Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Order #${selectedOrder?.orderNumber || ''}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <OrderStatusBadge status={selectedOrder.status} />
                <span className="text-sm text-neutral-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  openUpdateStatusModal(selectedOrder);
                }}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
              >
                Update Status
              </button>
            </div>
            
            {/* Customer Info */}
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-neutral-900 mb-2">Customer Information</h3>
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Name:</span> {selectedOrder.user_name || selectedOrder.guest_name || 'Guest'}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Email:</span> {selectedOrder.user_email || selectedOrder.guest_email || 'N/A'}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Account:</span> {selectedOrder.user_id ? 'Registered User' : 'Guest Checkout'}
              </p>
            </div>
            
            {/* Shipping and Billing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Shipping Address</h3>
                {selectedOrder.shipping_address && (
                  <div className="text-sm text-neutral-700">
                    <p>{selectedOrder.shipping_address.name}</p>
                    <p>{selectedOrder.shipping_address.address}</p>
                    <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postalCode}</p>
                    <p>{selectedOrder.shipping_address.country}</p>
                    <p className="mt-1">{selectedOrder.shipping_address.phone}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Billing Address</h3>
                {selectedOrder.billing_address && (
                  <div className="text-sm text-neutral-700">
                    <p>{selectedOrder.billing_address.name}</p>
                    <p>{selectedOrder.billing_address.address}</p>
                    <p>{selectedOrder.billing_address.city}, {selectedOrder.billing_address.state} {selectedOrder.billing_address.postalCode}</p>
                    <p>{selectedOrder.billing_address.country}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Items */}
            <div>
              <h3 className="text-sm font-medium text-neutral-900 mb-2">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-900">
                          <div className="flex items-center">
                            {item.image && (
                              <div className="flex-shrink-0 h-10 w-10 bg-neutral-100 rounded overflow-hidden mr-3">
                                <img
                                  src={item.image}
                                  alt={item.product_name}
                                  className="h-10 w-10 object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{item.product_name}</div>
                              {item.color && (
                                <div className="text-neutral-500 flex items-center text-xs">
                                  Color: 
                                  <span 
                                    className="ml-1 inline-block w-3 h-3 rounded-full border border-neutral-300"
                                    style={{ backgroundColor: item.color }}
                                  ></span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-500">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-500 text-right">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-900 text-right">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Subtotal:</span>
                    <span className="text-neutral-900">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Discount:</span>
                      <span className="text-green-600">-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Shipping:</span>
                    <span className="text-neutral-900">
                      {selectedOrder.shipping_cost > 0 
                        ? formatPrice(selectedOrder.shipping_cost) 
                        : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-medium pt-1 border-t border-neutral-200">
                    <span className="text-neutral-900">Total:</span>
                    <span className="text-neutral-900">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="bg-neutral-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-neutral-900 mb-2">Payment Information</h3>
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Payment Method:</span> {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
              </p>
              <p className="text-sm text-neutral-700">
                <span className="font-medium">Payment Status:</span> {selectedOrder.status === 'cancelled' ? 'Cancelled' : 'Paid'}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="inline-flex justify-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                Print Order
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={updateStatusModalOpen}
        onClose={() => setUpdateStatusModalOpen(false)}
        title={`Update Order Status: #${selectedOrder?.orderNumber || ''}`}
      >
        <div className="space-y-6">
          <div>
            <label htmlFor="orderStatus" className="block text-sm font-medium text-neutral-700">
              Select New Status
            </label>
            <select
              id="orderStatus"
              name="orderStatus"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-neutral-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setUpdateStatusModalOpen(false)}
              className="inline-flex justify-center px-4 py-2 border border-neutral-300 shadow-sm text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={updatingStatus}
              className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderManager;