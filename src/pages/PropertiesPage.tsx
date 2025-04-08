import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, Plus, Loader, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

interface FilterState {
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  furnished: boolean;
  amenities: string[];
}

const COMMON_AMENITIES = [
  'In-unit Washer/Dryer',
  'Central AC/Heat',
  'Dishwasher',
  'High-Speed Internet',
  'Fitness Center',
  'Parking',
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { user, profile } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    furnished: false,
    amenities: [],
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (field: keyof FilterState, value: string | boolean | string[]) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      furnished: false,
      amenities: [],
    });
    setSearchTerm('');
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice = 
      (!filters.minPrice || property.price >= parseInt(filters.minPrice)) &&
      (!filters.maxPrice || property.price <= parseInt(filters.maxPrice));

    const matchesBedrooms = 
      !filters.bedrooms || property.bedrooms === parseInt(filters.bedrooms);

    const matchesFurnished = 
      !filters.furnished || property.is_furnished === filters.furnished;

    const matchesAmenities = 
      filters.amenities.length === 0 || 
      filters.amenities.every(amenity => property.amenities.includes(amenity));

    return matchesSearch && matchesPrice && matchesBedrooms && matchesFurnished && matchesAmenities;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Properties</h1>
        {profile?.role === 'landlord' && (
          <Link
            to="/properties/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            List Property
          </Link>
        )}
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties by title, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-1 focus:ring-primary focus:border-primary"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">Any</option>
                  <option value="0">Studio</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Furnished
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.furnished}
                    onChange={(e) => handleFilterChange('furnished', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-600">Furnished only</span>
                </label>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.amenities.includes(amenity)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Home className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || Object.values(filters).some(v => v !== '' && v !== false && v.length !== 0)
              ? 'Try adjusting your search terms or filters'
              : 'Check back later for new listings'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <Link
              key={property.id}
              to={`/properties/${property.id}`}
              className="block hover:shadow-lg transition-shadow duration-200"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img
                    src={property.images[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80'}
                    alt={property.title}
                    className="object-cover w-full h-48"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-xl font-semibold">${property.price.toLocaleString()}/mo</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{property.bedrooms} {property.bedrooms === 0 ? 'Studio' : `bed${property.bedrooms > 1 ? 's' : ''}`}</span>
                    <span>•</span>
                    <span>{property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{property.square_feet.toLocaleString()} sqft</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}