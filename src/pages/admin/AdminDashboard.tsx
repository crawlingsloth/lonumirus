import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAll } from '../../lib/db';
import type { Order } from '../../types';

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const allOrders = await getAll<Order>('orders');
    setOrders(allOrders);
  };

  const countByStatus = (status: string) => {
    return orders.filter((o) => o.status === status).length;
  };

  const deliveredToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return orders.filter(
      (o) => o.status === 'delivered' && o.createdAt.split('T')[0] === today
    ).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Submitted</div>
          <div className="text-3xl font-bold text-gray-900">{countByStatus('submitted')}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Payment Confirmed</div>
          <div className="text-3xl font-bold text-blue-600">{countByStatus('payment_confirmed')}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Preparing</div>
          <div className="text-3xl font-bold text-orange-600">{countByStatus('preparing')}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Delivered Today</div>
          <div className="text-3xl font-bold text-green-600">{deliveredToday()}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/boats/new"
            className="block p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <div className="font-medium text-gray-900">Add Boat</div>
          </Link>

          <Link
            to="/admin/orders"
            className="block p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div className="font-medium text-gray-900">Manage Orders</div>
          </Link>

          <Link
            to="/admin/users"
            className="block p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <div className="font-medium text-gray-900">Manage Users</div>
          </Link>

          <Link
            to="/admin/batches"
            className="block p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <div className="font-medium text-gray-900">Batches</div>
          </Link>
        </div>
      </div>

      {/* Public Pages Link */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Public Boat Pages</h3>
        <p className="text-sm text-blue-700 mb-3">Customers can view and order via these public pages:</p>
        <Link to="/boats" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          View Public Boat Pages
        </Link>
      </div>
    </div>
  );
}
