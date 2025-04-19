// frontend/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingBagIcon,
  UserIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import productService from '../../services/product.service';
import orderService from '../../services/order.service';
import userService from '../../services/user.service';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get product count
        const productsResponse = await productService.getProducts({ limit: 1 });
        const totalProducts = productsResponse.data?.pagination?.totalItems || 0;

        // Get order stats
        const orderStatsResponse = await orderService.getOrderStats();
        const totalOrders = orderStatsResponse.data?.totals?.orders || 0;
        const totalRevenue = orderStatsResponse.data?.totals?.revenue || 0;

        // Get users count (admin only)
        const usersResponse = await userService.getAllUsers();
        const totalUsers = usersResponse.data?.length || 0;

        setStats({
          totalProducts,
          totalUsers,
          totalOrders,
          totalRevenue
        });

        // Get recent products
        const recentProductsResponse = await productService.getProducts({ 
          limit: 4,
          sort: 'newest'
        });

        setRecentProducts(recentProductsResponse.data?.products || []);

        // Get recent orders
        const recentOrdersResponse = await orderService.getAllOrders({
          limit: 4
        });

        setRecentOrders(recentOrdersResponse.data?.orders || []);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading && !recentProducts.length) {
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
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Products Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                  <ShoppingBagIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Total Products
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900">
                        {stats.totalProducts}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/admin/products" className="font-medium text-primary hover:text-primary-dark">
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <UserIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Total Users
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900">
                        {stats.totalUsers}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/admin/users" className="font-medium text-primary hover:text-primary-dark">
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <ChartBarIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Total Orders
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900">
                        {stats.totalOrders}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/admin/orders" className="font-medium text-primary hover:text-primary-dark">
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-accent-light rounded-md p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">
                      Total Revenue
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-neutral-900">
                        ₹{stats.totalRevenue.toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/admin/orders" className="font-medium text-primary hover:text-primary-dark">
                  View details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Products</h2>
            <Link
              to="/admin/products/new"
              className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Product
            </Link>
          </div>
          
          <div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Name
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
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {recentProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">
                        <Link to={`/admin/products/edit/${product.id}`} className="hover:text-primary">
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">₹{product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {product.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              View all orders
            </Link>
          </div>
          
          <div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Order ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">
                        <Link to={`/admin/orders/${order.id}`} className="hover:text-primary">
                          {order.id}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{order.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'Processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      ₹{order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {order.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;