import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll, add, generateShortCode } from '../../lib/db';
import { getCurrentUser } from '../../lib/auth';
import { generateId, fileToBase64, formatCurrency } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import type { Order, Boat, ProductSku, Product, DestinationType } from '../../types';

const PRODUCTS: Product[] = [
  { sku: 'CHILLI-250G', name: 'Chilli Paste 250g', priceMvr: 75 },
  { sku: 'CHILLI-500G', name: 'Chilli Paste 500g', priceMvr: 140 },
];

export function NewOrderPage() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    productSku: 'CHILLI-250G' as ProductSku,
    qty: 1,
    destinationType: 'boat' as DestinationType,
    boatId: '',
    address: {
      addressLine: '',
      island: '',
      atoll: '',
      contactName: '',
      contactPhone: '',
    },
    paymentSlipFile: null as File | null,
    paymentSlipDataUrl: '',
    notes: '',
  });

  useEffect(() => {
    loadBoats();
  }, []);

  const loadBoats = async () => {
    try {
      const data = await getAll<Boat>('boats');
      const activeBoats = data.filter(b => b.active);
      setBoats(activeBoats);
      if (activeBoats.length > 0) {
        setFormData(prev => ({ ...prev, boatId: activeBoats[0].id }));
      }
    } catch (error) {
      showToast('Failed to load boats', 'error');
    }
  };

  const handlePaymentSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToBase64(file);
      setFormData({
        ...formData,
        paymentSlipFile: file,
        paymentSlipDataUrl: dataUrl,
      });
    } catch (error) {
      showToast('Failed to upload payment slip', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user) {
      showToast('Please log in', 'error');
      return;
    }

    // Validate
    if (formData.destinationType === 'boat' && !formData.boatId) {
      showToast('Please select a boat', 'error');
      return;
    }

    if (formData.destinationType === 'address') {
      if (!formData.address.island || !formData.address.atoll || !formData.address.contactName || !formData.address.contactPhone) {
        showToast('Please fill in all address fields', 'error');
        return;
      }
    }

    try {
      setLoading(true);

      const product = PRODUCTS.find(p => p.sku === formData.productSku)!;
      const shortCode = await generateShortCode();

      const order: Order = {
        id: generateId('order'),
        shortCode,
        customerId: user.id,
        createdAt: new Date().toISOString(),
        status: 'submitted',
        product,
        qty: formData.qty,
        totalMvr: product.priceMvr * formData.qty,
        destinationType: formData.destinationType,
        boatId: formData.destinationType === 'boat' ? formData.boatId : undefined,
        address: formData.destinationType === 'address' ? formData.address : undefined,
        paymentSlipDataUrl: formData.paymentSlipDataUrl || undefined,
        notes: formData.notes || undefined,
      };

      await add('orders', order);
      showToast('Order created successfully!', 'success');
      navigate('/customer/orders');
    } catch (error) {
      showToast('Failed to create order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = PRODUCTS.find(p => p.sku === formData.productSku)!;
  const total = selectedProduct.priceMvr * formData.qty;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Selection */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Product</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRODUCTS.map((product) => (
                <label
                  key={product.sku}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.productSku === product.sku
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="product"
                    value={product.sku}
                    checked={formData.productSku === product.sku}
                    onChange={(e) => setFormData({ ...formData, productSku: e.target.value as ProductSku })}
                    className="sr-only"
                  />
                  <div className="font-semibold text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600">{formatCurrency(product.priceMvr)}</div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.qty}
              onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Destination</h2>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, destinationType: 'boat' })}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                formData.destinationType === 'boat'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Boat
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, destinationType: 'address' })}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                formData.destinationType === 'address'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Address
            </button>
          </div>

          {formData.destinationType === 'boat' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Boat <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.boatId}
                onChange={(e) => setFormData({ ...formData, boatId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={formData.destinationType === 'boat'}
              >
                <option value="">Select a boat...</option>
                {boats.map((boat) => (
                  <option key={boat.id} value={boat.id}>
                    {boat.name} ({boat.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address.addressLine}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, addressLine: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.destinationType === 'address'}
                  placeholder="e.g., House name, road"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Island <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.island}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, island: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formData.destinationType === 'address'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Atoll <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.atoll}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, atoll: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formData.destinationType === 'address'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address.contactName}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, contactName: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.destinationType === 'address'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.address.contactPhone}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, contactPhone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.destinationType === 'address'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Slip */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment Slip (Optional)</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Slip
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePaymentSlipUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {formData.paymentSlipDataUrl && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
              <img
                src={formData.paymentSlipDataUrl}
                alt="Payment Slip"
                className="max-w-full h-auto rounded border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Notes (Optional)</h2>

          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any special instructions or notes..."
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating Order...' : 'Place Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/customer/orders')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
