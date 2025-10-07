import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersByCustomer, getAll } from '../../lib/db';
import { getCurrentUser } from '../../lib/auth';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import { StatusBadge } from '../../components/StatusBadge';
import type { Order, Boat } from '../../types';

export function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user) {
        showToast('Please log in', 'error');
        return;
      }

      const [ordersData, boatsData] = await Promise.all([
        getOrdersByCustomer(user.id),
        getAll<Boat>('boats'),
      ]);

      setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setBoats(boatsData);
    } catch (error) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDestinationSummary = (order: Order): string => {
    if (order.destinationType === 'boat') {
      const boat = boats.find(b => b.id === order.boatId);
      return boat ? boat.name : 'Unknown Boat';
    } else {
      return `${order.address?.island}, ${order.address?.atoll}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">My Orders</h1>
        <Link
          to="/customer/new-order"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
          <Link
            to="/customer/new-order"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Place your first order
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/customer/orders/${order.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{order.shortCode}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatDateTime(order.createdAt)}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-600">{order.product.name}</div>
                  <div className="text-gray-900 font-semibold">
                    {order.qty} × {formatCurrency(order.product.priceMvr)} = {formatCurrency(order.totalMvr)}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 text-xs">Destination</div>
                  <div className="text-gray-900">{getDestinationSummary(order)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
