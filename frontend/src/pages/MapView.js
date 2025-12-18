import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllLocations } from '../services/locationService';
import './MapView.css';

function MapView() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigate = useNavigate();

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

  // Generate regular Google Maps URL for iframe
  const getMapUrl = () => {
    if (locations.length === 0) return '';
    
    // Use regular maps view centered on Hong Kong
    const centerLat = 22.3193;
    const centerLon = 114.1694;
    
    return `https://www.google.com/maps?q=${centerLat},${centerLon}&z=11&output=embed`;
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
            <>
              <iframe
                className="map-iframe"
                src={getMapUrl()}
                title="Map of all locations"
                frameBorder="0"
                allowFullScreen
              />
              <div className="map-overlay-markers">
                {locations.map((location, index) => {
                  // Calculate position based on actual lat/lng coordinates
                  // Map center: 22.3193, 114.1694 (Hong Kong)
                  const centerLat = 22.3193;
                  const centerLng = 114.1694;
                  
                  // At zoom level 11, approximate degrees per pixel
                  // For Hong Kong area, this provides reasonable accuracy
                  const latRange = 0.3; // visible latitude range at zoom 11
                  const lngRange = 0.4; // visible longitude range at zoom 11
                  
                  // Calculate percentage offset from center
                  const latDiff = location.latitude - centerLat;
                  const lngDiff = location.longitude - centerLng;
                  
                  // Convert to percentage (50% = center)
                  // Latitude: positive = north (top), negative = south (bottom)
                  // Longitude: positive = east (right), negative = west (left)
                  const top = 50 - (latDiff / latRange * 100);
                  const left = 50 + (lngDiff / lngRange * 100);
                  
                  const label = String.fromCharCode(65 + (index % 26));
                  
                  return (
                    <div
                      key={location._id}
                      className="overlay-marker"
                      style={{
                        top: `${top}%`,
                        left: `${left}%`
                      }}
                      onClick={() => navigate(`/locations/${location._id}`)}
                      title={`${label}: ${location.name}`}
                    >
                      <span className="marker-label">{label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="map-legend">
                <h3>Venue List</h3>
                <div className="legend-items">
                  {locations.map((location, index) => {
                    const label = String.fromCharCode(65 + (index % 26));
                    return (
                      <div
                        key={location._id}
                        className="legend-item"
                        onClick={() => navigate(`/locations/${location._id}`)}
                      >
                        <span className="legend-marker">{label}</span>
                        <span className="legend-name">{location.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>No locations available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapView;
