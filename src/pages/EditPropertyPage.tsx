import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Partial<PropertyUpdate>>({
    title: '',
    description: '',
    address: '',
    location: '',
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 0,
    is_furnished: false,
    amenities: [],
    highlights: [],
    images: [],
    transportation: {
      metro: '',
      bus: '',
      bike: '',
      parking: '',
    },
  });

  useEffect(() => {
    if (!user || profile?.role !== 'landlord') {
      navigate('/');
      return;
    }
    fetchProperty();
  }, [id, user]);

  async function fetchProperty() {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        navigate('/profile');
        return;
      }

      // Verify ownership
      if (data.landlord_id !== user?.id) {
        navigate('/profile');
        return;
      }

      setProperty(data);
      setFormData({
        title: data.title,
        description: data.description,
        address: data.address,
        location: data.location,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        square_feet: data.square_feet,
        is_furnished: data.is_furnished,
        amenities: data.amenities,
        highlights: data.highlights,
        images: data.images,
        transportation: data.transportation as Record<string, string>,
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      navigate('/profile');
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleArrayInput = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'amenities' | 'highlights' | 'images') => {
    const items = e.target.value.split('\n').filter(item => item.trim() !== '');
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleTransportationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      transportation: {
        ...(prev.transportation as Record<string, string>),
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user || !profile || !id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('properties')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Property updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property listing');
    } finally {
      setLoading(false);
    }
  };

  if (!property) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Edit className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Property Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Monthly Rent ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                required
                min="0"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                required
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="square_feet" className="block text-sm font-medium text-gray-700">
                Square Feet
              </label>
              <input
                type="number"
                id="square_feet"
                name="square_feet"
                required
                min="0"
                value={formData.square_feet}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_furnished"
                checked={formData.is_furnished}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Furnished</span>
            </label>
          </div>

          <div>
            <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">
              Amenities (one per line)
            </label>
            <textarea
              id="amenities"
              required
              value={formData.amenities?.join('\n')}
              onChange={(e) => handleArrayInput(e, 'amenities')}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="In-unit Washer/Dryer&#10;Central Air&#10;Dishwasher"
            />
          </div>

          <div>
            <label htmlFor="highlights" className="block text-sm font-medium text-gray-700">
              Highlights (one per line)
            </label>
            <textarea
              id="highlights"
              required
              value={formData.highlights?.join('\n')}
              onChange={(e) => handleArrayInput(e, 'highlights')}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Recently renovated&#10;Pet friendly&#10;Close to campus"
            />
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
              Image URLs (one per line)
            </label>
            <textarea
              id="images"
              required
              value={formData.images?.join('\n')}
              onChange={(e) => handleArrayInput(e, 'images')}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transportation Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="metro" className="block text-sm font-medium text-gray-700">
                  Metro Access
                </label>
                <input
                  type="text"
                  id="metro"
                  name="metro"
                  value={(formData.transportation as Record<string, string>)?.metro || ''}
                  onChange={handleTransportationChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="5 min walk to Potomac Yard Metro"
                />
              </div>

              <div>
                <label htmlFor="bus" className="block text-sm font-medium text-gray-700">
                  Bus Service
                </label>
                <input
                  type="text"
                  id="bus"
                  name="bus"
                  value={(formData.transportation as Record<string, string>)?.bus || ''}
                  onChange={handleTransportationChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="VT Shuttle Stop nearby"
                />
              </div>

              <div>
                <label htmlFor="bike" className="block text-sm font-medium text-gray-700">
                  Bike Access
                </label>
                <input
                  type="text"
                  id="bike"
                  name="bike"
                  value={(formData.transportation as Record<string, string>)?.bike || ''}
                  onChange={handleTransportationChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Capital Bikeshare station on-site"
                />
              </div>

              <div>
                <label htmlFor="parking" className="block text-sm font-medium text-gray-700">
                  Parking
                </label>
                <input
                  type="text"
                  id="parking"
                  name="parking"
                  value={(formData.transportation as Record<string, string>)?.parking || ''}
                  onChange={handleTransportationChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="2 parking spots included"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}