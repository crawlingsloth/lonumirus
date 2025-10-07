import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getById, getAll } from '../../lib/db';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import { StatusBadge } from '../../components/StatusBadge';
import type { Order, Boat } from '../../types';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const orderData = await getById<Order>('orders', orderId);

      if (!orderData) {
        showToast('Order not found', 'error');
        return;
      }

      setOrder(orderData);

      if (orderData.boatId) {
        const boatData = await getById<Boat>('boats', orderData.boatId);
        setBoat(boatData || null);
      }
    } catch (error) {
      showToast('Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!order) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}#/share/order/${order.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Share link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <Link to="/customer/orders" className="text-blue-600 hover:text-blue-800">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/customer/orders" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
      </div>

      <div className="space-y-6">
        {/* Short Code */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Order Code</div>
            <div className="text-5xl font-bold text-gray-900 mb-4">{order.shortCode}</div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Product</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Product</span>
              <span className="text-gray-900 font-medium">{order.product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price per unit</span>
              <span className="text-gray-900">{formatCurrency(order.product.priceMvr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity</span>
              <span className="text-gray-900">{order.qty}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-gray-900 font-semibold">Total</span>
              <span className="text-gray-900 font-bold text-lg">{formatCurrency(order.totalMvr)}</span>
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Destination</h2>
          {order.destinationType === 'boat' ? (
            <div>
              <div className="text-sm text-gray-600 mb-1">Boat Delivery</div>
              <div className="text-lg font-medium text-gray-900">{boat?.name || 'Unknown Boat'}</div>
              {boat && <div className="text-sm text-gray-600">Code: {boat.code}</div>}
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="text-gray-900">{order.address?.addressLine}</div>
                <div className="text-gray-900">{order.address?.island}, {order.address?.atoll}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Contact</div>
                <div className="text-gray-900">{order.address?.contactName}</div>
                <div className="text-gray-900">{order.address?.contactPhone}</div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            <div className="text-gray-700 bg-gray-50 p-3 rounded">{order.notes}</div>
          </div>
        )}

        {/* Payment Slip */}
        {order.paymentSlipDataUrl && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment Slip</h2>
            <img
              src={order.paymentSlipDataUrl}
              alt="Payment Slip"
              className="max-w-full h-auto rounded border border-gray-200"
            />
          </div>
        )}

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date</span>
              <span className="text-gray-900">{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        {/* Share Link */}
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={handleCopyShareLink}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Copy Share Link
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Share this order with others
          </p>
        </div>
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
