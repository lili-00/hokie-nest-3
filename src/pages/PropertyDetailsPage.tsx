import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Check, Home, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ReviewSection from '../components/ReviewSection';
import type { Database } from '../types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  async function fetchProperty() {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <Home className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Property not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The property you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image Gallery */}
        <div className="relative h-96">
          <img
            src={property.images[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{property.title}</h1>
            <div className="flex items-center text-white">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{property.location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">${property.price.toLocaleString()}/mo</h2>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 mr-1" />
                  <span>{property.bedrooms} beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-1" />
                  <span>{property.bathrooms} baths</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-5 w-5 mr-1" />
                  <span>{property.square_feet.toLocaleString()} sqft</span>
                </div>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <h3 className="text-xl font-semibold mb-4">About this property</h3>
              <p className="text-gray-600">{property.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Highlights</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-center text-gray-600">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <ReviewSection propertyId={property.id} />
            </div>
          </div>

          {/* Contact Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Contact Landlord</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-gray-900">{property.landlord_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <a
                    href={`mailto:${property.landlord_email}`}
                    className="mt-1 text-primary hover:text-primary-hover"
                  >
                    {property.landlord_email}
                  </a>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <a
                    href={`tel:${property.landlord_phone}`}
                    className="mt-1 text-primary hover:text-primary-hover"
                  >
                    {property.landlord_phone}
                  </a>
                </div>
                {user && (
                  <button
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Schedule Viewing
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Transportation</h3>
              <div className="space-y-2">
                {Object.entries(property.transportation as Record<string, string>).map(([type, details]) => (
                  <div key={type} className="text-gray-600">
                    <span className="font-medium capitalize">{type}:</span> {details}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}