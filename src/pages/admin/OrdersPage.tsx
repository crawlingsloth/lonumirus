import { useEffect, useState } from 'react';
import { getAll, update, getById } from '../../lib/db';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import { StatusBadge } from '../../components/StatusBadge';
import type { Order, OrderStatus, Boat, User } from '../../types';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast, showToast, hideToast } = useToast();

  // Filters
  const [filters, setFilters] = useState({
    status: '' as OrderStatus | '',
    destinationType: '' as 'boat' | 'address' | '',
    boatId: '',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, boatsData, usersData] = await Promise.all([
        getAll<Order>('orders'),
        getAll<Boat>('boats'),
        getAll<User>('users'),
      ]);
      setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setBoats(boatsData);
      setUsers(usersData);
    } catch (error) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    if (filters.status) {
      result = result.filter(o => o.status === filters.status);
    }

    if (filters.destinationType) {
      result = result.filter(o => o.destinationType === filters.destinationType);
    }

    if (filters.boatId) {
      result = result.filter(o => o.boatId === filters.boatId);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(o => {
        const customer = users.find(u => u.id === o.customerId);
        return (
          o.shortCode.toLowerCase().includes(search) ||
          customer?.email.toLowerCase().includes(search) ||
          o.address?.island.toLowerCase().includes(search) ||
          o.address?.atoll.toLowerCase().includes(search)
        );
      });
    }

    setFilteredOrders(result);
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      const updated = { ...order, status: newStatus };
      await update('orders', updated);
      await loadData();
      showToast(`Order ${order.shortCode} updated to ${newStatus}`, 'success');
      setSelectedOrder(null);
    } catch (error) {
      showToast('Failed to update order', 'error');
    }
  };

  const getDestinationSummary = (order: Order): string => {
    if (order.destinationType === 'boat') {
      const boat = boats.find(b => b.id === order.boatId);
      return boat ? `Boat: ${boat.name}` : 'Boat: Unknown';
    } else {
      return `${order.address?.island}, ${order.address?.atoll}`;
    }
  };

  const getCustomerEmail = (customerId: string): string => {
    const user = users.find(u => u.id === customerId);
    return user?.email || 'Unknown';
  };

  const statuses: OrderStatus[] = ['submitted', 'payment_confirmed', 'preparing', 'delivered', 'cancelled'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ ...filters, status: '' })}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              filters.status === ''
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilters({ ...filters, status })}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                filters.status === status
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Destination Type</label>
            <select
              value={filters.destinationType}
              onChange={(e) => setFilters({ ...filters, destinationType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All</option>
              <option value="boat">Boat</option>
              <option value="address">Address</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Boat</label>
            <select
              value={filters.boatId}
              onChange={(e) => setFilters({ ...filters, boatId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={filters.destinationType === 'address'}
            >
              <option value="">All Boats</option>
              {boats.map(boat => (
                <option key={boat.id} value={boat.id}>{boat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Short code, email, island, atoll..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{order.shortCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCustomerEmail(order.customerId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.product.name} × {order.qty}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(order.totalMvr)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getDestinationSummary(order)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          boats={boats}
          customer={users.find(u => u.id === selectedOrder.customerId)}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(status) => handleStatusChange(selectedOrder, status)}
        />
      )}

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}

interface OrderDetailModalProps {
  order: Order;
  boats: Boat[];
  customer?: User;
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
}

function OrderDetailModal({ order, boats, customer, onClose, onStatusChange }: OrderDetailModalProps) {
  const getDestinationInfo = () => {
    if (order.destinationType === 'boat') {
      const boat = boats.find(b => b.id === order.boatId);
      return (
        <div>
          <div className="font-semibold">Boat Delivery</div>
          <div className="text-gray-600">{boat?.name || 'Unknown Boat'}</div>
          <div className="text-sm text-gray-500">Code: {boat?.code}</div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="font-semibold">Address Delivery</div>
          <div className="text-gray-600">{order.address?.addressLine}</div>
          <div className="text-gray-600">{order.address?.island}, {order.address?.atoll}</div>
          <div className="text-sm text-gray-500 mt-1">
            Contact: {order.address?.contactName} ({order.address?.contactPhone})
          </div>
        </div>
      );
    }
  };

  const canTransitionTo = (newStatus: OrderStatus): boolean => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      submitted: ['payment_confirmed', 'cancelled'],
      payment_confirmed: ['preparing', 'cancelled'],
      preparing: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };
    return transitions[order.status]?.includes(newStatus) || false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Short Code */}
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Order Code</div>
            <div className="text-4xl font-bold text-gray-900">{order.shortCode}</div>
          </div>

          {/* Status */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Status</div>
            <StatusBadge status={order.status} />
          </div>

          {/* Customer */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Customer</div>
            <div className="text-gray-900">{customer?.email || 'Unknown'}</div>
            {customer?.name && <div className="text-gray-600">{customer.name}</div>}
          </div>

          {/* Product */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Product</div>
            <div className="text-gray-900">{order.product.name}</div>
            <div className="text-gray-600">Quantity: {order.qty}</div>
            <div className="text-gray-900 font-semibold">Total: {formatCurrency(order.totalMvr)}</div>
          </div>

          {/* Destination */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Destination</div>
            {getDestinationInfo()}
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
              <div className="text-gray-600 bg-gray-50 p-3 rounded">{order.notes}</div>
            </div>
          )}

          {/* Payment Slip */}
          {order.paymentSlipDataUrl && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Payment Slip</div>
              <img
                src={order.paymentSlipDataUrl}
                alt="Payment Slip"
                className="max-w-full h-auto rounded border border-gray-200"
              />
            </div>
          )}

          {/* Date */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Created</div>
            <div className="text-gray-600">{formatDateTime(order.createdAt)}</div>
          </div>

          {/* Status Actions */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Change Status</div>
            <div className="flex flex-wrap gap-2">
              {(['payment_confirmed', 'preparing', 'delivered', 'cancelled'] as OrderStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  disabled={!canTransitionTo(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    canTransitionTo(status)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Set {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
