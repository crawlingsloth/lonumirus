import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAll, update, remove } from '../../lib/db';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import type { Boat } from '../../types';

export function BoatsListPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadBoats();
  }, []);

  const loadBoats = async () => {
    try {
      setLoading(true);
      const data = await getAll<Boat>('boats');
      setBoats(data);
    } catch (error) {
      showToast('Failed to load boats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (boat: Boat) => {
    try {
      const updated = { ...boat, active: !boat.active };
      await update('boats', updated);
      await loadBoats();
      showToast(`Boat ${updated.active ? 'activated' : 'deactivated'}`, 'success');
    } catch (error) {
      showToast('Failed to update boat', 'error');
    }
  };

  const handleDelete = async (boat: Boat) => {
    if (!confirm(`Are you sure you want to delete boat "${boat.name}"?`)) {
      return;
    }

    try {
      await remove('boats', boat.id);
      await loadBoats();
      showToast('Boat deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete boat', 'error');
    }
  };

  const getCoverImage = (boat: Boat): string | undefined => {
    const cover = boat.images.find(img => img.isCover);
    return cover?.dataUrl || boat.images[0]?.dataUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading boats...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Boats</h1>
        <Link
          to="/admin/boats/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Boat
        </Link>
      </div>

      {boats.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No boats yet</p>
          <Link
            to="/admin/boats/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create your first boat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boats.map((boat) => (
            <div key={boat.id} className="bg-white rounded-lg shadow overflow-hidden">
              {getCoverImage(boat) && (
                <img
                  src={getCoverImage(boat)}
                  alt={boat.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{boat.name}</h3>
                    <p className="text-sm text-gray-600">Code: {boat.code}</p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(boat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      boat.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {boat.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                {boat.summary && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{boat.summary}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/boats/${boat.slug}`}
                    className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                  >
                    View Public
                  </Link>
                  <Link
                    to={`/admin/boats/${boat.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(boat)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
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
