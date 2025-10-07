import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getById, getAll, update } from '../../lib/db';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import { StatusBadge } from '../../components/StatusBadge';
import type { Batch, Order, Boat, OrderStatus } from '../../types';

export function DeliveryBatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleOrderStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      const updated = { ...order, status: newStatus };
      await update('orders', updated);
      await loadData(batch!.id);
      showToast(`Order ${order.shortCode} marked as ${newStatus}`, 'success');
    } catch (error) {
      showToast('Failed to update order', 'error');
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
          <Link to="/delivery/batches" className="text-blue-600 hover:text-blue-800">
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
        <Link to="/delivery/batches" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Batches
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{batch.title}</h1>
        <p className="text-sm text-gray-600 mt-1">{orders.length} order(s)</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No orders in this batch</p>
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
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl font-bold text-gray-900">{order.shortCode}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.product.name} × {order.qty}
                        </div>
                        {order.address && (
                          <div className="text-sm text-gray-500 mt-1">
                            Contact: {order.address.contactName} ({order.address.contactPhone})
                          </div>
                        )}
                        {order.notes && (
                          <div className="text-sm text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                            Note: {order.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        {order.status !== 'preparing' && order.status !== 'delivered' && (
                          <button
                            onClick={() => handleOrderStatusChange(order, 'preparing')}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm whitespace-nowrap"
                          >
                            Set Preparing
                          </button>
                        )}
                        {order.status !== 'delivered' && (
                          <button
                            onClick={() => handleOrderStatusChange(order, 'delivered')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
