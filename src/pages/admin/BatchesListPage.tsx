import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAll, add } from '../../lib/db';
import { generateId } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import type { Batch, BatchStatus } from '../../types';

export function BatchesListPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await getAll<Batch>('batches');
      setBatches(data);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Delivery Batches</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Batch
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No batches yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create your first batch
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{batch.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getBatchStatusBadge(batch.status)}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{batch.orderIds.length} orders</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/admin/batches/${batch.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateBatchModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(batchId) => {
            setShowCreateModal(false);
            loadBatches();
            showToast('Batch created successfully', 'success');
            // Navigate to batch detail
            window.location.hash = `/admin/batches/${batchId}`;
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}

interface CreateBatchModalProps {
  onClose: () => void;
  onSuccess: (batchId: string) => void;
  onError: (message: string) => void;
}

function CreateBatchModal({ onClose, onSuccess, onError }: CreateBatchModalProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      onError('Title is required');
      return;
    }

    try {
      setLoading(true);
      const batchId = generateId('batch');
      const newBatch: Batch = {
        id: batchId,
        title: title.trim(),
        status: 'planning',
        orderIds: [],
      };
      await add('batches', newBatch);
      onSuccess(batchId);
    } catch (error) {
      onError('Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Create Batch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Run - Jan 15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Batch'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
