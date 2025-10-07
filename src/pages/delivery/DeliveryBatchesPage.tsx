import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAll } from '../../lib/db';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import type { Batch, BatchStatus } from '../../types';

export function DeliveryBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await getAll<Batch>('batches');
      // Show only active batches (not cancelled or completed)
      const activeBatches = data.filter(b => b.status !== 'cancelled');
      setBatches(activeBatches);
    } catch (error) {
      showToast('Failed to load batches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getBatchStatusBadge = (status: BatchStatus): string => {
    const classes = {
      planning: 'bg-gray-200 text-gray-800',
      loading: 'bg-blue-200 text-blue-800',
      out: 'bg-orange-200 text-orange-800',
      completed: 'bg-green-200 text-green-800',
      cancelled: 'bg-red-200 text-red-800',
    };
    return `px-3 py-1 rounded-full text-xs font-semibold ${classes[status]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading batches...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Delivery Batches</h1>

      {batches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No active batches</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <Link
              key={batch.id}
              to={`/delivery/batches/${batch.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{batch.title}</h3>
                <span className={getBatchStatusBadge(batch.status)}>
                  {batch.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {batch.orderIds.length} order(s)
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
