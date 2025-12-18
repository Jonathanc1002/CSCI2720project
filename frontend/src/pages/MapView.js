import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLocations } from '../services/locationService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapView() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0 && !leafletMapRef.current) {
      initializeMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllLocations({});
      setLocations(data);
      if (data.length > 0) {
        setSelectedLocation(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      setError('Failed to load locations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    // Create map centered on Hong Kong
    const map = L.map(mapRef.current).setView([22.3193, 114.1694], 11);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    leafletMapRef.current = map;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Create bounds to fit all markers
    const bounds = L.latLngBounds();

    // Create custom icon with letters
    const createCustomIcon = (label) => {
      return L.divIcon({
        className: 'custom-marker-icon',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
            background: #007bff;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${label}
          </div>
          <div style="
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 12px solid #007bff;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
          "></div>
        `,
        iconSize: [40, 52],
        iconAnchor: [20, 52],
        popupAnchor: [0, -52]
      });
    };

    // Add markers for all locations
    locations.forEach((location, index) => {
      const label = String.fromCharCode(65 + (index % 26));
      const position = [parseFloat(location.latitude), parseFloat(location.longitude)];

      // Create custom icon
      const icon = createCustomIcon(label);

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'leaflet-popup-custom';
      popupContent.style.cssText = 'min-width: 250px; padding: 5px;';
      popupContent.innerHTML = `
        <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">
          ${label}. ${location.name}
        </h3>
        <div style="margin: 8px 0; color: #666; font-size: 14px; line-height: 1.8;">
          <div style="display: flex; margin-bottom: 6px;">
            <span style="font-weight: 600; min-width: 80px;">Area:</span>
            <span>${location.area || 'N/A'}</span>
          </div>
          <div style="display: flex; margin-bottom: 6px;">
            <span style="font-weight: 600; min-width: 80px;">Events:</span>
            <span style="color: #007bff; font-weight: 500;">${location.eventsCount || 0} events</span>
          </div>
          <div style="display: flex; margin-bottom: 8px;">
            <span style="font-weight: 600; min-width: 80px;">Location:</span>
            <span style="font-size: 12px; color: #888;">${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</span>
          </div>
        </div>
        <button 
          id="view-btn-${location._id}"
          style="
            display: block;
            width: 100%;
            margin-top: 12px;
            padding: 10px 16px;
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            text-decoration: none;
            box-shadow: 0 2px 4px rgba(0,123,255,0.3);
            transition: all 0.3s ease;
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,123,255,0.4)';"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,123,255,0.3)';"
        >
          View Details →
        </button>
      `;

      // Create marker and bind popup
      const marker = L.marker(position, { icon })
        .addTo(map)
        .bindPopup(popupContent);

      // Store original position and location data
      marker.originalLatLng = L.latLng(position);
      marker.locationId = location._id;
      marker.index = index;

      // Handle marker click
      marker.on('click', () => {
        setSelectedLocation(location);
      });

      // Add click handler for the button after popup opens
      marker.on('popupopen', () => {
        const button = document.getElementById(`view-btn-${location._id}`);
        if (button) {
          button.onclick = () => {
            navigate(`/locations/${location._id}`);
          };
        }
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Function to detect overlapping markers
    const findOverlappingMarkers = (hoveredMarker) => {
      const overlapping = [];
      const hoveredPos = map.latLngToContainerPoint(hoveredMarker.getLatLng());
      const threshold = 50; // pixels

      markersRef.current.forEach(marker => {
        if (marker !== hoveredMarker) {
          const markerPos = map.latLngToContainerPoint(marker.getLatLng());
          const distance = Math.sqrt(
            Math.pow(hoveredPos.x - markerPos.x, 2) + 
            Math.pow(hoveredPos.y - markerPos.y, 2)
          );
          
          if (distance < threshold) {
            overlapping.push(marker);
          }
        }
      });

      return overlapping;
    };

    // Function to spread overlapping markers
    const spreadMarkers = (hoveredMarker, overlapping) => {
      if (overlapping.length === 0) return;

      const allMarkers = [hoveredMarker, ...overlapping];
      const center = hoveredMarker.originalLatLng;
      const spreadDistance = 0.002; // degrees (approximately 200 meters)

      allMarkers.forEach((marker, idx) => {
        const angle = (idx / allMarkers.length) * 2 * Math.PI;
        const offsetLat = Math.sin(angle) * spreadDistance;
        const offsetLng = Math.cos(angle) * spreadDistance;
        
        const newPos = L.latLng(
          center.lat + offsetLat,
          center.lng + offsetLng
        );

        marker.setLatLng(newPos);
        marker._icon.style.transition = 'all 0.3s ease-out';
        marker._icon.style.zIndex = '1000';
      });
    };

    // Function to reset markers to original positions
    const resetMarkers = (markers) => {
      markers.forEach(marker => {
        marker.setLatLng(marker.originalLatLng);
        marker._icon.style.transition = 'all 0.3s ease-out';
        marker._icon.style.zIndex = '';
      });
    };

    // Add hover behavior to all markers with cluster persistence
    let spreadCluster = null; // Track currently spread cluster

    if (markersRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        if (!marker) return;
        
        marker.on('mouseover', () => {
          // Only spread if not already in a spread cluster
          if (!spreadCluster) {
            const overlapping = findOverlappingMarkers(marker);
            if (overlapping.length > 0) {
              spreadCluster = [marker, ...overlapping];
              spreadMarkers(marker, overlapping);
              
              // Add mouseout handlers to all markers in the cluster
              if (spreadCluster) {
                spreadCluster.forEach(clusterMarker => {
                  if (!clusterMarker) return;
                  
                  clusterMarker.once('mouseout', function checkIfLeftCluster() {
                    // Small delay to check if we entered another marker in the cluster
                    setTimeout(() => {
                      // Check if cursor is still over any marker in the cluster
                      let stillHovering = false;
                      if (spreadCluster) {
                        spreadCluster.forEach(m => {
                          if (m && m._icon && m._icon.matches(':hover')) {
                            stillHovering = true;
                          }
                        });
                      }
                      
                      // If not hovering over any cluster marker, reset
                      if (!stillHovering && spreadCluster) {
                        resetMarkers(spreadCluster);
                        spreadCluster = null;
                      } else if (stillHovering && clusterMarker) {
                        // Re-attach the listener if still hovering
                        clusterMarker.once('mouseout', checkIfLeftCluster);
                      }
                    }, 50);
                  });
                });
              }
            }
          }
        });
      });
    }

    // Fit map to show all markers
    if (locations.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
      
      // Ensure zoom is not too close
      if (map.getZoom() > 12) {
        map.setZoom(12);
      }

      // Open first marker's popup by default
      setTimeout(() => {
        if (markersRef.current.length > 0) {
          markersRef.current[0].openPopup();
        }
      }, 500);
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    
    // Find corresponding marker
    const marker = markersRef.current.find(m => m.locationId === location._id);
    if (marker && leafletMapRef.current) {
      // Pan to marker with animation
      const position = [parseFloat(location.latitude), parseFloat(location.longitude)];
      leafletMapRef.current.setView(position, 13, {
        animate: true,
        duration: 1
      });
      
      // Open popup
      setTimeout(() => {
        marker.openPopup();
      }, 500);
    }
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
        <div className="map-wrapper-full">
          {locations.length > 0 ? (
            <div ref={mapRef} className="leaflet-map" />
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
