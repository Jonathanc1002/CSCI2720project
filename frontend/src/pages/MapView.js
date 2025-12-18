import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllLocations } from '../services/locationService';
import './MapView.css';

function MapView() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllLocations({});
      setLocations(data);
      if (data.length > 0) {
        setSelectedLocation(data[0]); // Select first location by default
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setError('Failed to load locations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  // Generate map URL with all locations as markers
  const getMapUrlWithAllMarkers = () => {
    if (locations.length === 0) return '';
    
    // Build the base URL
    let baseUrl = 'https://maps.google.com/maps?';
    
    // Add all markers
    const markersParam = locations.map((loc, index) => {
      const label = String.fromCharCode(65 + (index % 26)); // A, B, C, etc.
      return `&markers=color:red%7Clabel:${label}%7C${loc.latitude},${loc.longitude}`;
    }).join('');
    
    // Center on selected location or Hong Kong center
    const center = selectedLocation 
      ? `${selectedLocation.latitude},${selectedLocation.longitude}`
      : '22.3193,114.1694';
    
    // Build final URL
    return `${baseUrl}q=${center}&ll=${center}&z=11${markersParam}&output=embed`;
  };

  if (loading) {
    return (
      <div className="map-view-container">
        <div className="loading">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-view-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="map-view-container">
      <div className="map-header">
        <h1>All Locations Map</h1>
        <p className="map-subtitle">
          Displaying {locations.length} venue{locations.length !== 1 ? 's' : ''} across Hong Kong
        </p>
      </div>

      <div className="map-content">
        <div className="locations-sidebar">
          <h2>Venues</h2>
          <div className="locations-list">
            {locations.map((location) => (
              <div
                key={location._id}
                className={`location-item ${
                  selectedLocation?._id === location._id ? 'selected' : ''
                }`}
                onClick={() => handleLocationClick(location)}
              >
                <h3>{location.name}</h3>
                <div className="location-info">
                  <span className="area">{location.area}</span>
                  <span className="events">{location.eventsCount || 0} events</span>
                </div>
                <Link
                  to={`/locations/${location._id}`}
                  className="view-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="map-wrapper">
          {locations.length > 0 ? (
            <iframe
              className="google-map"
              src={getMapUrlWithAllMarkers()}
              title="Map of all locations"
              frameBorder="0"
              allowFullScreen
            />
          ) : (
            <div className="no-selection">
              <p>No locations available</p>
            </div>
          )}
          {selectedLocation && (
            <div className="map-info-overlay">
              <h3>{selectedLocation.name}</h3>
              <p><strong>Area:</strong> {selectedLocation.area}</p>
              <p><strong>Events:</strong> {selectedLocation.eventsCount || 0}</p>
              <Link to={`/locations/${selectedLocation._id}`} className="overlay-link">
                View Full Details →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapView;
