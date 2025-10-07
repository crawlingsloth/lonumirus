import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBoatBySlug } from '../../lib/db';
import { renderMarkdown } from '../../lib/utils';
import type { Boat } from '../../types';

export function PublicBoatDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      loadBoat(slug);
    }
  }, [slug]);

  const loadBoat = async (boatSlug: string) => {
    try {
      setLoading(true);
      const data = await getBoatBySlug(boatSlug);
      if (data && data.active) {
        setBoat(data);
        // Set selected image to cover or first image
        const coverIndex = data.images.findIndex(img => img.isCover);
        setSelectedImageIndex(coverIndex >= 0 ? coverIndex : 0);
      } else {
        setBoat(null);
      }
    } catch (error) {
      console.error('Failed to load boat', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading boat details...</div>
      </div>
    );
  }

  if (!boat) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Boat not found</p>
          <Link to="/boats" className="text-blue-600 hover:text-blue-800">
            View all boats
          </Link>
        </div>
      </div>
    );
  }

  const selectedImage = boat.images[selectedImageIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/boats" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Boats
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          {boat.images.length > 0 ? (
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <img
                  src={selectedImage.dataUrl}
                  alt={selectedImage.caption || boat.name}
                  className="w-full h-96 object-cover"
                />
                {selectedImage.caption && (
                  <div className="p-3 bg-gray-50 text-sm text-gray-700">
                    {selectedImage.caption}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {boat.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {boat.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`rounded-lg overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex
                          ? 'border-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.dataUrl}
                        alt={image.caption || `${boat.name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center text-gray-500">
              No images available
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{boat.name}</h1>
            <p className="text-gray-600">Code: {boat.code}</p>
          </div>

          {boat.summary && (
            <div>
              <p className="text-lg text-gray-700">{boat.summary}</p>
            </div>
          )}

          {/* CTA Button */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Order for this boat
            </h3>
            <p className="text-gray-700 mb-4">
              Place your order and select this boat for delivery
            </p>
            <Link
              to="/customer/new-order"
              className="inline-block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Place Order
            </Link>
          </div>
        </div>
      </div>

      {/* About Section */}
      {boat.aboutMd && (
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <div
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(boat.aboutMd) }}
          />
        </div>
      )}

      {/* Delivery Notes Section */}
      {boat.deliveryNotesMd && (
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-8">
          <div
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(boat.deliveryNotesMd) }}
          />
        </div>
      )}
    </div>
  );
}
