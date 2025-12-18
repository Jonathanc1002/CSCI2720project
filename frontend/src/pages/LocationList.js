import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLocations } from '../api/locations';
import './LocationList.css';

function LocationList() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [keyword, setKeyword] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [distance, setDistance] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Available areas from locations
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    // Extract unique areas from locations
    const uniqueAreas = [...new Set(locations.map(loc => loc.area).filter(Boolean))];
    setAreas(uniqueAreas.sort());
  }, [locations]);

  const fetchLocations = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLocations(filters);
      const data = response.data;
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setError('Failed to load locations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const filters = {};
    if (keyword) filters.keyword = keyword;
    if (selectedArea) filters.area = selectedArea;
    if (distance) filters.distance = parseFloat(distance);
    
    fetchLocations(filters);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedArea('');
    setDistance('');
    setSortBy('name');
    fetchLocations();
  };

  // Local sorting (after fetching from API)
  const sortedLocations = [...locations].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'area':
        return (a.area || '').localeCompare(b.area || '');
      case 'events':
        return (b.eventsCount || 0) - (a.eventsCount || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="location-list-container">
        <div className="loading">Loading locations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="location-list-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchLocations} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="location-list-container">
      <div className="location-list-header">
        <h1>Locations</h1>
        
        {/* Filter Section */}
        <div className="filters-section">
          <div className="filter-row">
            <div className="filter-group">
              <label>Keyword</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </div>

            <div className="filter-group">
              <label>Area</label>
              <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                <option value="">All Areas</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Distance (km)</label>
              <input
                type="number"
                placeholder="Max distance"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Name</option>
                <option value="area">Area</option>
                <option value="events">Number of Events</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={handleApplyFilters} className="btn-apply">
              Apply Filters
            </button>
            <button onClick={handleClearFilters} className="btn-clear">
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <div className="results-count">
          Showing {sortedLocations.length} location{sortedLocations.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Locations List */}
      <div className="locations-list">
        {sortedLocations.map(location => (
          <div key={location._id} className="location-list-item">
            <div className="location-info-section">
              <h3>{location.name}</h3>
              <div className="location-details">
                <span className="detail-item">
                  <strong>Area:</strong> {location.area || 'N/A'}
                </span>
                <span className="detail-item">
                  <strong>Events:</strong> {location.eventsCount || 0}
                </span>
                <span className="detail-item">
                  <strong>Coordinates:</strong> {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                </span>
              </div>
            </div>
            <Link to={`/locations/${location._id}`} className="btn-view-location">
              View Details →
            </Link>
          </div>
        ))}
      </div>

      {sortedLocations.length === 0 && !loading && !error && (
        <p className="no-results">
          No locations found with the selected filters. Try adjusting your search criteria.
        </p>
      )}
    </div>
  );
}

export default LocationList;
