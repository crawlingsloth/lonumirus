import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAll } from '../../lib/db';
import type { Boat } from '../../types';

export function PublicBoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoats();
  }, []);

  const loadBoats = async () => {
    try {
      setLoading(true);
      const data = await getAll<Boat>('boats');
      const activeBoats = data.filter(b => b.active);
      setBoats(activeBoats);
    } catch (error) {
      console.error('Failed to load boats', error);
    } finally {
      setLoading(false);
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Boats</h1>
        <p className="text-gray-600">Choose your delivery boat</p>
      </div>

      {boats.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No boats available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boats.map((boat) => (
            <Link
              key={boat.id}
              to={`/boats/${boat.slug}`}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition-shadow"
            >
              {getCoverImage(boat) && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={getCoverImage(boat)}
                    alt={boat.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{boat.name}</h3>
                    <p className="text-sm text-gray-600">Code: {boat.code}</p>
                  </div>
                </div>
                {boat.summary && (
                  <p className="text-gray-700 mt-3 line-clamp-3">{boat.summary}</p>
                )}
                <div className="mt-4">
                  <span className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                    View Details
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
