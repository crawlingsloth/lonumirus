import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getById } from '../../lib/db';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { StatusBadge } from '../../components/StatusBadge';
import type { Order, Boat } from '../../types';

export function ShareOrderPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [token]);

  const loadOrder = async () => {
    if (!token) return;

    try {
      // In a real app, you'd decode the token to get the order ID
      // For demo, we'll try to load by ID directly
      const foundOrder = await getById<Order>('orders', token);
      setOrder(foundOrder || null);

      if (foundOrder?.boatId) {
        const foundBoat = await getById<Boat>('boats', foundOrder.boatId);
        setBoat(foundBoat || null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            This is a demo stub for shareable order links. In a production app, orders would be
            accessible via unique tokens that work across devices.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            For this local demo, order data is only available on the device where it was created.
          </p>
          <Link to="/boats" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700">
            View Our Boats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.shortCode}</h1>
            <StatusBadge status={order.status} />
          </div>

          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Product</h3>
              <p className="text-gray-700">
                {order.product.name} × {order.qty}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatCurrency(order.totalMvr)}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Destination</h3>
              {order.destinationType === 'boat' && boat ? (
                <p className="text-gray-700">
                  <span className="font-medium">{boat.name}</span> ({boat.code})
                </p>
              ) : order.address ? (
                <div className="text-gray-700">
                  <p>{order.address.addressLine}</p>
                  <p>{order.address.island}, {order.address.atoll}</p>
                  <p className="mt-2">
                    <span className="font-medium">Contact:</span> {order.address.contactName}
                  </p>
                  <p>{order.address.contactPhone}</p>
                </div>
              ) : null}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Order Date</h3>
              <p className="text-gray-700">{formatDateTime(order.createdAt)}</p>
            </div>

            {order.notes && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link to="/boats" className="text-orange-600 hover:text-orange-700 font-medium">
              Browse Our Boats →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
