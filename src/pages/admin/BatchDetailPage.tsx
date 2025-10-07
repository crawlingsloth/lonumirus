import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getById, getAll, update } from '../../lib/db';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import { StatusBadge } from '../../components/StatusBadge';
import type { Batch, Order, Boat, BatchStatus } from '../../types';

export function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (batchId: string) => {
    try {
      setLoading(true);
      const [batchData, ordersData, boatsData] = await Promise.all([
        getById<Batch>('batches', batchId),
        getAll<Order>('orders'),
        getAll<Boat>('boats'),
      ]);

      if (!batchData) {
        showToast('Batch not found', 'error');
        return;
      }

      setBatch(batchData);
      setAllOrders(ordersData);
      setBoats(boatsData);

      // Get orders in this batch
      const batchOrders = ordersData.filter(o => batchData.orderIds.includes(o.id));
      setOrders(batchOrders);
    } catch (error) {
      showToast('Failed to load batch', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: BatchStatus) => {
    if (!batch) return;

    try {
      const updated = { ...batch, status: newStatus };
      await update('batches', updated);
      setBatch(updated);
      showToast(`Batch status updated to ${newStatus}`, 'success');
    } catch (error) {
      showToast('Failed to update batch status', 'error');
    }
  };

  const handleAddOrders = async (orderIds: string[]) => {
    if (!batch) return;

    try {
      const updated = {
        ...batch,
        orderIds: [...new Set([...batch.orderIds, ...orderIds])],
      };
      await update('batches', updated);
      await loadData(batch.id);
      showToast(`${orderIds.length} order(s) added to batch`, 'success');
      setShowOrderPicker(false);
    } catch (error) {
      showToast('Failed to add orders', 'error');
    }
  };

  const handleRemoveOrder = async (orderId: string) => {
    if (!batch) return;

    try {
      const updated = {
        ...batch,
        orderIds: batch.orderIds.filter(id => id !== orderId),
      };
      await update('batches', updated);
      await loadData(batch.id);
      showToast('Order removed from batch', 'success');
    } catch (error) {
      showToast('Failed to remove order', 'error');
    }
  };

  const groupOrdersByDestination = () => {
    const groups: { [key: string]: Order[] } = {};

    orders.forEach(order => {
      let key: string;
      if (order.destinationType === 'boat') {
        const boat = boats.find(b => b.id === order.boatId);
        key = boat ? `Boat: ${boat.name}` : 'Boat: Unknown';
      } else {
        key = `${order.address?.island}, ${order.address?.atoll}`;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(order);
    });

    return groups;
  };

  const getBatchStatusBadge = (status: BatchStatus): string => {
    const classes = {
      planning: 'bg-gray-200 text-gray-800',
      loading: 'bg-blue-200 text-blue-800',
      out: 'bg-orange-200 text-orange-800',
      completed: 'bg-green-200 text-green-800',
      cancelled: 'bg-red-200 text-red-800',
    };
    return `px-3 py-1 rounded-full text-sm font-semibold ${classes[status]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading batch...</div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Batch not found</p>
          <Link to="/admin/batches" className="text-blue-600 hover:text-blue-800">
            Back to Batches
          </Link>
        </div>
      </div>
    );
  }

  const groupedOrders = groupOrdersByDestination();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/admin/batches" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Batches
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{batch.title}</h1>
          <span className={getBatchStatusBadge(batch.status)}>{batch.status}</span>
        </div>
      </div>

      {/* Status Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="text-sm font-medium text-gray-700 mb-3">Batch Status</div>
        <div className="flex flex-wrap gap-2">
          {(['planning', 'loading', 'out', 'completed', 'cancelled'] as BatchStatus[]).map(status => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={batch.status === status}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                batch.status === status
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Set {status}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowOrderPicker(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Orders
        </button>
        <Link
          to={`/admin/batches/${batch.id}/print-manifest`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Print Manifest
        </Link>
        <Link
          to={`/admin/batches/${batch.id}/print-labels`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Print 58mm Labels
        </Link>
      </div>

      {/* Orders grouped by destination */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No orders in this batch yet</p>
          <button
            onClick={() => setShowOrderPicker(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Add orders to get started
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedOrders).map(([destination, destOrders]) => (
            <div key={destination} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{destination}</h3>
                <p className="text-sm text-gray-600">{destOrders.length} order(s)</p>
              </div>
              <div className="divide-y divide-gray-200">
                {destOrders.map(order => (
                  <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900">{order.shortCode}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {order.product.name} × {order.qty}
                      </div>
                      {order.notes && (
                        <div className="text-sm text-gray-500 mt-1">Note: {order.notes}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveOrder(order.id)}
                      className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Picker Modal */}
      {showOrderPicker && (
        <OrderPickerModal
          allOrders={allOrders}
          currentOrderIds={batch.orderIds}
          boats={boats}
          onClose={() => setShowOrderPicker(false)}
          onAdd={handleAddOrders}
        />
      )}

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}

interface OrderPickerModalProps {
  allOrders: Order[];
  currentOrderIds: string[];
  boats: Boat[];
  onClose: () => void;
  onAdd: (orderIds: string[]) => void;
}

function OrderPickerModal({ allOrders, currentOrderIds, boats, onClose, onAdd }: OrderPickerModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Only show payment_confirmed and preparing orders not already in batch
  const availableOrders = allOrders.filter(
    o => !currentOrderIds.includes(o.id) &&
         (o.status === 'payment_confirmed' || o.status === 'preparing')
  );

  const handleToggle = (orderId: string) => {
    setSelectedIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length > 0) {
      onAdd(selectedIds);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Orders to Batch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {availableOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No available orders (only payment_confirmed and preparing orders can be added)
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Select orders to add ({selectedIds.length} selected)
            </div>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {availableOrders.map(order => (
                <label
                  key={order.id}
                  className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(order.id)}
                    onChange={() => handleToggle(order.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{order.shortCode}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {order.product.name} × {order.qty}
                    </div>
                    <div className="text-sm text-gray-500">{getDestinationSummary(order)}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={selectedIds.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {selectedIds.length} Order(s)
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
