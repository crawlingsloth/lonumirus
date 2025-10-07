import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getById, add, update } from '../../lib/db';
import { generateId, slugify, fileToBase64 } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import type { Boat, BoatImage } from '../../types';

export function BoatFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [boat, setBoat] = useState<Boat>({
    id: generateId('boat'),
    code: '',
    name: '',
    slug: '',
    active: true,
    summary: '',
    aboutMd: '',
    deliveryNotesMd: '',
    images: [],
  });

  const isEditMode = !!id;

  useEffect(() => {
    if (id) {
      loadBoat(id);
    }
  }, [id]);

  const loadBoat = async (boatId: string) => {
    try {
      setLoading(true);
      const data = await getById<Boat>('boats', boatId);
      if (data) {
        setBoat(data);
      } else {
        showToast('Boat not found', 'error');
        navigate('/admin/boats');
      }
    } catch (error) {
      showToast('Failed to load boat', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setBoat({
      ...boat,
      name,
      slug: slugify(name),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newImages: BoatImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await fileToBase64(files[i]);
        newImages.push({
          id: generateId('img'),
          dataUrl,
          caption: '',
          sortOrder: boat.images.length + i,
          isCover: boat.images.length === 0 && i === 0, // First image is cover by default
        });
      }
      setBoat({ ...boat, images: [...boat.images, ...newImages] });
      showToast(`${newImages.length} image(s) uploaded`, 'success');
    } catch (error) {
      showToast('Failed to upload images', 'error');
    }
  };

  const handleImageCaptionChange = (imageId: string, caption: string) => {
    setBoat({
      ...boat,
      images: boat.images.map(img =>
        img.id === imageId ? { ...img, caption } : img
      ),
    });
  };

  const handleSetCover = (imageId: string) => {
    setBoat({
      ...boat,
      images: boat.images.map(img => ({
        ...img,
        isCover: img.id === imageId,
      })),
    });
  };

  const handleMoveImage = (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = boat.images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= boat.images.length) return;

    const newImages = [...boat.images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    // Update sort orders
    newImages.forEach((img, idx) => {
      img.sortOrder = idx;
    });

    setBoat({ ...boat, images: newImages });
  };

  const handleDeleteImage = (imageId: string) => {
    if (!confirm('Delete this image?')) return;

    const newImages = boat.images.filter(img => img.id !== imageId);

    // If deleted image was cover and there are other images, make first one cover
    if (boat.images.find(img => img.id === imageId)?.isCover && newImages.length > 0) {
      newImages[0].isCover = true;
    }

    // Update sort orders
    newImages.forEach((img, idx) => {
      img.sortOrder = idx;
    });

    setBoat({ ...boat, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!boat.code || !boat.name) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isEditMode) {
        await update('boats', boat);
        showToast('Boat updated successfully', 'success');
      } else {
        await add('boats', boat);
        showToast('Boat created successfully', 'success');
      }
      navigate('/admin/boats');
    } catch (error) {
      showToast('Failed to save boat', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/admin/boats" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Boats
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEditMode ? 'Edit Boat' : 'Add Boat'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={boat.code}
              onChange={(e) => setBoat({ ...boat, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., NEJ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={boat.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Nejma"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (auto-generated)
            </label>
            <input
              type="text"
              value={boat.slug}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={boat.active}
              onChange={(e) => setBoat({ ...boat, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
              Active (visible to customers)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary
            </label>
            <textarea
              value={boat.summary}
              onChange={(e) => setBoat({ ...boat, summary: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description for boat cards"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Content</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About (Markdown)
            </label>
            <textarea
              value={boat.aboutMd}
              onChange={(e) => setBoat({ ...boat, aboutMd: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="## About this boat&#10;&#10;Details about the boat..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Notes (Markdown)
            </label>
            <textarea
              value={boat.deliveryNotesMd}
              onChange={(e) => setBoat({ ...boat, deliveryNotesMd: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="## Delivery Information&#10;&#10;Delivery schedule and notes..."
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Gallery</h2>
            <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              Upload Images
            </label>
          </div>

          {boat.images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No images uploaded yet. Upload at least one image.
            </div>
          ) : (
            <div className="space-y-4">
              {boat.images.map((image, index) => (
                <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={image.dataUrl}
                      alt={image.caption || `Image ${index + 1}`}
                      className="w-full sm:w-32 h-32 object-cover rounded"
                    />
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={image.caption}
                        onChange={(e) => handleImageCaptionChange(image.id, e.target.value)}
                        placeholder="Image caption (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        {image.isCover ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            Cover Image
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetCover(image.id)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                          >
                            Set as Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleMoveImage(image.id, 'up')}
                          disabled={index === 0}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          Move Up
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(image.id, 'down')}
                          disabled={index === boat.images.length - 1}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          Move Down
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Boat' : 'Create Boat'}
          </button>
          {isEditMode && (
            <Link
              to={`/boats/${boat.slug}`}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-center"
            >
              View Public Page
            </Link>
          )}
          <Link
            to="/admin/boats"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-center"
          >
            Cancel
          </Link>
        </div>
      </form>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
