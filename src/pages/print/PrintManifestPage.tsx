import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getById, getAll } from '../../lib/db';
import { formatDate } from '../../lib/utils';
import type { Batch, Order, Boat } from '../../types';

export function PrintManifestPage() {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [boats, setBoats] = useState<Record<string, Boat>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      const batchData = await getById<Batch>('batches', id);
      if (!batchData) return;

      setBatch(batchData);

      const allOrders = await getAll<Order>('orders');
      const batchOrders = allOrders.filter((o) => batchData.orderIds.includes(o.id));
      setOrders(batchOrders);

      const allBoats = await getAll<Boat>('boats');
      const boatsMap: Record<string, Boat> = {};
      allBoats.forEach((b) => {
        boatsMap[b.id] = b;
      });
      setBoats(boatsMap);
    } finally {
      setLoading(false);
    }
  };

  const getDestinationString = (order: Order): string => {
    if (order.destinationType === 'boat' && order.boatId) {
      const boat = boats[order.boatId];
      return boat ? `${boat.name} (${boat.code})` : 'Unknown Boat';
    } else if (order.address) {
      return `${order.address.island}, ${order.address.atoll}`;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Batch not found</div>
      </div>
    );
  }

  return (
    <div>
      {/* Print button */}
      <div className="no-print bg-gray-50 p-4 flex justify-between items-center border-b">
        <Link to={`/admin/batches/${batch.id}`} className="text-blue-600 hover:text-blue-800">
          ê Back to Batch
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print Manifest
        </button>
      </div>

      {/* Manifest content */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Delivery Manifest - {batch.title}
          </h1>
          <p className="text-gray-600">Date: {formatDate(new Date().toISOString())}</p>
          <p className="text-gray-600">Total Orders: {orders.length}</p>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">#</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Short Code</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Qty</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Destination</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Contact</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id}>
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2 font-bold">{order.shortCode}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.product.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">{order.qty}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {getDestinationString(order)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.address ? (
                    <>
                      {order.address.contactName}
                      <br />
                      {order.address.contactPhone}
                    </>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm">
                  {order.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 border-t pt-4 text-sm text-gray-600">
          <p>Prepared by: Lonumirus Delivery System</p>
          <p>Signature: _______________________</p>
        </div>
      </div>
    </div>
  );
}
