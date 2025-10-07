import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getById, getAll } from '../../lib/db';
import { generateQRCode } from '../../lib/qr';
import type { Batch, Order, Boat } from '../../types';

export function PrintLabelsPage() {
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
      return boat ? `${boat.name}` : 'Unknown Boat';
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

  if (!batch || orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No orders found</div>
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
          Print Labels
        </button>
      </div>

      {/* Labels - 58mm thermal printer format */}
      <div className="print-labels">
        {orders.map((order) => (
          <div key={order.id} className="label-page">
            <div className="label-content">
              <div className="label-header">
                <div className="text-4xl font-black mb-2">{order.shortCode}</div>
                <div className="text-sm font-medium mb-1">
                  {order.product.name} ◊ {order.qty}
                </div>
              </div>

              <div className="label-destination">
                <div className="text-xs text-gray-600 mb-1">Destination:</div>
                <div className="text-sm font-semibold">{getDestinationString(order)}</div>
                {order.address && (
                  <div className="text-xs mt-1">
                    {order.address.contactName} - {order.address.contactPhone}
                  </div>
                )}
              </div>

              <div className="label-qr">
                <img
                  src={generateQRCode(order.id, 120)}
                  alt={`QR for ${order.shortCode}`}
                  className="qr-code"
                />
              </div>

              <div className="label-footer text-xs text-gray-500">
                Lonumirus Delivery
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .label-page {
            width: 58mm;
            page-break-after: always;
            padding: 4mm;
            box-sizing: border-box;
          }

          .label-page:last-child {
            page-break-after: auto;
          }

          .label-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            font-family: Arial, sans-serif;
          }

          .label-header {
            margin-bottom: 3mm;
          }

          .label-destination {
            margin-bottom: 3mm;
            width: 100%;
          }

          .label-qr {
            margin-bottom: 2mm;
          }

          .qr-code {
            width: 30mm;
            height: 30mm;
          }

          .label-footer {
            font-size: 8pt;
          }
        }

        @media screen {
          .print-labels {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(58mm, 1fr));
            gap: 10mm;
            padding: 10mm;
          }

          .label-page {
            border: 1px solid #ccc;
            padding: 4mm;
            background: white;
          }

          .label-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .label-header {
            margin-bottom: 3mm;
          }

          .label-destination {
            margin-bottom: 3mm;
          }

          .label-qr {
            margin-bottom: 2mm;
          }

          .qr-code {
            width: 30mm;
            height: 30mm;
          }
        }
      `}</style>
    </div>
  );
}
